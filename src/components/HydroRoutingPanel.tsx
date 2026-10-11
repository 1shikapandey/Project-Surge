'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  RefreshCw,
  Layers,
  Database,
  Droplets,
  Sliders,
  CheckCircle2,
  Lock,
  Radio,
  FileCheck
} from 'lucide-react';
import {
  RoutingSink,
  ScadaAuditLogEntry,
  getRoutingSinks,
  getScadaAuditChain,
  verifyAuditChain,
  executeManualGateOverride,
  triggerAutomatedDiversionMatrix
} from '@/lib/hydro-routing-service';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface HydroRoutingPanelProps {
  selectedCityId: string;
  onSelectFeature?: (id: string) => void;
}

export const HydroRoutingPanel: React.FC<HydroRoutingPanelProps> = ({ selectedCityId, onSelectFeature }) => {
  const { t } = useLanguage();
  const [sinks, setSinks] = useState<RoutingSink[]>(() => getRoutingSinks(selectedCityId));
  const [auditChain, setAuditChain] = useState<ScadaAuditLogEntry[]>(() => getScadaAuditChain(selectedCityId));
  const [chainStatus, setChainStatus] = useState(() => verifyAuditChain(selectedCityId));
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedSinkForOverride, setSelectedSinkForOverride] = useState<RoutingSink | null>(null);
  const [overridePct, setOverridePct] = useState(50);
  const [overrideJustification, setOverrideJustification] = useState('Emergency flood mitigation diversion');
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  const refreshState = () => {
    setSinks(getRoutingSinks(selectedCityId));
    setAuditChain(getScadaAuditChain(selectedCityId));
    setChainStatus(verifyAuditChain(selectedCityId));
  };

  const handleRunAutomatedDiversion = () => {
    setIsSimulating(true);
    setTimeout(() => {
      triggerAutomatedDiversionMatrix(selectedCityId);
      refreshState();
      setIsSimulating(false);
    }, 600);
  };

  const handleConfirmOverride = () => {
    if (!selectedSinkForOverride) return;
    executeManualGateOverride(
      selectedCityId,
      selectedSinkForOverride.sink_id,
      overridePct,
      'OP-MUNICIPAL-LEAD',
      overrideJustification
    );
    refreshState();
    setOverrideSuccessMsg(`Gate ${selectedSinkForOverride.display_name} position locked at ${overridePct}%. Cryptographically signed on-chain.`);
    setTimeout(() => setOverrideSuccessMsg(null), 4000);
    setSelectedSinkForOverride(null);
  };

  const totalDivertedM3 = sinks.reduce((sum, s) => sum + Math.round((s.current_intake_lps * 300) / 1000), 0);
  const totalIntakeLps = sinks.reduce((sum, s) => sum + s.current_intake_lps, 0);
  const activeGatesCount = sinks.filter((s) => s.gate_open_pct > 0).length;

  const filteredSinks = filterType === 'ALL'
    ? sinks
    : sinks.filter((s) => s.sink_type === filterType);

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div>
          <p className="ui-eyebrow">SCADA · Excess Water</p>
          <h2 className="ui-title mt-0.5">{t.hydroRouting.title}</h2>
          <p className="ui-subtitle mt-1.5">{t.hydroRouting.subTitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRunAutomatedDiversion}
            disabled={isSimulating}
            className="ui-btn ui-btn-primary flex-1"
          >
            <Zap className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? t.hydroRouting.executingDiversion : t.hydroRouting.triggerAutoDiversion}</span>
          </button>
          <button onClick={refreshState} className="ui-btn" title="Refresh SCADA telemetry">
            <RefreshCw />
            <span>{t.hydroRouting.syncBtn}</span>
          </button>
        </div>
      </section>

      {overrideSuccessMsg && (
        <div className="ui-notice">
          <CheckCircle2 />
          <span>{overrideSuccessMsg}</span>
        </div>
      )}

      {/* Telemetry KPIs */}
      <div className="ui-kpi-grid">
        <div className="ui-kpi">
          <div className="ui-kpi-label">
            <span>{t.hydroRouting.divertedVolume}</span>
            <Droplets className="text-sky-500" />
          </div>
          <div>
            <span className="ui-kpi-value">{totalDivertedM3.toLocaleString()}</span>
            <span className="ui-kpi-unit">m³ / 5min</span>
          </div>
          <p className="ui-kpi-foot">
            {t.hydroRouting.activeBypassFlow}{' '}
            <strong className="ui-mono" style={{ color: 'var(--text-primary)' }}>{totalIntakeLps.toLocaleString()} LPS</strong>
          </p>
        </div>

        <div className="ui-kpi">
          <div className="ui-kpi-label">
            <span>{t.hydroRouting.activeSluiceGates}</span>
            <Sliders className="text-sky-500" />
          </div>
          <div>
            <span className="ui-kpi-value">{activeGatesCount} / {sinks.length}</span>
            <span className="ui-kpi-unit">{t.hydroRouting.gatesOpen}</span>
          </div>
          <p className="ui-kpi-foot">
            {t.hydroRouting.scadaStatus}{' '}
            <span className="font-bold" style={{ color: 'var(--color-status-safe)' }}>{t.hydroRouting.allResponding}</span>
          </p>
        </div>

        <div className="ui-kpi">
          <div className="ui-kpi-label">
            <span>{t.hydroRouting.bufferHeadroom}</span>
            <Database className="text-purple-500" />
          </div>
          <div>
            <span className="ui-kpi-value">{sinks.reduce((sum, s) => sum + s.current_available_m3, 0).toLocaleString()}</span>
            <span className="ui-kpi-unit">m³</span>
          </div>
          <p className="ui-kpi-foot">{t.hydroRouting.storageRemaining}</p>
        </div>

        <div className="ui-kpi">
          <div className="ui-kpi-label">
            <span>{t.hydroRouting.systemAuditLog}</span>
            <ShieldCheck style={{ color: 'var(--color-verified)' }} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="ui-kpi-value" style={{ color: 'var(--color-verified)' }}>100%</span>
            <span className="ui-chip ui-chip-ok">{t.hydroRouting.tamperProof}</span>
          </div>
          <p className="ui-kpi-foot ui-mono truncate">
            Head: {chainStatus.headHash ? `${chainStatus.headHash.substring(0, 12)}…` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Receiving sinks */}
      <section className="ui-card space-y-3">
        <div className="min-w-0">
          <h3 className="ui-section-title">
            <Layers />
            <span>{t.hydroRouting.sluiceRegistryTitle}</span>
          </h3>
          <p className="ui-section-sub">{t.hydroRouting.infrastructureSub}</p>
        </div>

        <div>
          <label className="ui-label" htmlFor="hydro-sink-filter">{t.hydroRouting.filterSink}</label>
          <select
            id="hydro-sink-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="ui-input cursor-pointer"
          >
            <option value="ALL">{t.hydroRouting.allSinks}</option>
            <option value="STP_EQUALIZATION_TANK">{t.hydroRouting.stpSinks}</option>
            <option value="GROUNDWATER_MAR_WELL">{t.hydroRouting.marSinks}</option>
            <option value="URBAN_LAKE">{t.hydroRouting.lakeSinks}</option>
          </select>
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredSinks.map((sink) => {
            const usedM3 = sink.max_capacity_m3 - sink.current_available_m3;
            const fillPct = Math.round((usedM3 / sink.max_capacity_m3) * 100);

            return (
              <article
                key={sink.sink_id}
                onClick={() => onSelectFeature?.(sink.sink_id)}
                className="ui-card-muted ui-card-interactive space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="ui-chip ui-chip-info ui-mono">{sink.sink_type.replace(/_/g, ' ')}</span>
                  <span className="ui-chip ui-chip-ok">
                    <Radio className="w-3 h-3" />
                    {sink.operational_status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {sink.display_name}
                  </h4>
                  <p className="text-2xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>
                    Source: {sink.data_source}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>{t.hydroRouting.storageFill}</span>
                    <span className="ui-mono font-extrabold">{fillPct}%</span>
                  </div>
                  <div className="ui-meter">
                    <span
                      style={{
                        width: `${Math.min(100, fillPct)}%`,
                        background: fillPct > 65 ? 'var(--color-status-critical)' : 'var(--color-selection-active)'
                      }}
                    />
                  </div>
                </div>

                <dl className="ui-kv">
                  <div>
                    <dt>{t.hydroRouting.intakeFlow}</dt>
                    <dd>{sink.current_intake_lps} LPS</dd>
                  </div>
                  <div>
                    <dt>{t.hydroRouting.sluiceGate}</dt>
                    <dd>{sink.gate_open_pct}% {t.hydroRouting.openLabel}</dd>
                  </div>
                </dl>

                <button
                  onClick={() => {
                    setSelectedSinkForOverride(sink);
                    setOverridePct(sink.gate_open_pct);
                  }}
                  className="ui-btn w-full"
                >
                  <Sliders />
                  <span>{t.hydroRouting.adjustActuator}</span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* SCADA action ledger */}
      <section className="ui-card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="ui-section-title">
              <FileCheck />
              <span>{t.hydroRouting.scadaAuditLedger}</span>
            </h3>
            <p className="ui-section-sub">{t.hydroRouting.genesisToHead}</p>
          </div>
          <span className="ui-chip ui-chip-ok ui-mono shrink-0">
            <Lock className="w-3 h-3" />
            {auditChain.length} {t.hydroRouting.blocksVerified}
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {auditChain.map((entry) => (
            <div key={entry.log_id} className="ui-card-muted space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="ui-chip ui-chip-info ui-mono">{t.hydroRouting.blockIndex}{entry.block_index}</span>
                  <span className={`ui-chip ui-mono ${entry.action_type === 'MANUAL_OVERRIDE' ? 'ui-chip-warn' : 'ui-chip-info'}`}>
                    {entry.action_type}
                  </span>
                </div>
                <span className="text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-2xs ui-mono font-bold" style={{ color: 'var(--text-secondary)' }}>{entry.gate_id}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.justification}</p>
              <div className="space-y-0.5 text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                <div className="truncate">{t.hydroRouting.prevHash} {entry.previous_hash.substring(0, 24)}…</div>
                <div className="truncate" style={{ color: 'var(--color-status-safe)' }}>
                  Sig (SHA-256): {entry.hash_signature.substring(0, 24)}…
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manual sluice gate actuator modal */}
      {selectedSinkForOverride && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="ui-card !p-5 max-w-md w-full space-y-4 shadow-2xl" style={{ background: 'var(--surface-overlay)' }}>
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h4 className="ui-section-title !text-base">
                <Sliders />
                <span>{t.hydroRouting.overrideModalTitle}</span>
              </h4>
              <button
                onClick={() => setSelectedSinkForOverride(null)}
                className="text-lg leading-none px-1"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="ui-label">{t.hydroRouting.targetInfrastructure}</span>
                <p className="text-sm font-extrabold">{selectedSinkForOverride.display_name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="ui-label !mb-0">{t.hydroRouting.gatePosition}</span>
                  <span className="ui-mono text-sm font-extrabold" style={{ color: 'var(--color-action-primary)' }}>
                    {overridePct}% {t.hydroRouting.openLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={overridePct}
                  onChange={(e) => setOverridePct(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                  <span>0% ({t.hydroRouting.closedLabel})</span>
                  <span>50%</span>
                  <span>100% ({selectedSinkForOverride.max_intake_rate_lps} LPS)</span>
                </div>
              </div>

              <div>
                <label className="ui-label">{t.hydroRouting.operationalJustification}</label>
                <input
                  type="text"
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div
                className="ui-card-muted !p-2.5 text-2xs"
                style={{ borderColor: 'color-mix(in srgb, var(--color-status-warning) 40%, transparent)' }}
              >
                <span className="font-extrabold block" style={{ color: 'var(--color-status-warning)' }}>Audit Log Notice</span>
                <p style={{ color: 'var(--text-secondary)' }}>{t.hydroRouting.auditLogNotice}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setSelectedSinkForOverride(null)} className="ui-btn">
                {t.hydroRouting.cancelBtn}
              </button>
              <button onClick={handleConfirmOverride} className="ui-btn ui-btn-primary">
                <Lock />
                <span>{t.hydroRouting.signDispatchBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
