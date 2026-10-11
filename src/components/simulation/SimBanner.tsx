'use client';

import React from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import { AlertTriangle, History, ArrowLeft, ShieldAlert, User, Zap } from 'lucide-react';
import Link from 'next/link';

interface SimBannerProps {
  onOpenEventSelector?: () => void;
  onOpenPersonaSelector?: () => void;
}

export const SimBanner: React.FC<SimBannerProps> = ({
  onOpenEventSelector,
  onOpenPersonaSelector,
}) => {
  const { selectedEvent, simulationPersona, playbackState, currentRainfallMmHr, currentTimeOffsetMins } =
    useSimulationContext();

  return (
    <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 backdrop-blur-md relative z-40">
      {/* Left side: Tag & Event name */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          SIMULATION REPLAY MODE
        </span>

        <div className="flex items-center gap-2 truncate">
          <History className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-sm text-amber-100 truncate">
            {selectedEvent ? selectedEvent.eventTitle : 'Historical Event Replay'}
          </span>
          {selectedEvent && (
            <span className="text-xs text-amber-300/80 font-mono hidden sm:inline">
              ({selectedEvent.date})
            </span>
          )}
        </div>
      </div>

      {/* Middle: Data Callout */}
      {selectedEvent && (
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-amber-300/90 border-x border-amber-500/30 px-3 py-0.5">
          <div>
            <span className="text-amber-400 font-semibold">24h Rain:</span> {selectedEvent.totalRainfall24hMm}mm
          </div>
          <div>
            <span className="text-amber-400 font-semibold">Peak:</span> {selectedEvent.peakIntensityMmHr}mm/h
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-amber-200 font-bold">{currentRainfallMmHr} mm/h</span>
            <span className="text-amber-400/80">({currentTimeOffsetMins >= 0 ? `+${currentTimeOffsetMins}` : currentTimeOffsetMins}m)</span>
          </div>
        </div>
      )}

      {/* Right side: Persona badge & Actions */}
      <div className="flex items-center gap-2.5 ml-auto">
        <div
          onClick={onOpenPersonaSelector}
          className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-amber-500/40 text-xs font-medium text-amber-200 hover:bg-slate-800 transition-colors"
          title="Click to switch persona"
        >
          {simulationPersona === 'citizen' ? (
            <>
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Citizen View</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              <span>Authority Operator</span>
            </>
          )}
        </div>

        {onOpenEventSelector && (
          <button
            onClick={onOpenEventSelector}
            className="px-2.5 py-1 text-xs font-medium rounded bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/40 text-amber-200 transition-colors"
          >
            Change Event
          </button>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Exit Replay
        </Link>
      </div>
    </div>
  );
};
