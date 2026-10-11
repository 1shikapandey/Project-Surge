'use client';

import React from 'react';
import { AlertOctagon, X, Flame, MapPin, CheckCircle2, Bell, AlertTriangle } from 'lucide-react';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { CityId, getCityDataset } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCityId: CityId;
  timeOffsetMins: number;
  onSelectFeature: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  selectedCityId,
  timeOffsetMins,
  onSelectFeature
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
  const { roads, nodes } = getCityDataset(selectedCityId);

  const criticalRoads = snapshot.roadStates.filter(r => r.waterDepthCm >= 15);
  const surchargingManholes = snapshot.nodeStates.filter(n => n.surchargePct >= 100);
  const physicsOverflows = (snapshot.physicsManholes || []).filter(m => m.surfaceOverflowDepthCm > 0);

  const totalAlerts = criticalRoads.length + surchargingManholes.length + physicsOverflows.length;

  const handleAlertClick = (id: string) => {
    onSelectFeature(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Emergency Notifications
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                  {totalAlerts} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time critical flood alerts for {selectedCityId.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1">
          {totalAlerts === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">All Clear in {selectedCityId.toUpperCase()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No critical flood warnings or manhole surcharges detected.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Critical Roads */}
              {criticalRoads.map((roadState) => {
                const road = roads.find(r => r.id === roadState.roadId);
                if (!road) return null;

                return (
                  <div
                    key={road.id}
                    onClick={() => handleAlertClick(road.id)}
                    className="p-4 rounded-xl bg-rose-50/70 dark:bg-gradient-to-r dark:from-red-950/40 dark:to-slate-900 border border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/60 transition-all cursor-pointer flex items-start justify-between space-x-3 group shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-red-800 dark:text-red-200 group-hover:text-red-900 dark:group-hover:text-red-100">
                        <Flame className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                        <span className="text-sm">{road.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Borough: <span className="text-slate-800 dark:text-slate-200">{road.borough}</span> • DEM Elevation: {road.demElevationMeters}m
                      </p>
                      <p className="text-[11px] text-red-700/80 dark:text-red-300/80 font-medium">
                        Severe water logging on roadway. High risk to small vehicles.
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-mono font-black text-red-600 dark:text-red-400 block">
                        {roadState.waterDepthCm} cm
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/30">
                        CRITICAL
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Surcharging Manholes */}
              {surchargingManholes.map((nodeState) => {
                const node = nodes.find(n => n.id === nodeState.nodeId);
                if (!node) return null;

                return (
                  <div
                    key={node.id}
                    onClick={() => handleAlertClick(node.id)}
                    className="p-4 rounded-xl bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all cursor-pointer flex items-start justify-between space-x-3 group shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-amber-800 dark:text-amber-200 group-hover:text-amber-900 dark:group-hover:text-amber-100">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-sm">{node.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Hydraulic Backflow Hazard • Node Type: <span className="text-slate-800 dark:text-slate-200">{node.type}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400 block">
                        {nodeState.surchargePct}%
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                        SURCHARGE
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Surface Overflows */}
              {physicsOverflows.map((mh) => (
                <div
                  key={mh.id}
                  onClick={() => handleAlertClick(mh.id)}
                  className="p-4 rounded-xl bg-orange-50/70 dark:bg-gradient-to-r dark:from-orange-950/40 dark:to-slate-900 border border-orange-200 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-500/60 transition-all cursor-pointer flex items-start justify-between space-x-3 group shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 font-bold text-orange-800 dark:text-orange-200 group-hover:text-orange-900 dark:group-hover:text-orange-100">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="text-sm">{mh.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {mh.derivedLocationLabel} • Capacity: {mh.hydraulicCapacityPct}%
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-mono font-black text-orange-600 dark:text-orange-400 block">
                      +{mh.surfaceOverflowDepthCm} cm
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30">
                      SURFACE SPILL
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
