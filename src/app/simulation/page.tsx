'use client';

import React, { useState, useEffect } from 'react';
import {
  SimulationProvider,
  useSimulationContext,
  SimulationPersona,
  HistoricalEventMeta,
} from '@/context/SimulationContext';
import { getAllHistoricalEvents, HistoricalEventDetail } from '@/lib/historical-events-service';
import {
  precomputeAllFrames,
  batchApplyDeltasUpToStep,
  buildHistoricalImpactMarkers,
} from '@/lib/simulation-orchestrator';
import { SimCitizenDashboard } from '@/components/simulation/SimCitizenDashboard';
import { SimAuthorityDashboard } from '@/components/simulation/SimAuthorityDashboard';
import { SimTutorialOverlay } from '@/components/simulation/SimTutorialOverlay';
import {
  AlertTriangle,
  Calendar,
  CloudRain,
  Shield,
  User,
  ShieldAlert,
  ArrowRight,
  History,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// HELPER TO CONVERT HISTORICAL DETAIL TO META
// ---------------------------------------------------------------------------
function formatEventDetailToMeta(detail: HistoricalEventDetail): HistoricalEventMeta {
  return {
    eventId: detail.eventId,
    cityId: detail.cityId,
    cityName: detail.cityName,
    eventTitle: detail.eventTitle,
    date: detail.date,
    totalRainfall24hMm: detail.totalRainfall24hMm,
    peakIntensityMmHr: detail.peakIntensityMmHr,
    durationHours: detail.durationHours,
    primarySourceCitation: {
      agency: detail.primarySourceCitation.agency,
      documentName: detail.primarySourceCitation.documentName,
      archiveRef: detail.primarySourceCitation.archiveRef || 'IMD-ARCHIVE-REF',
      publicationDate: detail.primarySourceCitation.publicationDate || detail.date,
    },
    affectedAreas: detail.affectedAreas.map((a) => ({
      hotspotName: a.hotspotName,
      boroughOrZone: a.boroughOrZone,
      recordedDepthRangeCm: a.recordedDepthRangeCm,
      crossRefRoadId: a.crossRefRoadId || 'road-1',
      crossRefNodeId: a.crossRefNodeId || 'node-1',
      impactDescription: a.impactDescription,
    })),
    timeSeriesProfile: detail.timeSeriesProfile.map((t) => ({
      timeLabel: t.timeLabel,
      timeOffsetMins: t.timeOffsetMins,
      precipitationMmHr: t.precipitationMmHr,
      confidence: t.confidence,
      provenanceNote: t.provenanceNote,
    })),
  };
}

// ---------------------------------------------------------------------------
// INNER SIMULATION CONTROLLER (consumes SimulationContext)
// ---------------------------------------------------------------------------
const SimulationInnerContent: React.FC = () => {
  const {
    simulationPersona,
    setPersona,
    selectedEvent,
    selectEvent,
    setFrames,
    currentStepIndex,
    setPlaybackEvents,
    setHistoricalImpactMarkers,
    pumpStatesOverride,
  } = useSimulationContext();

  const [showPersonaModal, setShowPersonaModal] = useState<boolean>(!simulationPersona);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const allEvents = getAllHistoricalEvents().map(formatEventDetailToMeta);

  // Initialize default event if none selected
  useEffect(() => {
    if (!selectedEvent && allEvents.length > 0) {
      const defaultMeta = allEvents[0];
      handleSelectEvent(defaultMeta);
    }
  }, [selectedEvent]);

  // Update batch deltas when currentStepIndex changes
  useEffect(() => {
    if (selectedEvent) {
      const frames = precomputeAllFrames(selectedEvent, pumpStatesOverride);
      const events = batchApplyDeltasUpToStep(frames, currentStepIndex, selectedEvent, selectedEvent.cityId);
      setPlaybackEvents(events);
    }
  }, [currentStepIndex, selectedEvent, pumpStatesOverride]);

  const handleSelectEvent = (eventMeta: HistoricalEventMeta) => {
    selectEvent(eventMeta);
    const frames = precomputeAllFrames(eventMeta, pumpStatesOverride);
    setFrames(frames);
    const events = batchApplyDeltasUpToStep(frames, 0, eventMeta, eventMeta.cityId);
    setPlaybackEvents(events);
    const markers = buildHistoricalImpactMarkers(eventMeta, eventMeta.cityId);
    setHistoricalImpactMarkers(markers);
    setShowEventModal(false);
  };

  const handleSelectPersona = (persona: SimulationPersona) => {
    setPersona(persona);
    setShowPersonaModal(false);
  };

  // Entry Flow Modal: Persona Selection
  if (showPersonaModal || !simulationPersona) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider border border-amber-500/40">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              AquaAlert Simulation Replay Environment
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Choose Your Simulation Persona
            </h1>

            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Recreate real-world flood scenarios using authentic IMD/NDRF benchmark data. Experience the live system UI tailored to your operational role.
            </p>
          </div>

          {/* Persona Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Citizen Persona Card */}
            <button
              onClick={() => handleSelectPersona('citizen')}
              className="group p-6 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/80 transition-all text-left flex flex-col justify-between gap-4 shadow-lg hover:shadow-cyan-500/10 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Citizen View
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Test hydro-aware evacuation routing, submit ground reports, view hazard streams, and access emergency helplines.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Experience as Citizen</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Authority Persona Card */}
            <button
              onClick={() => handleSelectPersona('authority')}
              className="group p-6 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/80 transition-all text-left flex flex-col justify-between gap-4 shadow-lg hover:shadow-amber-500/10 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Authority Command Center
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Monitor SCADA manhole surcharges, trigger manual pump overrides, dispatch NDRF relief units, and export SitRep reports.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Operator Mode</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Footer Back Link */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to AquaAlert Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 overflow-hidden">
      {/* Persona View rendering */}
      {simulationPersona === 'citizen' ? (
        <SimCitizenDashboard
          onOpenEventSelector={() => setShowEventModal(true)}
          onOpenPersonaSelector={() => setShowPersonaModal(true)}
        />
      ) : (
        <SimAuthorityDashboard
          onOpenEventSelector={() => setShowEventModal(true)}
          onOpenPersonaSelector={() => setShowPersonaModal(true)}
        />
      )}

      {/* Historical Event Selection Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Select Historical Flood Event Dataset
                </h2>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allEvents.map((evt) => {
                const isSelected = selectedEvent?.eventId === evt.eventId;
                return (
                  <div
                    key={evt.eventId}
                    onClick={() => handleSelectEvent(evt)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 text-white ring-1 ring-amber-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xs font-bold text-white">{evt.eventTitle}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">{evt.date} • {evt.cityName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {evt.totalRainfall24hMm}mm / 24h
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1 font-sans">
                      <div>Peak Intensity: <span className="text-amber-400 font-bold font-mono">{evt.peakIntensityMmHr} mm/h</span></div>
                      <div className="text-[10px] text-slate-500">Source: {evt.primarySourceCitation.agency}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// MAIN WRAPPER WITH SIMULATION PROVIDER
// ---------------------------------------------------------------------------
export default function SimulationPage() {
  return (
    <SimulationProvider>
      <SimulationInnerContent />
    </SimulationProvider>
  );
}
