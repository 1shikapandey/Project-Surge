/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — RADAR PIXEL-MATCHING DIAGNOSTIC OVERLAY TOOL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Standalone debug script to visually sanity-check radar color-palette
 * matching accuracy for radar-imagery-service.ts.
 *
 * NOT part of the production pipeline, scheduled jobs, or API routes.
 *
 * Usage:
 *   npx tsx scripts/debug-radar-overlay.ts [chennai|mumbai|delhi]
 *   npx tsx scripts/debug-radar-overlay.ts --file=./path/to/radar.gif
 *
 * Outputs:
 *   - debug-output/{city}-latest.gif (raw downloaded GIF)
 *   - debug-output/{city}-overlay-{timestamp}.png (bright cyan pixel overlay PNG)
 *   - Console summary breakdown by rainfall intensity band
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { GifReader } from 'omggif';
import { PNG } from 'pngjs';
import {
  CityId,
  RADAR_STATION_CODES,
  RADAR_GEOREFERENCE,
  STATION_PALETTES,
  matchPixelToRainfallBand,
  RainfallColorBand,
} from '../src/lib/radar-imagery-service';

// ---------------------------------------------------------------------------
// 1. CONFIGURATION & CLI ARGUMENT PARSING
// ---------------------------------------------------------------------------

const DEFAULT_CITY: CityId = 'chennai';
const OUTPUT_DIR = path.join(process.cwd(), 'debug-output');

// Overlay marker color: Bright Cyan (RGBA: 0, 255, 255, 255)
// Bright Cyan does not exist in standard radar color scales (greens/yellows/reds/purples)
const OVERLAY_COLOR = { r: 0, g: 255, b: 255, a: 255 };

function parseArgs(): { cityId: CityId; localFilePath?: string } {
  const args = process.argv.slice(2);
  let cityId: CityId = DEFAULT_CITY;
  let localFilePath: string | undefined;

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      localFilePath = arg.split('=')[1];
    } else if (arg.startsWith('--city=')) {
      const c = arg.split('=')[1] as CityId;
      if (RADAR_STATION_CODES[c]) cityId = c;
    } else if (RADAR_STATION_CODES[arg as CityId]) {
      cityId = arg as CityId;
    }
  }

  return { cityId, localFilePath };
}

// ---------------------------------------------------------------------------
// 2. FETCH OR LOAD RADAR GIF
// ---------------------------------------------------------------------------

async function getRadarGifBuffer(
  cityId: CityId,
  localFilePath?: string
): Promise<{ buffer: Buffer; stationCode: string; sourceDescription: string }> {
  const stationCode = RADAR_STATION_CODES[cityId] || 'cni';

  if (localFilePath) {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Specified local file does not exist: ${localFilePath}`);
    }
    const buffer = fs.readFileSync(localFilePath);
    return {
      buffer,
      stationCode,
      sourceDescription: `Local file: ${localFilePath}`,
    };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const url = `https://mausamnow.com/api/v1/radar/${stationCode}/image/caz/latest.gif?t=${timestamp}`;

  console.log(`[DebugOverlay] Fetching latest ${cityId} (${stationCode}) GIF from: ${url}...`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SURGE-FloodNowcast/1.0 (Research; DebugDiagnostic)',
      'Accept': 'image/gif, image/*',
      'Referer': 'https://mausamnow.com/',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP fetch failed with status ${response.status} ${response.statusText}`);
  }

  const arrayBuf = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  return {
    buffer,
    stationCode,
    sourceDescription: `Remote URL: ${url}`,
  };
}

// ---------------------------------------------------------------------------
// 3. MAIN DIAGNOSTIC PIPELINE
// ---------------------------------------------------------------------------

async function runDiagnostic() {
  const { cityId, localFilePath } = parseArgs();
  const stationCode = RADAR_STATION_CODES[cityId];

  const palette = STATION_PALETTES[cityId] || STATION_PALETTES.chennai;

  console.log(`\n===========================================================================`);
  console.log(` AQUAALERT RADAR PIXEL-MATCHING DIAGNOSTIC OVERLAY TOOL`);
  console.log(` Target City: ${cityId.toUpperCase()} (Station: ${stationCode})`);
  console.log(` Palette Bands: ${palette.rainBands.length} color bands calibrated`);
  console.log(`===========================================================================\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Load GIF Buffer
  const { buffer: gifBuffer, sourceDescription } = await getRadarGifBuffer(cityId, localFilePath);
  console.log(`✔ GIF acquired (${gifBuffer.length} bytes). Source: ${sourceDescription}`);

  // Save raw GIF for side-by-side inspection
  const rawGifPath = path.join(OUTPUT_DIR, `${cityId}-latest.gif`);
  fs.writeFileSync(rawGifPath, gifBuffer);
  console.log(`✔ Raw GIF saved to: ${rawGifPath}`);

  // 2. Decode GIF Frame
  const reader = new GifReader(gifBuffer);
  const width = reader.width;
  const height = reader.height;

  console.log(`✔ GIF decoded: ${width}×${height} pixels, ${reader.numFrames()} frame(s).`);

  const rgbaBuffer = new Uint8Array(width * height * 4);
  reader.decodeAndBlitFrameRGBA(0, rgbaBuffer);

  // 3. Georeference & Content Area Config
  const geoConfig = RADAR_GEOREFERENCE[cityId];
  const ci = geoConfig ? geoConfig.contentInsets : { top: 0, right: 0, bottom: 0, left: 0 };

  console.log(
    `✔ Content Bounds: Left=${ci.left}, Right=${width - ci.right}, Top=${ci.top}, Bottom=${height - ci.bottom}`
  );

  // 4. Initialize PNG Overlay Image (dimensions matching GIF)
  const png = new PNG({ width, height });

  // Copy original RGBA pixels into PNG buffer
  for (let i = 0; i < rgbaBuffer.length; i++) {
    png.data[i] = rgbaBuffer[i];
  }

  // 5. Track Band Matches
  const bandCounts: Map<string, { band: RainfallColorBand; count: number }> = new Map();
  for (const band of palette.rainBands) {
    bandCounts.set(band.label, { band, count: 0 });
  }

  let totalContentPixels = 0;
  let totalMatchedRainPixels = 0;
  let sampledMatchedPixels = 0;
  let sampledTotalPixels = 0;

  // Step 2 is used in production for grid sampling (~1.1km resolution)
  const step = 2;

  // Evaluate every pixel (full pixel mask for PNG overlay)
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const r = rgbaBuffer[idx];
      const g = rgbaBuffer[idx + 1];
      const b = rgbaBuffer[idx + 2];
      const a = rgbaBuffer[idx + 3];

      // Check if within content insets
      const inContentArea =
        py >= ci.top && py < height - ci.bottom && px >= ci.left && px < width - ci.right;

      if (inContentArea) {
        totalContentPixels++;
      }

      // Check if sampled per production step
      const isProductionSampled =
        inContentArea &&
        (py - ci.top) % step === 0 &&
        (px - ci.left) % step === 0;

      if (isProductionSampled) {
        sampledTotalPixels++;
      }

      // Skip fully transparent pixels
      if (a < 128) continue;

      // Match RGB against station palette bands
      const matchedBand = matchPixelToRainfallBand(r, g, b, cityId);

      if (matchedBand && inContentArea) {
        totalMatchedRainPixels++;

        const entry = bandCounts.get(matchedBand.label);
        if (entry) entry.count++;

        if (isProductionSampled) {
          sampledMatchedPixels++;
        }

        // DRAW OVERLAY MARKER: Set pixel to Bright Cyan (0, 255, 255, 255)
        png.data[idx] = OVERLAY_COLOR.r;
        png.data[idx + 1] = OVERLAY_COLOR.g;
        png.data[idx + 2] = OVERLAY_COLOR.b;
        png.data[idx + 3] = OVERLAY_COLOR.a;
      }
    }
  }

  // 6. Save PNG Overlay Output
  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const overlayFileName = `${cityId}-overlay-${timestampStr}.png`;
  const overlayPath = path.join(OUTPUT_DIR, overlayFileName);
  const latestOverlayPath = path.join(OUTPUT_DIR, `${cityId}-overlay-latest.png`);

  const pngBuffer = PNG.sync.write(png);
  fs.writeFileSync(overlayPath, pngBuffer);
  fs.writeFileSync(latestOverlayPath, pngBuffer);

  console.log(`✔ Overlay PNG generated: ${overlayPath}`);
  console.log(`✔ Latest link saved:      ${latestOverlayPath}\n`);

  // 7. PRINT SUMMARY TABLE
  console.log(`===========================================================================`);
  console.log(` RAINFALL BAND PIXEL MATCH BREAKDOWN (${cityId.toUpperCase()})`);
  console.log(`===========================================================================`);
  console.log(
    `Total Image Size:     ${width} × ${height} (${width * height} px)\n` +
    `Content Area Evaluated: ${totalContentPixels} px\n` +
    `Total Rain Matches:    ${totalMatchedRainPixels} px (${((totalMatchedRainPixels / totalContentPixels) * 100).toFixed(2)}% of content area)\n` +
    `Production Sampled:    ${sampledMatchedPixels} / ${sampledTotalPixels} grid cells matched (${((sampledMatchedPixels / sampledTotalPixels) * 100).toFixed(2)}% confidence)`
  );
  console.log(`---------------------------------------------------------------------------`);
  console.log(
    `| Band Label               | Target RGB    | Range (mm/hr) | Matched Px | % Rain |`
  );
  console.log(`---------------------------------------------------------------------------`);

  for (const band of palette.rainBands) {
    const entry = bandCounts.get(band.label);
    const count = entry ? entry.count : 0;
    const pctOfRain =
      totalMatchedRainPixels > 0 ? ((count / totalMatchedRainPixels) * 100).toFixed(1) : '0.0';

    const labelPad = band.label.padEnd(24, ' ');
    const rgbStr = `(${band.r},${band.g},${band.b})`.padEnd(13, ' ');
    const rangeStr = `${band.mmHrMin}-${band.mmHrMax}`.padEnd(13, ' ');
    const countStr = String(count).padStart(10, ' ');
    const pctStr = `${pctOfRain}%`.padStart(6, ' ');

    console.log(`| ${labelPad} | ${rgbStr} | ${rangeStr} | ${countStr} | ${pctStr} |`);
  }

  console.log(`---------------------------------------------------------------------------`);

  // 8. SANITY CHECK ASSESSMENT
  console.log(`\n===========================================================================`);
  console.log(` PIXEL MATCH SANITY CHECK DIAGNOSIS`);
  console.log(`===========================================================================`);

  const traceBandCount = bandCounts.get('Trace / Mist')?.count || 0;
  const tracePctOfRain = totalMatchedRainPixels > 0 ? (traceBandCount / totalMatchedRainPixels) * 100 : 0;

  if (totalMatchedRainPixels === 0) {
    console.log(`⚠️  NO RAIN PIXELS MATCHED: Radar currently shows clear sky / no precipitation.`);
  } else if (tracePctOfRain > 85) {
    console.log(
      `⚠️  HIGH TRACE/MIST CLUSTERING (${tracePctOfRain.toFixed(1)}% of matches in Trace band): ` +
      `Check overlay PNG (${overlayFileName}) to confirm if light green background map features ` +
      `or coastlines are triggering false positives.`
    );
  } else {
    console.log(
      `✅ BALANCED DISTRIBUTION: Matches span multiple intensity bands. ` +
      `Open ${overlayFileName} side-by-side with ${cityId}-latest.gif to verify spatial alignment.`
    );
  }
  console.log(`===========================================================================\n`);
}

// Run script
runDiagnostic().catch(err => {
  console.error(`[DebugOverlay] Diagnostic failed with error:`, err);
  process.exit(1);
});
