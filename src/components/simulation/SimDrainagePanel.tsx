'use client';

import React from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import { getPumpingStationsForCity } from '@/lib/pumping-station-service';
import { computeAutoPumpStates } from '@/lib/simulation-orchestrator';
import { Activity, Zap, Power, ShieldAlert, Cpu } from 'lucide-react';

export const SimDrainagePanel: React.FC = () => {
  const { currentSnapshot, selectedCityId, pumpStatesOverride, togglePump } = useSimulationContext();

  const stations = getPumpingStationsForCity(selectedCityId);

  // Compute auto pump states from physics snapshot
  const autoPumpStates = currentSnapshot ? computeAutoPumpStates(currentSnapshot, selectedCityId) : {};

  // Effective pump state: override if present, else auto-state
  const getEffectivePumpState = (pumpId: string): { active: boolean; isOverride: boolean } => {
    if (pumpStatesOverride[pumpId] !== undefined) {
      return { active: pumpStatesOverride[pumpId], isOverride: true };
    }
    return { active: !!autoPumpStates[pumpId], isOverride: false };
  };

  const nodeStatesMap = new Map((currentSnapshot?.nodeStates || []).map((n) => [n.nodeId, n]));

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-xl flex flex-col h-full max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            SCADA Dewatering & Drainage
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <Cpu className="w-3 h-3 text-amber-400" />
          PHYSICS AUTO-TRIGGERS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Section 1: Manhole Node Surcharges */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            Drainage Node Surcharges
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentSnapshot?.nodeStates.map((node) => {
              const isSurging = node.surchargePct >= 100;
              return (
                <div
                  key={node.nodeId}
                  className={`p-2.5 rounded-lg border text-xs transition-colors ${
                    isSurging
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : node.surchargePct >= 70
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="font-bold">{node.nodeId}</span>
                    <span className="font-semibold">{node.surchargePct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isSurging ? 'bg-red-500' : node.surchargePct >= 70 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, node.surchargePct)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Status: {node.status}</span>
                    {node.surchargePct >= 100 && (
                      <span className="text-red-400 font-bold">BACKFLOW OVERFLOW</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Pumping Stations SCADA Controls */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Power className="w-3.5 h-3.5 text-cyan-400" />
            Dewatering Pump Override SCADA
          </h4>
          <div className="space-y-2">
            {stations.map((station) => {
              const { active, isOverride } = getEffectivePumpState(station.id);
              const connectedNode = nodeStatesMap.get(station.connectedDrainId);
              const nodeSurgePct = connectedNode?.surchargePct ?? 0;

              return (
                <div
                  key={station.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {station.name}
                      </span>
                      {isOverride && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          USER OVERRIDE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Cap: {station.capacityLps.toLocaleString()} L/s | Node: {station.connectedDrainId} ({nodeSurgePct}%)
                    </div>
                  </div>

                  <button
                    onClick={() => togglePump(station.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md ${
                      active
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 ring-1 ring-slate-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{active ? 'PUMPING' : 'OFFLINE'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
