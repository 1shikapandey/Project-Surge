'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { NowcastTimeStep } from '@/lib/hydraulic-engine';
import type { AiDecisionOutput } from '@/lib/flood-decision-service';
import type { HistoricalImpactMarker } from '@/components/OpenLayersMapCanvas';
import type { CityId } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type SimulationPersona = 'citizen' | 'authority';
export type PlaybackSpeed = 1 | 4 | 16;

export interface SimulationPlaybackEvent {
  id: string;
  stepIndex: number;
  type:
    | 'severity_band_crossing'
    | 'surcharge_threshold_crossing'
    | 'pump_auto_activation'
    | 'historical_hotspot_relevant'
    | 'ai_triage_updated';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'severe';
  relatedFeatureId?: string;
  timestamp: string;
}

export interface HistoricalEventMeta {
  eventId: string;
  cityId: CityId;
  cityName: string;
  eventTitle: string;
  date: string;
  totalRainfall24hMm: number;
  peakIntensityMmHr: number;
  durationHours: number;
  primarySourceCitation: {
    agency: string;
    documentName: string;
    archiveRef: string;
    publicationDate: string;
  };
  affectedAreas: {
    hotspotName: string;
    boroughOrZone: string;
    recordedDepthRangeCm: [number, number];
    crossRefRoadId: string;
    crossRefNodeId: string;
    impactDescription: string;
  }[];
  timeSeriesProfile: {
    timeLabel: string;
    timeOffsetMins: number;
    precipitationMmHr: number;
    confidence: string;
    provenanceNote: string;
  }[];
}

export interface SimulationFrame {
  stepIndex: number;
  timeOffsetMins: number;
  timeLabel: string;
  precipitationMmHr: number;
  confidence: string;
  provenanceNote: string;
  snapshot: NowcastTimeStep;
  aiDecision: AiDecisionOutput | null;
}

export interface SimulationContextValue {
  // Mode flags
  isSimulationMode: true;
  simulationPersona: SimulationPersona | null;
  setPersona: (p: SimulationPersona) => void;

  // Event selection
  selectedEvent: HistoricalEventMeta | null;
  selectEvent: (event: HistoricalEventMeta) => void;
  selectedCityId: CityId;

  // Precomputed frames
  frames: SimulationFrame[];
  setFrames: (frames: SimulationFrame[]) => void;

  // Playback state
  currentStepIndex: number;
  totalSteps: number;
  setStep: (n: number) => void;
  playbackState: { isPlaying: boolean; speed: PlaybackSpeed };
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (s: PlaybackSpeed) => void;

  // Current computed data
  currentFrame: SimulationFrame | null;
  currentSnapshot: NowcastTimeStep | null;
  currentRainfallMmHr: number;
  currentTimeOffsetMins: number;

  // Orchestrator events
  playbackEvents: SimulationPlaybackEvent[];
  setPlaybackEvents: (events: SimulationPlaybackEvent[]) => void;
  addPlaybackEvent: (event: SimulationPlaybackEvent) => void;

  // Historical markers
  historicalImpactMarkers: HistoricalImpactMarker[];
  setHistoricalImpactMarkers: (markers: HistoricalImpactMarker[]) => void;

  // SCADA simulation-scoped pump overrides
  pumpStatesOverride: Record<string, boolean>;
  togglePump: (pumpId: string) => void;
  setPumpStatesOverride: (states: Record<string, boolean>) => void;

  // AI Decision
  aiDecisionOverride: AiDecisionOutput | null;
}

// ---------------------------------------------------------------------------
// CONTEXT
// ---------------------------------------------------------------------------

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulationContext(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulationContext must be used within SimulationProvider');
  }
  return ctx;
}

/**
 * Optional hook — returns null if not in simulation mode.
 * Safe to call from components that may or may not be in simulation context.
 */
export function useOptionalSimulationContext(): SimulationContextValue | null {
  return useContext(SimulationContext);
}

// ---------------------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------------------

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulationPersona, setSimulationPersona] = useState<SimulationPersona | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEventMeta | null>(null);
  const [frames, setFrames] = useState<SimulationFrame[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackState, setPlaybackState] = useState<{ isPlaying: boolean; speed: PlaybackSpeed }>({
    isPlaying: false,
    speed: 1,
  });
  const [playbackEvents, setPlaybackEvents] = useState<SimulationPlaybackEvent[]>([]);
  const [historicalImpactMarkers, setHistoricalImpactMarkers] = useState<HistoricalImpactMarker[]>([]);
  const [pumpStatesOverride, setPumpStatesOverride] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCityId: CityId = selectedEvent?.cityId ?? 'mumbai';
  const totalSteps = frames.length;
  const currentFrame = frames[currentStepIndex] ?? null;
  const currentSnapshot = currentFrame?.snapshot ?? null;
  const currentRainfallMmHr = currentFrame?.precipitationMmHr ?? 0;
  const currentTimeOffsetMins = currentFrame?.timeOffsetMins ?? 0;
  const aiDecisionOverride = currentFrame?.aiDecision ?? null;

  // Playback interval management
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (playbackState.isPlaying && totalSteps > 0) {
      const intervalMs = Math.max(200, 2000 / playbackState.speed);
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setPlaybackState((ps) => ({ ...ps, isPlaying: false }));
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playbackState.isPlaying, playbackState.speed, totalSteps]);

  const play = useCallback(() => {
    setPlaybackState((ps) => ({ ...ps, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setPlaybackState((ps) => ({ ...ps, isPlaying: false }));
  }, []);

  const reset = useCallback(() => {
    setPlaybackState({ isPlaying: false, speed: 1 });
    setCurrentStepIndex(0);
    setPlaybackEvents([]);
  }, []);

  const setSpeed = useCallback((s: PlaybackSpeed) => {
    setPlaybackState((ps) => ({ ...ps, speed: s }));
  }, []);

  const setStep = useCallback((n: number) => {
    setCurrentStepIndex(Math.max(0, Math.min(n, totalSteps - 1)));
  }, [totalSteps]);

  const setPersona = useCallback((p: SimulationPersona) => {
    setSimulationPersona(p);
  }, []);

  const selectEvent = useCallback((event: HistoricalEventMeta) => {
    setSelectedEvent(event);
    setCurrentStepIndex(0);
    setPlaybackEvents([]);
    setPumpStatesOverride({});
  }, []);

  const addPlaybackEvent = useCallback((event: SimulationPlaybackEvent) => {
    setPlaybackEvents((prev) => [...prev, event]);
  }, []);

  const togglePump = useCallback((pumpId: string) => {
    setPumpStatesOverride((prev) => ({
      ...prev,
      [pumpId]: prev[pumpId] === undefined ? false : !prev[pumpId],
    }));
  }, []);

  const value: SimulationContextValue = {
    isSimulationMode: true,
    simulationPersona,
    setPersona,
    selectedEvent,
    selectEvent,
    selectedCityId,
    frames,
    setFrames,
    currentStepIndex,
    totalSteps,
    setStep,
    playbackState,
    play,
    pause,
    reset,
    setSpeed,
    currentFrame,
    currentSnapshot,
    currentRainfallMmHr,
    currentTimeOffsetMins,
    playbackEvents,
    setPlaybackEvents,
    addPlaybackEvent,
    historicalImpactMarkers,
    setHistoricalImpactMarkers,
    pumpStatesOverride,
    togglePump,
    setPumpStatesOverride,
    aiDecisionOverride,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};
