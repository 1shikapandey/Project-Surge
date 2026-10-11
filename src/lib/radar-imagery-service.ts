/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIVE RADAR RAINFALL INTENSITY INGESTION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Fetches rendered radar composite imagery (CAZ product — rainfall intensity)
 * from mausamnow.com's API, decodes the GIF color palette per station to reconstruct
 * quantitative rainfall rates (mm/hr), and produces a spatial precipitation grid.
 *
 * Features Motion-Vector Advection Extrapolation:
 *   - Retains a rolling buffer of decoded frames per station (up to 9 frames ≈ 90 mins).
 *   - Computes optical-flow / block-matching storm motion vectors (direction + speed in km/h).
 *   - Projects spatial rain fields forward 0-3 hours along motion vectors.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CityId, CITIES } from './mock-data';
import {
  saveRadarGridToBlob,
  runScheduledBlobCleanupIfNeeded,
  getBlobStorageStatus,
  BlobStorageStatus,
} from './radar-blob-service';
export type { CityId };

// ---------------------------------------------------------------------------
// 1. CONFIGURATION
// ---------------------------------------------------------------------------

/** Radar station codes mapped to AquaAlert city IDs */
export const RADAR_STATION_CODES: Record<CityId, string> = {
  chennai: 'cni',    // Primary pilot station
  mumbai: 'vrv',
  delhi: 'delhi',
};

/** Default station for initial deployment */
export const DEFAULT_STATION: CityId = 'chennai';

const RADAR_IMAGE_URL_TEMPLATE =
  'https://mausamnow.com/api/v1/radar/{station}/image/caz/latest.gif?t={t}';

/** Descriptive User-Agent for responsible scraping */
const USER_AGENT =
  'SURGE-FloodNowcast/1.0 (Research; +https://github.com/1shikapandey/Project-Surge)';

/** Standard 10-minute fetch cadence */
const RADAR_FETCH_INTERVAL_MS = 10 * 60 * 1000; // 600,000 ms

/** Exponential backoff configuration */
const BACKOFF_INITIAL_MS = 2000;
const BACKOFF_MAX_MS = 60000;
const BACKOFF_MAX_RETRIES = 4;

/**
 * Minimum fraction of decoded pixels that must match a known rainfall band
 * or valid background for the result to be considered usable.
 */
export const CONFIDENCE_THRESHOLD = 0.30;

// ---------------------------------------------------------------------------
// 2. GEOREFERENCING — Static Affine Transform per City
// ---------------------------------------------------------------------------

export interface RadarGeoreferenceConfig {
  expectedWidth: number;
  expectedHeight: number;
  /** Geographic bounding box of the image content area */
  boundingBox: {
    minLat: number; maxLat: number;
    minLng: number; maxLng: number;
  };
  contentInsets: { top: number; right: number; bottom: number; left: number };
}

export const RADAR_GEOREFERENCE: Record<CityId, RadarGeoreferenceConfig> = {
  chennai: {
    expectedWidth: 748,
    expectedHeight: 599,
    boundingBox: {
      minLat: 10.5, maxLat: 15.5,
      minLng: 77.7, maxLng: 82.7,
    },
    contentInsets: { top: 30, right: 60, bottom: 30, left: 10 },
  },
  mumbai: {
    expectedWidth: 1400,
    expectedHeight: 1134,
    boundingBox: {
      minLat: 16.5, maxLat: 21.5,
      minLng: 70.3, maxLng: 75.3,
    },
    contentInsets: { top: 30, right: 60, bottom: 30, left: 10 },
  },
  delhi: {
    expectedWidth: 880,
    expectedHeight: 720,
    boundingBox: {
      minLat: 26.1, maxLat: 31.1,
      minLng: 74.7, maxLng: 79.7,
    },
    contentInsets: { top: 30, right: 60, bottom: 30, left: 10 },
  },
};

// ---------------------------------------------------------------------------
// 3. PER-STATION PALETTE CONFIGURATION & ADAPTIVE TOLERANCE
// ---------------------------------------------------------------------------

export interface RainfallColorBand {
  label: string;
  r: number; g: number; b: number;
  mmHrMin: number;
  mmHrMax: number;
  mmHrMid: number;
}

export interface BackgroundColorPattern {
  label: string;
  r: number; g: number; b: number;
}

export interface StationPaletteConfig {
  stationName: string;
  rainBands: RainfallColorBand[];
  backgroundColors: BackgroundColorPattern[];
  customTolerance?: number;
}

/** Standard IMD DWR CAZ Rainfall Bands */
export const COMMON_IMD_RAINFALL_BANDS: RainfallColorBand[] = [
  // IMD Blue Spectrum (Light Rain / Drizzle)
  { label: 'Light Drizzle Navy',   r: 0,   g: 2,   b: 139,  mmHrMin: 0.5,  mmHrMax: 2.5,  mmHrMid: 1.5  },
  { label: 'Light Rain Royal Blue',r: 1,   g: 55,  b: 171,  mmHrMin: 2.5,  mmHrMax: 5.0,  mmHrMid: 3.75 },
  { label: 'Light-Mod Sky Blue',   r: 3,   g: 121, b: 210,  mmHrMin: 5.0,  mmHrMax: 8.0,  mmHrMid: 6.5  },
  { label: 'Cyan Rain',            r: 0,   g: 180, b: 240,  mmHrMin: 6.0,  mmHrMax: 10.0, mmHrMid: 8.0  },

  // IMD Green Spectrum (Moderate Rain)
  { label: 'Muted Olive Green',    r: 112, g: 152, b: 79,   mmHrMin: 5.0,  mmHrMax: 12.0, mmHrMid: 8.5  },
  { label: 'Sage Green',           r: 146, g: 164, b: 89,   mmHrMin: 8.0,  mmHrMax: 15.0, mmHrMid: 11.5 },
  { label: 'Trace / Light Green',  r: 192, g: 255, b: 192,  mmHrMin: 0.5,  mmHrMax: 2.0,  mmHrMid: 1.25 },
  { label: 'Light Drizzle Green',  r: 128, g: 255, b: 128,  mmHrMin: 2.0,  mmHrMax: 4.0,  mmHrMid: 3.0  },
  { label: 'Bright Green',         r: 0,   g: 228, b: 0,    mmHrMin: 4.0,  mmHrMax: 10.0, mmHrMid: 7.0  },
  { label: 'Moderate Green',       r: 0,   g: 176, b: 0,    mmHrMin: 10.0, mmHrMax: 18.0, mmHrMid: 14.0 },

  // IMD Yellow / Orange / Red Spectrum (Heavy to Extreme Rain)
  { label: 'Moderate Yellow',      r: 255, g: 255, b: 0,    mmHrMin: 18.0, mmHrMax: 30.0, mmHrMid: 24.0 },
  { label: 'Mod-Heavy Yellow-Orange', r: 255, g: 200, b: 0, mmHrMin: 30.0, mmHrMax: 45.0, mmHrMid: 37.5 },
  { label: 'Heavy Orange',         r: 255, g: 150, b: 0,    mmHrMin: 45.0, mmHrMax: 65.0, mmHrMid: 55.0 },
  { label: 'Very Heavy Orange',    r: 255, g: 100, b: 0,    mmHrMin: 65.0, mmHrMax: 85.0, mmHrMid: 75.0 },
  { label: 'Intense Red',          r: 255, g: 0,   b: 0,    mmHrMin: 85.0, mmHrMax: 110.0,mmHrMid: 97.5 },
  { label: 'Very Intense Red',     r: 200, g: 0,   b: 0,    mmHrMin: 110.0,mmHrMax: 140.0,mmHrMid: 125.0 },
  { label: 'Extreme Red',          r: 150, g: 0,   b: 0,    mmHrMin: 140.0,mmHrMax: 180.0,mmHrMid: 160.0 },
  { label: 'Cloudburst Magenta',   r: 255, g: 0,   b: 255,  mmHrMin: 180.0,mmHrMax: 250.0,mmHrMid: 215.0 },
  { label: 'Extreme Cloudburst Purple', r: 160, g: 0, b: 210, mmHrMin: 250.0,mmHrMax: 350.0,mmHrMid: 300.0 },
];

/** Named Per-Station Color Palettes */
export const STATION_PALETTES: Record<CityId, StationPaletteConfig> = {
  delhi: {
    stationName: 'Delhi DWR',
    rainBands: COMMON_IMD_RAINFALL_BANDS,
    backgroundColors: [
      { label: 'Tan Landmass (Primary)',    r: 212, g: 155, b: 95 },
      { label: 'Dark Tan Landmass',         r: 149, g: 108, b: 66 },
      { label: 'Olive Terrain (Primary)',   r: 100, g: 173, b: 64 },
      { label: 'Dark Olive Terrain',        r: 100, g: 154, b: 64 },
      { label: 'Medium Olive Terrain',      r: 154, g: 173, b: 64 },
      { label: 'Deep Olive Terrain',        r: 70,  g: 121, b: 45 },
      { label: 'Muted Olive Terrain',       r: 154, g: 154, b: 64 },
      { label: 'Light Olive Terrain',       r: 173, g: 173, b: 64 },
      { label: 'Dark Canvas',               r: 0,   g: 0,   b: 0 },
      { label: 'Dark Muted Canvas',         r: 57,  g: 45,  b: 45 },
      { label: 'Grey Gridlines',            r: 179, g: 179, b: 179 },
      { label: 'White Map Canvas',          r: 255, g: 255, b: 255 },
    ],
  },
  chennai: {
    stationName: 'Chennai DWR (cni)',
    rainBands: COMMON_IMD_RAINFALL_BANDS,
    backgroundColors: [
      { label: 'Dark Canvas',               r: 0,   g: 0,   b: 0 },
      { label: 'Dark Land Grey',            r: 30,  g: 30,  b: 30 },
      { label: 'Medium Land Grey',          r: 60,  g: 60,  b: 60 },
      { label: 'Grey Coastlines',           r: 128, g: 128, b: 128 },
      { label: 'Light Coastlines',          r: 180, g: 180, b: 180 },
      { label: 'White Canvas',              r: 255, g: 255, b: 255 },
    ],
  },
  mumbai: {
    stationName: 'Mumbai Veravali DWR (vrv)',
    rainBands: COMMON_IMD_RAINFALL_BANDS,
    backgroundColors: [
      { label: 'Light Peach Landmass (Primary)', r: 254, g: 224, b: 179 },
      { label: 'Coastal Light Blue (Water)',    r: 198, g: 216, b: 225 },
      { label: 'Tan Terrain (Primary)',         r: 185, g: 148, b: 110 },
      { label: 'Medium Tan Terrain',            r: 196, g: 154, b: 114 },
      { label: 'Light Tan Terrain',             r: 207, g: 170, b: 132 },
      { label: 'Western Ghats Dark Canvas',     r: 0,   g: 0,   b: 0 },
      { label: 'Grey Gridlines',                r: 160, g: 160, b: 160 },
      { label: 'White Canvas',                  r: 255, g: 255, b: 255 },
    ],
  },
};

export function computeAdaptiveTolerance(palette: StationPaletteConfig): number {
  if (palette.customTolerance) return palette.customTolerance;

  const allEntries: Array<{ r: number; g: number; b: number }> = [
    ...palette.rainBands,
    ...palette.backgroundColors,
  ];

  let minPairwiseDist = Infinity;

  for (let i = 0; i < allEntries.length; i++) {
    for (let j = i + 1; j < allEntries.length; j++) {
      const dr = allEntries[i].r - allEntries[j].r;
      const dg = allEntries[i].g - allEntries[j].g;
      const db = allEntries[i].b - allEntries[j].b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist > 0 && dist < minPairwiseDist) {
        minPairwiseDist = dist;
      }
    }
  }

  const adaptive = Math.floor(minPairwiseDist * 0.45);
  return Math.max(25, Math.min(50, adaptive));
}

export function matchPixelToRainfallBand(
  r: number,
  g: number,
  b: number,
  cityId: CityId
): RainfallColorBand | null {
  const palette = STATION_PALETTES[cityId] || STATION_PALETTES[DEFAULT_STATION];
  const tolerance = computeAdaptiveTolerance(palette);

  let bestDist = Infinity;
  let bestBand: RainfallColorBand | null = null;

  for (const band of palette.rainBands) {
    const dr = r - band.r;
    const dg = g - band.g;
    const db = b - band.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < bestDist) {
      bestDist = dist;
      bestBand = band;
    }
  }

  return bestDist <= tolerance ? bestBand : null;
}

export interface PixelClassification {
  isRainfall: boolean;
  isBackground: boolean;
  mmHr: number;
}

export function classifyRadarPixel(
  r: number,
  g: number,
  b: number,
  cityId: CityId
): PixelClassification {
  const palette = STATION_PALETTES[cityId] || STATION_PALETTES[DEFAULT_STATION];
  const tolerance = computeAdaptiveTolerance(palette);

  const rainBand = matchPixelToRainfallBand(r, g, b, cityId);
  if (rainBand) {
    return { isRainfall: true, isBackground: false, mmHr: rainBand.mmHrMid };
  }

  for (const bg of palette.backgroundColors) {
    const dr = r - bg.r;
    const dg = g - bg.g;
    const db = b - bg.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist <= tolerance) {
      return { isRainfall: false, isBackground: true, mmHr: 0 };
    }
  }

  if (r <= 45 && g <= 45 && b <= 45) {
    return { isRainfall: false, isBackground: true, mmHr: 0 };
  }

  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (maxDiff <= 25 || (r >= 220 && g >= 220 && b >= 220)) {
    return { isRainfall: false, isBackground: true, mmHr: 0 };
  }

  return { isRainfall: false, isBackground: false, mmHr: 0 };
}

// ---------------------------------------------------------------------------
// 4. SINGLETON STATE & ROLLING FRAME HISTORY
// ---------------------------------------------------------------------------

export interface RadarFrameHistoryEntry {
  timestamp: number; // epoch ms
  cityId: CityId;
  grid: RadarGridCell[];
  confidence: number;
  avgRainfallMmHr: number;
  imageHash: string;
}

/** Maximum historical frames retained per station (~90 mins of 10-min cadence) */
const MAX_HISTORY_FRAMES = 9;

/** Per-station rolling frame history */
const radarFrameHistory: Partial<Record<CityId, RadarFrameHistoryEntry[]>> = {};

interface RadarCacheEntry {
  cityId: CityId;
  fetchedAt: number;
  imageHash: string;
  result: RadarPrecipitationResult;
}

const radarCache: Partial<Record<CityId, RadarCacheEntry>> = {};
const lastFetchAttempt: Partial<Record<CityId, number>> = {};

// ---------------------------------------------------------------------------
// 5. EXPORTED TYPES
// ---------------------------------------------------------------------------

export interface RadarGridCell {
  lat: number;
  lng: number;
  mmHr: number;
}

export interface RadarMotionVector {
  dxDegPerMin: number;
  dyDegPerMin: number;
  speedKmh: number;
  directionDeg: number; // Meteorological direction (degrees from North)
  confidence: number;   // 0.0 – 1.0 (correlation strength)
  frameCount: number;
  timeDeltaMins: number;
}

export interface RadarPrecipitationResult {
  cityId: CityId;
  source: 'radar' | 'openmeteo_fallback';
  lastUpdated: string;
  confidence: number;
  currentPrecipitationMmHr: number;
  nowcastTimelineMmHr: number[];
  rainfallGrid?: RadarGridCell[];
  stationCode: string;
  imageWidth?: number;
  imageHeight?: number;
  matchedPixelCount?: number;
  totalPixelCount?: number;
  motionVector?: RadarMotionVector | null;
  nowcastMethod: 'radar_motion_advection' | 'persistence_fallback';
  historyFrameCount: number;
}

// ---------------------------------------------------------------------------
// 6. MOTION VECTOR ESTIMATION (Block-Matching Optical Flow)
// ---------------------------------------------------------------------------

/**
 * Estimates the storm motion vector by comparing the two most recent decoded
 * radar grids using spatial block matching cross-correlation.
 *
 * Returns null if fewer than 2 historical frames exist or correlation is weak.
 */
export function estimateRadarMotionVector(cityId: CityId): RadarMotionVector | null {
  const history = radarFrameHistory[cityId] || [];
  if (history.length < 2) {
    return null; // Insufficient frame history for vector estimation
  }

  const curr = history[history.length - 1]; // Latest frame
  const prev = history[history.length - 2]; // Previous frame

  const timeDeltaMins = Math.max(1, (curr.timestamp - prev.timestamp) / 60000);
  if (timeDeltaMins > 45) {
    // Gap in fetches too wide for motion tracking
    return null;
  }

  // Create spatial lookup maps for cell intensities
  const gridStepDeg = 0.01; // ~1km cell resolution
  const prevMap = new Map<string, number>();
  for (const cell of prev.grid) {
    const key = `${Math.round(cell.lat / gridStepDeg)},${Math.round(cell.lng / gridStepDeg)}`;
    prevMap.set(key, cell.mmHr);
  }

  if (curr.grid.length < 10) {
    // Very low precipitation count — static vector default
    return {
      dxDegPerMin: 0,
      dyDegPerMin: 0,
      speedKmh: 0,
      directionDeg: 0,
      confidence: 0.5,
      frameCount: history.length,
      timeDeltaMins,
    };
  }

  // Search over shift window (dx, dy in grid steps: -10 to +10 steps ≈ ±10km)
  let bestShiftX = 0;
  let bestShiftY = 0;
  let bestCorrelation = -Infinity;

  for (let shiftY = -10; shiftY <= 10; shiftY++) {
    for (let shiftX = -10; shiftX <= 10; shiftX++) {
      let sumProd = 0;
      let sumSqCurr = 0;
      let sumSqPrev = 0;
      let matchCount = 0;

      for (const cell of curr.grid) {
        if (cell.mmHr <= 0.5) continue; // Focus on active precipitation cores

        const cLatIdx = Math.round(cell.lat / gridStepDeg);
        const cLngIdx = Math.round(cell.lng / gridStepDeg);

        const targetKey = `${cLatIdx - shiftY},${cLngIdx - shiftX}`;
        const prevVal = prevMap.get(targetKey) || 0;

        sumProd += cell.mmHr * prevVal;
        sumSqCurr += cell.mmHr * cell.mmHr;
        sumSqPrev += prevVal * prevVal;
        matchCount++;
      }

      if (matchCount > 5) {
        const denom = Math.sqrt(sumSqCurr * sumSqPrev);
        const corr = denom > 0 ? sumProd / denom : 0;
        if (corr > bestCorrelation) {
          bestCorrelation = corr;
          bestShiftX = shiftX;
          bestShiftY = shiftY;
        }
      }
    }
  }

  // Convert grid cell displacement to degrees per minute
  const dxDegPerMin = (bestShiftX * gridStepDeg) / timeDeltaMins;
  const dyDegPerMin = (bestShiftY * gridStepDeg) / timeDeltaMins;

  // Convert lat/lng deltas to physical speed in km/h and meteorological direction
  const kmPerDegLat = 111.0;
  const cityLat = CITIES[cityId]?.center[0] || 19.0;
  const kmPerDegLng = 111.0 * Math.cos((cityLat * Math.PI) / 180);

  const speedX = dxDegPerMin * 60 * kmPerDegLng;
  const speedY = dyDegPerMin * 60 * kmPerDegLat;
  const speedKmh = Number(Math.sqrt(speedX * speedX + speedY * speedY).toFixed(1));

  // Meteorological wind direction (where the storm is moving TO vs FROM)
  // Math.atan2(dx, dy) gives angle from North in radians
  let dirRad = Math.atan2(dxDegPerMin, dyDegPerMin);
  let dirDeg = Math.round((dirRad * 180) / Math.PI);
  if (dirDeg < 0) dirDeg += 360;

  const vectorConfidence = Math.max(0.2, Math.min(1.0, bestCorrelation > 0 ? bestCorrelation : 0.4));

  return {
    dxDegPerMin,
    dyDegPerMin,
    speedKmh,
    directionDeg: dirDeg,
    confidence: Number(vectorConfidence.toFixed(2)),
    frameCount: history.length,
    timeDeltaMins,
  };
}

// ---------------------------------------------------------------------------
// 7. ADVECTION-BASED NOWCAST EXTRAPOLATION
// ---------------------------------------------------------------------------

/**
 * Projects spatial precipitation forward along the motion vector for each of
 * the 0-3hr timeline steps [0, 15, 30, 45, 60, 90, 120, 150, 180] mins,
 * applying secondary storm dissipation decay.
 */
export function buildAdvectionNowcast(
  latestGrid: RadarGridCell[],
  vector: RadarMotionVector,
  cityId: CityId
): number[] {
  const availableTimes = [0, 15, 30, 45, 60, 90, 120, 150, 180];
  const city = CITIES[cityId];
  if (!city || latestGrid.length === 0) {
    return availableTimes.map(() => 0);
  }

  const radius = 0.18;
  const centerLat = city.center[0];
  const centerLng = city.center[1];

  // Secondary dissipation decay factors applied over lead time
  const decayFactors = [1.0, 0.95, 0.88, 0.78, 0.65, 0.48, 0.32, 0.18, 0.08];

  return availableTimes.map((t, idx) => {
    // Project spatial shift at offset t minutes
    const shiftLat = t * vector.dyDegPerMin;
    const shiftLng = t * vector.dxDegPerMin;

    let sum = 0;
    let count = 0;

    for (const cell of latestGrid) {
      const projLat = cell.lat + shiftLat;
      const projLng = cell.lng + shiftLng;

      // Check if advected cell falls within city bounding box
      if (
        projLat >= centerLat - radius && projLat <= centerLat + radius &&
        projLng >= centerLng - radius && projLng <= centerLng + radius
      ) {
        sum += cell.mmHr;
        count++;
      }
    }

    const unscaledAvg = count > 0 ? sum / count : 0;
    const decayedRate = unscaledAvg * decayFactors[idx];
    return Number(decayedRate.toFixed(1));
  });
}

function buildPersistenceNowcast(currentMmHr: number): number[] {
  const decayFactors = [1.0, 0.95, 0.85, 0.70, 0.55, 0.40, 0.25, 0.12, 0.05];
  return decayFactors.map(f => Number((currentMmHr * f).toFixed(1)));
}

// ---------------------------------------------------------------------------
// 8. RATE LIMITER & DEDUP HASH
// ---------------------------------------------------------------------------

function canFetch(cityId: CityId): boolean {
  const last = lastFetchAttempt[cityId] || 0;
  const elapsed = Date.now() - last;
  if (elapsed < RADAR_FETCH_INTERVAL_MS) {
    const remainingMs = RADAR_FETCH_INTERVAL_MS - elapsed;
    const remainingMins = (remainingMs / 60000).toFixed(1);
    console.warn(
      `[Radar] Rate limit: fetch for ${cityId} REJECTED — ` +
      `${remainingMins} min remaining in cooldown window. ` +
      `Last fetch was ${(elapsed / 1000).toFixed(0)}s ago.`
    );
    return false;
  }
  return true;
}

function hashBuffer(buf: Uint8Array): string {
  let hash = 2166136261;
  for (let i = 0; i < buf.length; i += 64) {
    hash ^= buf[i];
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// 9. GIF DECODING
// ---------------------------------------------------------------------------

function decodeRadarGif(
  gifBuffer: Uint8Array,
  cityId: CityId
): { grid: RadarGridCell[]; confidence: number; width: number; height: number; matched: number; total: number } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GifReader } = require('omggif');

  const reader = new GifReader(gifBuffer);
  const width = reader.width;
  const height = reader.height;

  const geoConfig = RADAR_GEOREFERENCE[cityId];
  if (width !== geoConfig.expectedWidth || height !== geoConfig.expectedHeight) {
    console.warn(
      `[Radar] ⚠️ Image dimensions changed for ${cityId}: ` +
      `expected ${geoConfig.expectedWidth}×${geoConfig.expectedHeight}, ` +
      `got ${width}×${height}. Georeferencing recalibration may be needed.`
    );
  }

  const rgba = new Uint8Array(width * height * 4);
  reader.decodeAndBlitFrameRGBA(0, rgba);

  const { boundingBox: bb, contentInsets: ci } = geoConfig;
  const contentWidth = width - ci.left - ci.right;
  const contentHeight = height - ci.top - ci.bottom;

  const latRange = bb.maxLat - bb.minLat;
  const lngRange = bb.maxLng - bb.minLng;

  const step = 2;
  const grid: RadarGridCell[] = [];
  let rainPixels = 0;
  let bgPixels = 0;
  let totalPixels = 0;

  const unmatchedColorHistogram: Record<string, number> = {};

  for (let py = ci.top; py < height - ci.bottom; py += step) {
    for (let px = ci.left; px < width - ci.right; px += step) {
      totalPixels++;
      const idx = (py * width + px) * 4;
      const r = rgba[idx];
      const g = rgba[idx + 1];
      const b = rgba[idx + 2];
      const a = rgba[idx + 3];

      if (a < 128) continue;

      const classification = classifyRadarPixel(r, g, b, cityId);
      if (classification.isRainfall) {
        rainPixels++;

        const fracX = (px - ci.left) / contentWidth;
        const fracY = (py - ci.top) / contentHeight;

        const lng = bb.minLng + fracX * lngRange;
        const lat = bb.maxLat - fracY * latRange;

        grid.push({
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          mmHr: Number(classification.mmHr.toFixed(1)),
        });
      } else if (classification.isBackground) {
        bgPixels++;
      } else {
        const colorKey = `RGB(${r},${g},${b})`;
        unmatchedColorHistogram[colorKey] = (unmatchedColorHistogram[colorKey] || 0) + 1;
      }
    }
  }

  const matchedPixels = rainPixels + bgPixels;
  const confidence = totalPixels > 0 ? matchedPixels / totalPixels : 0;

  if (confidence < CONFIDENCE_THRESHOLD) {
    console.warn(
      `[Radar] ⚠️ Low decode confidence for ${cityId}: ` +
      `${(confidence * 100).toFixed(1)}% < ${CONFIDENCE_THRESHOLD * 100}%. ` +
      `Logging top unmatched colors for palette calibration:`
    );

    const sortedUnmatched = Object.entries(unmatchedColorHistogram).sort((a, b) => b[1] - a[1]);
    sortedUnmatched.slice(0, 5).forEach(([rgb, count]) => {
      console.warn(`   → Unmatched ${rgb}: ${count} px (${((count / totalPixels) * 100).toFixed(1)}%)`);
    });
  }

  return { grid, confidence, width, height, matched: matchedPixels, total: totalPixels };
}

// ---------------------------------------------------------------------------
// 10. GRID AGGREGATION
// ---------------------------------------------------------------------------

function computeCityAverageRainfall(grid: RadarGridCell[], cityId: CityId): number {
  const city = CITIES[cityId];
  if (!city || grid.length === 0) return 0;

  const radius = 0.18;
  const centerLat = city.center[0];
  const centerLng = city.center[1];

  let sum = 0;
  let count = 0;

  for (const cell of grid) {
    if (
      cell.lat >= centerLat - radius && cell.lat <= centerLat + radius &&
      cell.lng >= centerLng - radius && cell.lng <= centerLng + radius
    ) {
      sum += cell.mmHr;
      count++;
    }
  }

  return count > 0 ? Number((sum / count).toFixed(1)) : 0;
}

// ---------------------------------------------------------------------------
// 11. MAIN FETCH & DECODE PIPELINE
// ---------------------------------------------------------------------------

export async function fetchRadarPrecipitation(
  cityId: CityId
): Promise<RadarPrecipitationResult | null> {
  const stationCode = RADAR_STATION_CODES[cityId];
  if (!stationCode) {
    console.warn(`[Radar] No station code configured for city: ${cityId}`);
    return null;
  }

  if (!canFetch(cityId)) {
    const cached = radarCache[cityId];
    if (cached) {
      console.log(`[Radar] Returning cached result for ${cityId} (age: ${((Date.now() - cached.fetchedAt) / 1000).toFixed(0)}s)`);
      return cached.result;
    }
    return null;
  }

  lastFetchAttempt[cityId] = Date.now();

  const cacheBuster = Math.floor(Date.now() / 1000);
  const url = RADAR_IMAGE_URL_TEMPLATE
    .replace('{station}', stationCode)
    .replace('{t}', String(cacheBuster));

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= BACKOFF_MAX_RETRIES; attempt++) {
    try {
      const backoffMs = attempt === 0
        ? 0
        : Math.min(BACKOFF_INITIAL_MS * Math.pow(2, attempt - 1), BACKOFF_MAX_MS);

      if (backoffMs > 0) {
        console.log(`[Radar] Retry #${attempt} for ${cityId} in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }

      const totalElapsed = Date.now() - (lastFetchAttempt[cityId] || Date.now());
      if (totalElapsed > RADAR_FETCH_INTERVAL_MS * 0.9) {
        console.warn(`[Radar] Retry time budget exhausted for ${cityId}, aborting.`);
        break;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'image/gif, image/*',
          'Referer': 'https://mausamnow.com/',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const arrayBuf = await response.arrayBuffer();
      const gifBuffer = new Uint8Array(arrayBuf);

      if (gifBuffer.length < 100) {
        throw new Error(`Response too small (${gifBuffer.length} bytes) — likely an error page`);
      }

      const newHash = hashBuffer(gifBuffer);
      const cached = radarCache[cityId];
      if (cached && cached.imageHash === newHash) {
        console.log(`[Radar] Image unchanged for ${cityId} (hash: ${newHash}). Using cached decode.`);
        cached.fetchedAt = Date.now();
        cached.result.lastUpdated = new Date().toISOString();
        return cached.result;
      }

      console.log(`[Radar] Decoding new image for ${cityId} (${gifBuffer.length} bytes, hash: ${newHash})...`);
      const { grid, confidence, width, height, matched, total } = decodeRadarGif(gifBuffer, cityId);

      const avgRainfall = computeCityAverageRainfall(grid, cityId);

      // Record decoded frame into rolling frame history store
      const historyStore = radarFrameHistory[cityId] || [];
      const historyEntry: RadarFrameHistoryEntry = {
        timestamp: Date.now(),
        cityId,
        grid,
        confidence,
        avgRainfallMmHr: avgRainfall,
        imageHash: newHash,
      };
      historyStore.push(historyEntry);
      while (historyStore.length > MAX_HISTORY_FRAMES) {
        historyStore.shift();
      }
      radarFrameHistory[cityId] = historyStore;

      // Estimate Motion Vector using frame history
      const motionVector = estimateRadarMotionVector(cityId);

      let nowcastTimelineMmHr: number[];
      let nowcastMethod: 'radar_motion_advection' | 'persistence_fallback';

      if (motionVector && historyStore.length >= 2) {
        nowcastTimelineMmHr = buildAdvectionNowcast(grid, motionVector, cityId);
        nowcastMethod = 'radar_motion_advection';
        console.log(
          `[Radar] Motion vector advection generated for ${cityId}: ` +
          `speed ${motionVector.speedKmh} km/h @ ${motionVector.directionDeg}° ` +
          `(confidence: ${(motionVector.confidence * 100).toFixed(0)}%)`
        );
      } else {
        nowcastTimelineMmHr = buildPersistenceNowcast(avgRainfall);
        nowcastMethod = 'persistence_fallback';
        console.log(`[Radar] Insufficient frame history for ${cityId} (${historyStore.length} frames). Using persistence fallback nowcast.`);
      }

      console.log(
        `[Radar] Decode complete for ${cityId}: ` +
        `${matched}/${total} pixels matched (${(confidence * 100).toFixed(1)}% confidence), ` +
        `${grid.length} grid cells produced.`
      );

      // Async persistence to Vercel Blob (non-blocking long-term storage)
      const nowIso = new Date().toISOString();
      saveRadarGridToBlob({
        stationCode,
        cityId,
        timestamp: nowIso,
        confidence: Number(confidence.toFixed(3)),
        source: 'radar',
        avgRainfallMmHr: avgRainfall,
        grid,
        matchedPixelCount: matched,
        totalPixelCount: total,
      }).catch(err => {
        console.error(`[Radar] Unhandled error during Vercel Blob save for ${cityId}:`, err);
      });

      // Scheduled retention cleanup check (throttled internally to every 3 days)
      runScheduledBlobCleanupIfNeeded().catch(err => {
        console.error(`[Radar] Unhandled error during blob cleanup scan:`, err);
      });

      const result: RadarPrecipitationResult = {
        cityId,
        source: 'radar',
        lastUpdated: nowIso,
        confidence: Number(confidence.toFixed(3)),
        currentPrecipitationMmHr: avgRainfall,
        nowcastTimelineMmHr,
        rainfallGrid: grid,
        stationCode,
        imageWidth: width,
        imageHeight: height,
        matchedPixelCount: matched,
        totalPixelCount: total,
        motionVector,
        nowcastMethod,
        historyFrameCount: historyStore.length,
      };

      radarCache[cityId] = {
        cityId,
        fetchedAt: Date.now(),
        imageHash: newHash,
        result,
      };

      return result;

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[Radar] Fetch attempt #${attempt + 1}/${BACKOFF_MAX_RETRIES + 1} ` +
        `failed for ${cityId} (${stationCode}): ${lastError.message}`
      );
    }
  }

  console.error(
    `[Radar] All fetch attempts failed for ${cityId}. ` +
    `Last error: ${lastError?.message || 'Unknown'}. ` +
    `Fusion layer will fall back to Open-Meteo.`
  );
  return null;
}

// ---------------------------------------------------------------------------
// 12. STATUS INTROSPECTION
// ---------------------------------------------------------------------------

export interface RadarPipelineStatus {
  cityId: CityId;
  active: boolean;
  stationCode: string;
  lastFetchTimestamp: string | null;
  lastImageHash: string | null;
  confidence: number | null;
  nextFetchEligible: string | null;
  cooldownRemainingMs: number;
  cachedResultAge: string | null;
  historyFrameCount: number;
  motionVector: RadarMotionVector | null;
  blobStorage: BlobStorageStatus;
}

export function getRadarPipelineStatus(cityId: CityId): RadarPipelineStatus {
  const stationCode = RADAR_STATION_CODES[cityId] || 'unknown';
  const cached = radarCache[cityId];
  const history = radarFrameHistory[cityId] || [];
  const lastAttempt = lastFetchAttempt[cityId] || 0;
  const now = Date.now();
  const elapsed = now - lastAttempt;
  const cooldownRemaining = Math.max(0, RADAR_FETCH_INTERVAL_MS - elapsed);

  return {
    cityId,
    active: !!cached,
    stationCode,
    lastFetchTimestamp: lastAttempt ? new Date(lastAttempt).toISOString() : null,
    lastImageHash: cached?.imageHash || null,
    confidence: cached?.result.confidence ?? null,
    nextFetchEligible: lastAttempt
      ? new Date(lastAttempt + RADAR_FETCH_INTERVAL_MS).toISOString()
      : new Date().toISOString(),
    cooldownRemainingMs: cooldownRemaining,
    cachedResultAge: cached
      ? `${((now - cached.fetchedAt) / 1000).toFixed(0)}s`
      : null,
    historyFrameCount: history.length,
    motionVector: cached?.result.motionVector || null,
    blobStorage: getBlobStorageStatus(),
  };
}
