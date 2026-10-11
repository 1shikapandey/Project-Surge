/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VERCEL BLOB HISTORICAL STORAGE SERVICE FOR PARSED RADAR DATA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Provides durable long-term storage, chronological querying, and retention
 * cleanup for parsed radar rainfall intensity grids using @vercel/blob.
 *
 * Path structure:
 *   radar-history/{station}/{yyyy}/{mm}/{dd}/{HHmm}.json
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { put, list, del } from '@vercel/blob';
import { CityId } from './mock-data';
import { RadarGridCell } from './radar-imagery-service';
import { saveRadarGridToS3, fetchHistoricalRadarGridsFromS3 } from './aws/radar-store-s3';

const USE_S3 = () => process.env.STORAGE_BACKEND === 's3';


// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface RadarBlobPayload {
  stationCode: string;
  cityId: CityId;
  timestamp: string; // ISO 8601 string of source radar image
  confidence: number;
  source: 'radar' | 'fallback';
  avgRainfallMmHr: number;
  grid: RadarGridCell[];
  matchedPixelCount?: number;
  totalPixelCount?: number;
}

export interface BlobStorageStatus {
  isTokenConfigured: boolean;
  lastSavedBlobPath: string | null;
  lastSavedAt: string | null;
  lastCleanupAt: string | null;
  saveCount: number;
  errorCount: number;
  lastError: string | null;
}

// ---------------------------------------------------------------------------
// CONSTANTS & STATE
// ---------------------------------------------------------------------------

/** Default retention window in days if not set in environment */
const DEFAULT_RETENTION_DAYS = 60;

/** Throttling window for automated retention cleanup (3 days in ms) */
const CLEANUP_THROTTLE_MS = 3 * 24 * 60 * 60 * 1000;

let lastCleanupAttempt = 0;
let lastSavedBlobPath: string | null = null;
let lastSavedAt: string | null = null;
let saveCount = 0;
let errorCount = 0;
let lastError: string | null = null;

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Generates structured, sortable blob path for chronological querying.
 * Format: radar-history/{station}/{yyyy}/{mm}/{dd}/{HHmm}.json
 */
export function formatRadarBlobPath(stationCode: string, timestampIso: string): string {
  const d = new Date(timestampIso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');

  const cleanStation = stationCode.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `radar-history/${cleanStation}/${yyyy}/${mm}/${dd}/${hh}${min}.json`;
}

/**
 * Checks if Vercel Blob read/write token is present in environment and valid.
 */
export function isBlobTokenConfigured(): boolean {
  if (USE_S3()) return Boolean(process.env.RADAR_BUCKET);
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(
    token &&
    token.trim() !== '' &&
    token !== 'vercel_blob_rw_your_token_here' &&
    token.startsWith('vercel_blob_rw_')
  );
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Stores parsed radar rainfall grid to Vercel Blob with structured, sortable path.
 */
export async function saveRadarGridToBlob(payload: RadarBlobPayload): Promise<string | null> {
  if (USE_S3()) {
    const key = formatRadarBlobPath(payload.stationCode, payload.timestamp);
    try {
      const uri = await saveRadarGridToS3(key, payload);
      lastSavedBlobPath = key;
      lastSavedAt = new Date().toISOString();
      saveCount++;
      return uri;
    } catch (e: any) {
      errorCount++;
      lastError = e?.message ?? String(e);
      console.error('[RadarS3] save failed', key, e);
      return null;
    }
  }

  if (!isBlobTokenConfigured()) {
    console.warn(
      `[RadarBlob] ⚠️ BLOB_READ_WRITE_TOKEN is not set in environment. ` +
      `Skipping Vercel Blob persistence for station ${payload.stationCode}.`
    );
    return null;
  }

  const pathname = formatRadarBlobPath(payload.stationCode, payload.timestamp);

  try {
    const jsonString = JSON.stringify(payload);
    console.log(
      `[RadarBlob] Storing parsed grid to Vercel Blob: ${pathname} ` +
      `(${payload.grid.length} cells, ${(jsonString.length / 1024).toFixed(1)} KB)...`
    );

    let blob;
    try {
      blob = await put(pathname, jsonString, {
        access: 'public',
        addRandomSuffix: false, // Strict path naming for date-range listing
        contentType: 'application/json',
      });
    } catch (putErr: any) {
      if (putErr?.message?.includes('private store') || putErr?.message?.includes('private access')) {
        console.log(`[RadarBlob] Store is private. Retrying put with access: 'private'...`);
        blob = await put(pathname, jsonString, {
          access: 'private',
          addRandomSuffix: false,
          contentType: 'application/json',
        });
      } else {
        throw putErr;
      }
    }

    lastSavedBlobPath = blob.url;
    lastSavedAt = new Date().toISOString();
    saveCount++;

    console.log(`[RadarBlob] Successfully stored blob: ${blob.url}`);
    return blob.url;

  } catch (err) {
    errorCount++;
    lastError = err instanceof Error ? err.message : String(err);
    console.error(`[RadarBlob] Failed to store blob ${pathname}:`, lastError);
    return null;
  }
}

/**
 * Fetches historical parsed radar grids from Vercel Blob within optional date range.
 */
export async function fetchHistoricalRadarGridsFromBlob(
  stationCode: string,
  startDate?: Date,
  endDate?: Date
): Promise<RadarBlobPayload[]> {
  if (USE_S3()) {
    const clean = stationCode.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return fetchHistoricalRadarGridsFromS3(clean, startDate, endDate);
  }

  if (!isBlobTokenConfigured()) {
    console.warn(`[RadarBlob] ⚠️ BLOB_READ_WRITE_TOKEN not set. Cannot fetch historical blobs.`);
    return [];
  }

  const cleanStation = stationCode.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  const prefix = `radar-history/${cleanStation}/`;

  try {
    const { blobs } = await list({ prefix });
    if (!blobs || blobs.length === 0) {
      console.log(`[RadarBlob] No historical blobs found for station ${stationCode}`);
      return [];
    }

    console.log(`[RadarBlob] Found ${blobs.length} historical blobs for station ${stationCode}`);

    // Sort blobs chronologically by pathname
    const sortedBlobs = [...blobs].sort((a, b) => a.pathname.localeCompare(b.pathname));
    const results: RadarBlobPayload[] = [];

    for (const blob of sortedBlobs) {
      // Parse timestamp from pathname: radar-history/{station}/{yyyy}/{mm}/{dd}/{HHmm}.json
      const parts = blob.pathname.split('/');
      if (parts.length < 5) continue;

      const yyyy = parts[2];
      const mm = parts[3];
      const dd = parts[4];
      const timePart = parts[5]?.replace('.json', '') || '0000';
      const hh = timePart.substring(0, 2);
      const min = timePart.substring(2, 4);

      const blobDate = new Date(Date.UTC(+yyyy, +mm - 1, +dd, +hh, +min));

      if (startDate && blobDate < startDate) continue;
      if (endDate && blobDate > endDate) continue;

      try {
        const response = await fetch(blob.downloadUrl || blob.url);
        if (response.ok) {
          const payload = (await response.json()) as RadarBlobPayload;
          results.push(payload);
        }
      } catch (fetchErr) {
        console.warn(`[RadarBlob] Failed to fetch blob data from ${blob.url}:`, fetchErr);
      }
    }

    return results;

  } catch (err) {
    console.error(`[RadarBlob] Failed to query historical blobs for ${stationCode}:`, err);
    return [];
  }
}

/**
 * Scheduled cleanup step deleting blobs older than retention window.
 * Internal throttling ensures this runs at most once every 3 days.
 */
export async function runScheduledBlobCleanupIfNeeded(retentionDaysOverride?: number): Promise<number> {
  if (USE_S3()) return 0; // S3 bucket lifecycle rule automatically handles retention
  if (!isBlobTokenConfigured()) return 0;

  const now = Date.now();
  if (now - lastCleanupAttempt < CLEANUP_THROTTLE_MS) {
    // Throttled — executed recently
    return 0;
  }

  lastCleanupAttempt = now;

  const envRetention = process.env.RADAR_BLOB_RETENTION_DAYS
    ? parseInt(process.env.RADAR_BLOB_RETENTION_DAYS, 10)
    : NaN;

  const retentionDays = !isNaN(envRetention) && envRetention > 0
    ? envRetention
    : (retentionDaysOverride || DEFAULT_RETENTION_DAYS);

  const cutoffTime = now - retentionDays * 24 * 60 * 60 * 1000;
  console.log(
    `[RadarBlob] Running retention cleanup scan (blobs older than ${retentionDays} days, cutoff: ${new Date(cutoffTime).toISOString()})...`
  );

  try {
    const { blobs } = await list({ prefix: 'radar-history/' });
    if (!blobs || blobs.length === 0) return 0;

    const urlsToDelete: string[] = [];

    for (const blob of blobs) {
      const uploadedAt = new Date(blob.uploadedAt).getTime();
      if (uploadedAt < cutoffTime) {
        urlsToDelete.push(blob.url);
      }
    }

    if (urlsToDelete.length > 0) {
      console.log(`[RadarBlob] Deleting ${urlsToDelete.length} expired blobs...`);
      await del(urlsToDelete);
      console.log(`[RadarBlob] Cleanup completed. Removed ${urlsToDelete.length} blobs.`);
    } else {
      console.log(`[RadarBlob] Retention cleanup complete: 0 expired blobs found.`);
    }

    return urlsToDelete.length;

  } catch (err) {
    console.error(`[RadarBlob] Scheduled retention cleanup encountered error:`, err);
    return 0;
  }
}

/**
 * Gets current Blob storage operational status for diagnostics.
 */
export function getBlobStorageStatus(): BlobStorageStatus {
  return {
    isTokenConfigured: isBlobTokenConfigured(),
    lastSavedBlobPath,
    lastSavedAt,
    lastCleanupAt: lastCleanupAttempt ? new Date(lastCleanupAttempt).toISOString() : null,
    saveCount,
    errorCount,
    lastError,
  };
}
