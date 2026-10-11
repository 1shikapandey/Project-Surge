'use client';

import React, { useState } from 'react';
import { useSimulationContext, SimulationPlaybackEvent } from '@/context/SimulationContext';
import { ShieldAlert, AlertTriangle, Info, Zap, History, Filter } from 'lucide-react';

export const SimAlertFeed: React.FC = () => {
  const { playbackEvents, currentStepIndex } = useSimulationContext();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Events emitted up to current step
  const visibleEvents = playbackEvents.filter((e) => e.stepIndex <= currentStepIndex);

  const filteredEvents = visibleEvents.filter((e) => {
    if (filterSeverity === 'all') return true;
    return e.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: SimulationPlaybackEvent['severity']) => {
    switch (severity) {
      case 'severe':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
            SEVERE
          </span>
        );
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40">
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40">
            INFO
          </span>
        );
    }
  };

  const getEventIcon = (type: SimulationPlaybackEvent['type']) => {
    switch (type) {
      case 'severity_band_crossing':
        return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
      case 'surcharge_threshold_crossing':
        return <Zap className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'pump_auto_activation':
        return <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'historical_hotspot_relevant':
        return <History className="w-4 h-4 text-purple-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-xl flex flex-col h-full max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Simulation Event Stream
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
            {visibleEvents.length}
          </span>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded text-xs px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="severe">Severe</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
            <Info className="w-6 h-6 mb-2 opacity-50" />
            <span>No simulation playback events at this timestep.</span>
            <span className="text-[11px] text-slate-600 mt-1">
              Press play or scrub forward to see events trigger.
            </span>
          </div>
        ) : (
          filteredEvents
            .slice()
            .reverse()
            .map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {getEventIcon(evt.type)}
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {evt.title}
                    </span>
                  </div>
                  {getSeverityBadge(evt.severity)}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pl-6">
                  {evt.description}
                </p>

                <div className="mt-2 pl-6 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-1.5">
                  <span>Timestamp: {evt.timestamp}</span>
                  <span className="text-amber-400/80 uppercase">
                    [Simulated]
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
