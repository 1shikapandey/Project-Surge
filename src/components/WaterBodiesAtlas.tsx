'use client';

import React, { useState } from 'react';
import {
  Waves,
  Droplets,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Compass,
  Sparkles,
  RefreshCw,
  Sliders,
  Anchor
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WaterBodiesAtlasProps {
  selectedCityId: string;
  onSelectFeature?: (id: string) => void;
}

interface LakeAsset {
  id: string;
  name: string;
  type: string;
  currentFtlPct: number;
  storageMcm: number;
  maxStorageMcm: number;
  encroachmentPct: number;
  restorationPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  floodAttenuationCapacityM3: number;
  status: 'SAFE_MARGIN' | 'HIGH_FILL' | 'CRITICAL_BUFFER';
}

interface OutfallGate {
  id: string;
  name: string;
  basin: string;
  gateType: string;
  status: 'GRAVITY_OUTFLOW' | 'FLAP_LOCKED_TIDE' | 'PUMPING_ACTIVE';
  currentDischargeCusecs: number;
  seaLevelHeadM: number;
}

const MUMBAI_LAKES: LakeAsset[] = [
  {
    id: 'lake-powai',
    name: 'Powai Lake Retention Basin',
    type: 'Urban Buffer Lake',
    currentFtlPct: 68,
    storageMcm: 5.4,
    maxStorageMcm: 8.2,
    encroachmentPct: 14,
    restorationPriority: 'HIGH',
    floodAttenuationCapacityM3: 2800000,
    status: 'SAFE_MARGIN'
  },
  {
    id: 'lake-vihar',
    name: 'Vihar Lake Catchment Dam',
    type: 'Potable Drinking & Flood Attenuation',
    currentFtlPct: 82,
    storageMcm: 22.8,
    maxStorageMcm: 27.6,
    encroachmentPct: 4,
    restorationPriority: 'MEDIUM',
    floodAttenuationCapacityM3: 4800000,
    status: 'HIGH_FILL'
  },
  {
    id: 'lake-tulsi',
    name: 'Tulsi Lake High-Elevation Basin',
    type: 'Upland Catchment Reservoir',
    currentFtlPct: 91,
    storageMcm: 7.3,
    maxStorageMcm: 8.0,
    encroachmentPct: 2,
    restorationPriority: 'MEDIUM',
    floodAttenuationCapacityM3: 700000,
    status: 'CRITICAL_BUFFER'
  },
  {
    id: 'tank-chembur',
    name: 'Chembur Charai Retention Tank',
    type: 'Suburban Retention Pond',
    currentFtlPct: 54,
    storageMcm: 0.8,
    maxStorageMcm: 1.5,
    encroachmentPct: 28,
    restorationPriority: 'CRITICAL',
    floodAttenuationCapacityM3: 700000,
    status: 'SAFE_MARGIN'
  }
];

const MUMBAI_OUTFALLS: OutfallGate[] = [
  {
    id: 'out-mahim',
    name: 'Mithi River Mahim Bay Tidal Flap Gate',
    basin: 'Mithi Central Basin',
    gateType: 'Automated Hydraulic Radial Flap Gate',
    status: 'FLAP_LOCKED_TIDE',
    currentDischargeCusecs: 0,
    seaLevelHeadM: 4.42
  },
  {
    id: 'out-lovegrove',
    name: 'Love Grove Worli Outfall & Pumping Station',
    basin: 'Worli-Dadar South SWD Main',
    gateType: 'Archimedes Screw Heavy Pumping Matrix',
    status: 'PUMPING_ACTIVE',
    currentDischargeCusecs: 1420,
    seaLevelHeadM: 4.18
  },
  {
    id: 'out-cleaveland',
    name: 'Cleave-land Bunder Sluice Regulators',
    basin: 'Hindmata-Parel Lowland Collector',
    gateType: 'Pneumatic Drop-Grip Storm Gate',
    status: 'GRAVITY_OUTFLOW',
    currentDischargeCusecs: 850,
    seaLevelHeadM: 2.15
  },
  {
    id: 'out-hajiali',
    name: 'Haji Ali Bay Stormwater Sluice',
    basin: 'South Mumbai Coastal Drainage',
    gateType: 'Tidal Flap Lockout Valve',
    status: 'FLAP_LOCKED_TIDE',
    currentDischargeCusecs: 0,
    seaLevelHeadM: 4.35
  }
];

export const WaterBodiesAtlas: React.FC<WaterBodiesAtlasProps> = ({ selectedCityId, onSelectFeature }) => {
  const { t } = useLanguage();
  const [lakes] = useState<LakeAsset[]>(MUMBAI_LAKES);
  const [outfalls] = useState<OutfallGate[]>(MUMBAI_OUTFALLS);

  const totalHeadroomMcm = lakes.reduce((sum, l) => sum + (l.maxStorageMcm - l.storageMcm), 0);

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div>
          <p className="ui-eyebrow">Water Map · Atlas</p>
          <h2 className="ui-title mt-0.5">{t.waterAtlas.title}</h2>
          <p className="ui-subtitle mt-1.5">{t.waterAtlas.subTitle}</p>
        </div>
        <div className="ui-kpi">
          <div className="ui-kpi-label">
            <span>{t.waterAtlas.totalBufferHeadroom}</span>
            <Droplets className="text-sky-500" />
          </div>
          <div>
            <span className="ui-kpi-value">{totalHeadroomMcm.toFixed(1)}</span>
            <span className="ui-kpi-unit">MCM</span>
          </div>
        </div>
      </section>

      {/* Urban lakes inventory */}
      <section className="ui-card space-y-3">
        <h3 className="ui-section-title">
          <Droplets />
          <span>{t.waterAtlas.urbanReservoirsHeading}</span>
        </h3>

        <div className="flex flex-col gap-2.5">
          {lakes.map((lake) => (
            <article
              key={lake.id}
              onClick={() => onSelectFeature?.(lake.id)}
              className="ui-card-muted ui-card-interactive space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <span className="ui-chip ui-chip-info">{lake.type}</span>
                <span className={`ui-chip ${
                  lake.status === 'CRITICAL_BUFFER' || lake.status === 'HIGH_FILL' ? 'ui-chip-warn' : 'ui-chip-ok'
                }`}>
                  {lake.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h4 className="text-sm font-extrabold leading-snug">{lake.name}</h4>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--text-secondary)' }}>{t.waterAtlas.FTL}</span>
                  <span className="ui-mono font-extrabold">{lake.currentFtlPct}%</span>
                </div>
                <div className="ui-meter">
                  <span
                    style={{
                      width: `${lake.currentFtlPct}%`,
                      background: lake.currentFtlPct > 70 ? 'var(--color-status-warning)' : 'var(--color-selection-active)'
                    }}
                  />
                </div>
              </div>

              <dl className="ui-kv">
                <div>
                  <dt>{t.waterAtlas.storage}</dt>
                  <dd>{lake.storageMcm} / {lake.maxStorageMcm} MCM</dd>
                </div>
                <div>
                  <dt>{t.waterAtlas.cushion}</dt>
                  <dd style={{ color: 'var(--color-selection-active)' }}>{(lake.maxStorageMcm - lake.storageMcm).toFixed(1)} MCM</dd>
                </div>
              </dl>

              <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>
                  {t.waterAtlas.encroachment}{' '}
                  <strong style={{ color: 'var(--color-status-warning)' }}>{lake.encroachmentPct}%</strong>
                </span>
                <span className="ui-chip">{t.waterAtlas.priority} {lake.restorationPriority}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Coastal outfalls & flap gate telemetry */}
      <section className="ui-card space-y-3">
        <div>
          <h3 className="ui-section-title">
            <Anchor />
            <span>{t.waterAtlas.coastalOutfallsHeading}</span>
          </h3>
          <p className="ui-section-sub">{t.waterAtlas.tidalFlapSub}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          {outfalls.map((gate) => (
            <article
              key={gate.id}
              onClick={() => onSelectFeature?.(gate.id)}
              className="ui-card-muted ui-card-interactive space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-extrabold leading-snug min-w-0">{gate.name}</h4>
                <span className={`ui-chip shrink-0 ${
                  gate.status === 'FLAP_LOCKED_TIDE'
                    ? 'ui-chip-warn'
                    : gate.status === 'PUMPING_ACTIVE'
                    ? 'ui-chip-info'
                    : 'ui-chip-ok'
                }`}>
                  {gate.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Basin: <strong style={{ color: 'var(--text-primary)' }}>{gate.basin}</strong> • Gate: {gate.gateType}
              </p>

              <dl className="ui-kv">
                <div>
                  <dt>{t.waterAtlas.dischargeRate}</dt>
                  <dd>{gate.currentDischargeCusecs} Cusecs</dd>
                </div>
                <div>
                  <dt>{t.waterAtlas.seaInvertHead}</dt>
                  <dd style={{ color: 'var(--color-selection-active)' }}>+{gate.seaLevelHeadM}m SL</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
