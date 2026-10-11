'use client';

import React from 'react';
import { AlertOctagon, Flame, MapPin, CheckCircle2 } from 'lucide-react';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { CityId, getCityDataset } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';

interface AlertFeedProps {
  selectedCityId: CityId;
  timeOffsetMins: number;
  onSelectFeature: (id: string) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  selectedCityId,
  timeOffsetMins,
  onSelectFeature
}) => {
  const { t } = useLanguage();
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
  const { roads, nodes } = getCityDataset(selectedCityId);

  const criticalRoads = snapshot.roadStates.filter(r => r.waterDepthCm >= 15);
  const surchargingManholes = snapshot.nodeStates.filter(n => n.surchargePct >= 100);
  const physicsOverflows = (snapshot.physicsManholes || []).filter(m => m.surfaceOverflowDepthCm > 0);

  const totalAlerts = criticalRoads.length + surchargingManholes.length + physicsOverflows.length;

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="ui-eyebrow">Live Alerts</p>
            <h2 className="ui-title mt-0.5 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 shrink-0" style={{ color: 'var(--color-status-critical)' }} />
              <span>{t.alerts.title}</span>
            </h2>
          </div>
          <span className={`ui-chip ui-mono shrink-0 ${totalAlerts > 0 ? 'ui-chip-warn' : 'ui-chip-ok'}`}>
            {totalAlerts} {t.alerts.critical}
          </span>
        </div>
      </section>

      {totalAlerts === 0 ? (
        <section className="ui-card flex flex-col items-center text-center gap-2 py-8">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-status-safe) 14%, transparent)', color: 'var(--color-status-safe)' }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </span>
          <p className="text-sm font-extrabold">{t.alerts.noAlerts}</p>
        </section>
      ) : (
        <div className="flex flex-col gap-2">
          {criticalRoads.map((roadState) => {
            const road = roads.find(r => r.id === roadState.roadId);
            if (!road) return null;

            const getSeverityBadgeText = (sev: string) => {
              if (sev.toLowerCase().includes('crit')) return t.alerts.critical;
              if (sev.toLowerCase().includes('warn')) return t.alerts.warning;
              return t.alerts.advisory;
            };

            return (
              <article
                key={road.id}
                onClick={() => onSelectFeature(road.id)}
                className="ui-card ui-card-interactive !p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-status-critical)' }} />
                    <span className="truncate">{road.name}</span>
                  </div>
                  <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t.alerts.borough}: {road.borough} • {t.alerts.elevation}: {road.demElevationMeters}m
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="ui-mono text-sm font-extrabold" style={{ color: 'var(--color-status-warning)' }}>
                    {roadState.waterDepthCm} cm
                  </span>
                  <p className="text-2xs uppercase font-bold" style={{ color: 'var(--color-status-critical)' }}>
                    {getSeverityBadgeText(roadState.severity)}
                  </p>
                </div>
              </article>
            );
          })}

          {surchargingManholes.map((nodeState) => {
            const node = nodes.find(n => n.id === nodeState.nodeId);
            if (!node) return null;

            return (
              <article
                key={node.id}
                onClick={() => onSelectFeature(node.id)}
                className="ui-card ui-card-interactive !p-3 flex items-start justify-between gap-3"
                style={{ borderColor: 'color-mix(in srgb, var(--color-status-critical) 40%, transparent)' }}
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-status-critical)' }} />
                    <span className="truncate">{node.name}</span>
                  </div>
                  <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t.alerts.hydraulicBackflow} • {node.type}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="ui-mono text-sm font-extrabold" style={{ color: 'var(--color-status-warning)' }}>
                    {nodeState.surchargePct}%
                  </span>
                  <p className="text-2xs uppercase font-bold" style={{ color: 'var(--color-status-critical)' }}>
                    {t.alerts.tabSurcharge}
                  </p>
                </div>
              </article>
            );
          })}

          {physicsOverflows.map((mh) => (
            <article
              key={mh.id}
              onClick={() => onSelectFeature(mh.id)}
              className="ui-card ui-card-interactive !p-3 flex items-start justify-between gap-3"
              style={{ borderColor: 'color-mix(in srgb, var(--color-status-critical) 40%, transparent)' }}
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-status-critical)' }} />
                  <span className="truncate">{mh.name}</span>
                </div>
                <p className="text-2xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {mh.derivedLocationLabel}
                </p>
                <p className="text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                  Rim: {mh.rimElevationMeters}m • Q_in: {mh.inflowRunoffLps} L/s
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="ui-mono text-sm font-extrabold" style={{ color: 'var(--color-status-warning)' }}>
                  +{mh.surfaceOverflowDepthCm} cm
                </span>
                <p className="text-2xs uppercase font-bold" style={{ color: 'var(--color-status-critical)' }}>
                  {t.alerts.surfaceSpill}
                </p>
                <span className="text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {mh.hydraulicCapacityPct}% Cap
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
