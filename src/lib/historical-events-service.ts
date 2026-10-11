/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AQUAALERT — HISTORICAL FLOOD EVENT DATASET SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Provides typed access to authentic IMD & government-documented historical
 * flood events for Mumbai, Delhi, and Chennai.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CityId } from './mock-data';
import historicalDatasetJson from './historical-events-dataset.json';

export interface SourceCitation {
  agency: string;
  documentName: string;
  archiveRef?: string;
  publicationDate?: string;
  quoteOrStat?: string;
}

export interface AffectedAreaImpact {
  hotspotName: string;
  boroughOrZone: string;
  recordedDepthRangeCm: [number, number];
  crossRefRoadId?: string;
  crossRefNodeId?: string;
  impactDescription: string;
}

export interface TimeSeriesPoint {
  timeLabel: string;
  timeOffsetMins: number;
  precipitationMmHr: number;
  confidence: 'exact_imd_record' | 'interpolated';
  provenanceNote: string;
}

export interface HistoricalEventDetail {
  eventId: string;
  cityId: CityId;
  cityName: string;
  eventTitle: string;
  date: string;
  totalRainfall24hMm: number;
  peakIntensityMmHr: number;
  durationHours: number;
  primarySourceCitation: SourceCitation;
  additionalCitations?: SourceCitation[];
  affectedAreas: AffectedAreaImpact[];
  timeSeriesProfile: TimeSeriesPoint[];
}

const HISTORICAL_DATASET = historicalDatasetJson as HistoricalEventDetail[];

/**
 * Returns all curated historical flood events across all cities.
 */
export function getAllHistoricalEvents(): HistoricalEventDetail[] {
  return HISTORICAL_DATASET;
}

/**
 * Returns historical flood events filtered for a specific city.
 */
export function getHistoricalEventsForCity(cityId: CityId): HistoricalEventDetail[] {
  return HISTORICAL_DATASET.filter(e => e.cityId === cityId);
}

/**
 * Returns a specific historical flood event by its unique ID.
 */
export function getHistoricalEventById(eventId: string): HistoricalEventDetail | undefined {
  return HISTORICAL_DATASET.find(e => e.eventId === eventId);
}

/**
 * Extracts 9-step precipitation timeline (mm/hr) for the Manning hydraulic solver.
 */
export function getEventTimelineForHydraulicSolver(eventId: string): number[] {
  const event = getHistoricalEventById(eventId);
  if (!event || !event.timeSeriesProfile || event.timeSeriesProfile.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  return event.timeSeriesProfile.map(pt => pt.precipitationMmHr);
}
