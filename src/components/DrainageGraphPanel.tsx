'use client';

import React, { useState } from 'react';
import { Network, Waves, AlertTriangle, Gauge } from 'lucide-react';
import { CityId, getCityDataset, DRAINAGE_PIPES } from '@/lib/mock-data';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { getTopSurchargingManholes } from '@/lib/physics-manhole-engine';
import { useLanguage } from '@/context/LanguageContext';

interface DrainageGraphPanelProps {
  selectedCityId: CityId;
  timeOffsetMins: number;
}

export const DrainageGraphPanel: React.FC<DrainageGraphPanelProps> = ({
  selectedCityId,
  timeOffsetMins
}) => {
  const { t } = useLanguage();
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
  const { nodes } = getCityDataset(selectedCityId);
  const topManholes = getTopSurchargingManholes(selectedCityId, 8, timeOffsetMins);
  const [activeTab, setActiveTab] = useState<'physics_manholes' | 'outfalls_pipes'>('physics_manholes');

  const overflowingCount = snapshot.overflowingManholesCount || 0;
  const totalOverflowLps = snapshot.totalManholeOverflowRateLps || 0;

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
      {/* Header with Physics Metrics */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-blue-700" />
          <div>
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              {t.drainage.title}
            </h2>
            <p className="text-[10.5px] text-gray-500">
              {t.drainage.undergroundGraph}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {overflowingCount > 0 && (
            <span className="flex items-center space-x-1 text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>{overflowingCount} {t.drainage.criticalNodes}</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-100 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('physics_manholes')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'physics_manholes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>{t.drainage.criticalNodes} ({snapshot.physicsManholes?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('outfalls_pipes')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'outfalls_pipes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>{t.drainage.coupledSurface}</span>
        </button>
      </div>

      {activeTab === 'physics_manholes' ? (
        <div className="space-y-2">
          {/* Summary Banner */}
          <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Nodes</p>
              <p className="text-sm font-bold text-gray-800 font-mono">{snapshot.physicsManholes?.length || 0}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Overflow</p>
              <p className={`text-sm font-bold font-mono ${overflowingCount > 0 ? 'text-orange-600' : 'text-blue-700'}`}>
                {overflowingCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Rate</p>
              <p className={`text-sm font-bold font-mono ${totalOverflowLps > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
                {totalOverflowLps} L/s
              </p>
            </div>
          </div>

          {/* Manholes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {topManholes.map((mh) => {
              const isOverflowing = mh.surfaceOverflowDepthCm > 0;
              const isWarning = mh.hydraulicCapacityPct >= 70;

              let barColor = 'bg-blue-500';
              if (isOverflowing || mh.hydraulicCapacityPct >= 120) barColor = 'bg-orange-600';
              else if (mh.hydraulicCapacityPct >= 100) barColor = 'bg-orange-500';
              else if (isWarning) barColor = 'bg-orange-500';

              return (
                <div
                  key={mh.id}
                  className={`p-2.5 rounded-xl border transition-all text-xs space-y-1.5 ${
                    isOverflowing
                      ? 'bg-orange-50/50 border-orange-200'
                      : 'bg-white border-gray-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-800 text-[11.5px]">{mh.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate max-w-[190px]">
                        {mh.derivedLocationLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isOverflowing ? 'text-orange-600' : isWarning ? 'text-orange-600' : 'text-blue-700'
                        }`}
                      >
                        {mh.hydraulicCapacityPct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(100, mh.hydraulicCapacityPct)}%` }}
                    />
                  </div>

                  {/* Overflow Alert Tag */}
                  {isOverflowing && (
                    <div className="flex items-center justify-between text-[10px] bg-orange-100/70 text-orange-800 px-2 py-0.5 rounded font-medium">
                      <span>{t.alerts.tabSurcharge}</span>
                      <span className="font-bold font-mono">+{mh.surfaceOverflowDepthCm} cm</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Outfalls ({nodes.length})
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {nodes.map((node) => {
                const liveState = snapshot.nodeStates.find(n => n.nodeId === node.id);
                const surcharge = liveState ? liveState.surchargePct : 0;
                const isSurcharging = surcharge >= 100;

                return (
                  <div key={node.id} className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="font-semibold text-gray-800 text-[11px]">{node.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs ${isSurcharging ? 'text-orange-600' : 'text-blue-700'}`}>
                        {surcharge}%
                      </span>
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

