'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Truck,
  Filter,
  RefreshCw,
  Camera,
  X
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  CitizenSignal,
  SignalStatus,
  ISSUE_TYPE_CONFIG,
  getCitizenSignals,
  updateSignalStatus,
  getActiveBlockagePenalty
} from '@/lib/citizen-signals-service';

interface AdminModerationQueueProps {
  selectedCityId: string;
  onSelectFeature?: (id: string) => void;
}

export const AdminModerationQueue: React.FC<AdminModerationQueueProps> = ({ selectedCityId, onSelectFeature }) => {
  const { t } = useLanguage();
  const [signals, setSignals] = useState<CitizenSignal[]>(() => getCitizenSignals(selectedCityId));
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const refreshList = () => {
    setSignals(getCitizenSignals(selectedCityId));
  };

  const handleAction = (id: string, newStatus: SignalStatus, actionLabel: string) => {
    updateSignalStatus(id, newStatus, 'MUNICIPAL_DISASTER_CELL_01');
    refreshList();
    setActionNotice(`${actionLabel} applied for signal ${id}. Hydraulic capacity factor recalculated.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const pendingCount = signals.filter((s) => s.status === 'active').length;
  const validatedCount = signals.filter((s) => s.status === 'validated').length;
  const resolvedCount = signals.filter((s) => s.status === 'resolved').length;
  const activePenalty = getActiveBlockagePenalty(selectedCityId);

  const filteorangeSignals = signals.filter((s) => {
    if (activeTab === 'pending') return s.status === 'active';
    if (activeTab === 'validated') return s.status === 'validated';
    if (activeTab === 'resolved') return s.status === 'resolved';
    if (activeTab === 'rejected') return s.status === 'rejected';
    return true;
  });

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div>
          <p className="ui-eyebrow">Citizen Reports · Moderation</p>
          <h2 className="ui-title mt-0.5">Reports Queue</h2>
          <p className="ui-subtitle mt-1.5">
            Inspect, verify, and triage crowdsourced citizen reports to update hydraulic drag calculations and dispatch emergency response crews.
          </p>
        </div>
        <button onClick={refreshList} className="ui-btn self-start">
          <RefreshCw />
          <span>{t.adminModeration.syncQueue}</span>
        </button>
      </section>

      {actionNotice && (
        <div className="ui-notice">
          <CheckCircle2 />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI overview */}
      <div className="ui-kpi-grid">
        <div className="ui-kpi">
          <div className="ui-kpi-label"><span>{t.adminModeration.pendingOperator}</span></div>
          <div>
            <span className="ui-kpi-value" style={{ color: 'var(--color-status-warning)' }}>{pendingCount}</span>
            <span className="ui-kpi-unit">{t.adminModeration.awaitingTriage}</span>
          </div>
          <p className="ui-kpi-foot">{t.adminModeration.crowdsourcedReports}</p>
        </div>

        <div className="ui-kpi">
          <div className="ui-kpi-label"><span>{t.adminModeration.validatedBottlenecks}</span></div>
          <div>
            <span className="ui-kpi-value" style={{ color: 'var(--color-status-critical)' }}>{validatedCount}</span>
            <span className="ui-kpi-unit">{t.adminModeration.activeHotspots}</span>
          </div>
          <p className="ui-kpi-foot">{t.adminModeration.flowVelocities}</p>
        </div>

        <div className="ui-kpi">
          <div className="ui-kpi-label"><span>{t.adminModeration.clogsCleared}</span></div>
          <div>
            <span className="ui-kpi-value" style={{ color: 'var(--color-status-safe)' }}>{resolvedCount}</span>
            <span className="ui-kpi-unit">{t.adminModeration.fullyRestored}</span>
          </div>
          <p className="ui-kpi-foot">{t.adminModeration.desiltingCompleted}</p>
        </div>

        <div className="ui-kpi">
          <div className="ui-kpi-label"><span>{t.adminModeration.meshMultiplier}</span></div>
          <div>
            <span className="ui-kpi-value" style={{ color: 'var(--color-selection-active)' }}>
              {Math.round(activePenalty * 100)}%
            </span>
            <span className="ui-kpi-unit">{t.adminModeration.capacity}</span>
          </div>
          <p className="ui-kpi-foot">{t.adminModeration.swmmCalibration}</p>
        </div>
      </div>

      {/* Moderation queue stream */}
      <section className="ui-card space-y-3" data-tut="auth-citizen-reports-desk">
        <h3 className="ui-section-title">
          <Filter />
          <span>{t.adminModeration.triageStream}</span>
        </h3>

        <div className="ui-segment" role="tablist">
          {[
            { id: 'pending', label: `${t.adminModeration.pending} (${pendingCount})` },
            { id: 'validated', label: `${t.adminModeration.validated} (${validatedCount})` },
            { id: 'resolved', label: `${t.adminModeration.resolved} (${resolvedCount})` },
            { id: 'all', label: `${t.adminModeration.allReports} (${signals.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {filteorangeSignals.length === 0 ? (
            <div className="py-8 text-center text-xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
              {t.adminModeration.noReports}
            </div>
          ) : (
            filteorangeSignals.map((sig) => {
              const cfg = ISSUE_TYPE_CONFIG[sig.issueType];
              return (
                <article
                  key={sig.id}
                  onClick={() => onSelectFeature?.(sig.id)}
                  className="ui-card-muted ui-card-interactive space-y-2.5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${cfg.badgeColor}`}>
                      {cfg.label}
                    </span>
                    <span className="ui-chip ui-chip-info ui-mono">{sig.nearestManholeId}</span>
                    <span className="ui-chip ui-chip-warn ui-mono">
                      {Math.round(sig.severityRatio * 100)}% Capacity Drag
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold leading-snug">{sig.title}</h4>
                    <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {sig.description}
                    </p>
                  </div>

                  {sig.photoUrl && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoModal(sig.photoUrl!);
                      }}
                      className="relative h-28 rounded-lg overflow-hidden cursor-pointer group"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <img src={sig.photoUrl} alt="Photo evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1.5 right-1.5 text-2xs ui-mono bg-slate-900/90 text-white px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                        <Camera className="w-3 h-3 text-sky-400" />
                        Inspect Photo
                      </span>
                    </div>
                  )}

                  <div className="text-2xs space-y-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    <p>
                      Reporter: <strong style={{ color: 'var(--text-primary)' }}>{sig.reporterAlias}</strong>
                      {' • '}
                      {new Date(sig.reportedAt).toLocaleTimeString()}
                    </p>
                    <p className="ui-mono">
                      Coords: <strong style={{ color: 'var(--text-primary)' }}>{sig.latitude.toFixed(4)}, {sig.longitude.toFixed(4)}</strong>
                    </p>
                    {sig.verifiedBy && (
                      <p className="font-bold" style={{ color: 'var(--color-status-safe)' }}>Verified by: {sig.verifiedBy}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {(sig.status === 'active' || sig.status === 'validated' || sig.status === 'resolved') && (
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      {sig.status === 'active' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(sig.id, 'validated', 'Verified & Applied Model Restriction');
                            }}
                            className="ui-btn ui-btn-primary flex-1"
                          >
                            <CheckCircle2 />
                            <span>{t.adminModeration.verifyRestrict}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(sig.id, 'rejected', 'Dismissed false report');
                            }}
                            className="ui-btn"
                            title="Dismiss report"
                            aria-label="Dismiss report"
                          >
                            <XCircle />
                          </button>
                        </>
                      )}

                      {sig.status === 'validated' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(sig.id, 'resolved', 'Desilting completed, capacity restored');
                          }}
                          className="ui-btn ui-btn-success flex-1"
                        >
                          <Truck />
                          <span>{t.adminModeration.dispatchCrew}</span>
                        </button>
                      )}

                      {sig.status === 'resolved' && (
                        <span className="ui-chip ui-chip-ok !text-xs !py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.adminModeration.clogCleared}
                        </span>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Photo lightbox modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-400" />
                Live Camera Photo Snapshot
              </span>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Close photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img src={activePhotoModal} alt="Photo snapshot" className="max-h-[75vh] w-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
