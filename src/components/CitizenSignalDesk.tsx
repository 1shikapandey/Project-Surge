'use client';

import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  LocateFixed,
  Waves,
  CloudRain,
  Flame,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Camera,
  ShieldCheck,
  Filter,
  Sparkles,
  Send,
  UserCheck,
  Layers
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  CitizenSignal,
  SignalIssueType,
  ISSUE_TYPE_CONFIG,
  getCitizenSignals,
  submitCitizenSignal,
  upvoteCitizenSignal,
  calculateNearestManhole,
  getActiveBlockagePenalty
} from '@/lib/citizen-signals-service';

interface CitizenSignalDeskProps {
  selectedCityId: string;
  onSelectFeature?: (id: string) => void;
}

export const CitizenSignalDesk: React.FC<CitizenSignalDeskProps> = ({ selectedCityId, onSelectFeature }) => {
  const { t } = useLanguage();
  const [signals, setSignals] = useState<CitizenSignal[]>(() => getCitizenSignals(selectedCityId));
  const [selectedIssue, setSelectedIssue] = useState<SignalIssueType>('blocked_inlet');
  const [severityPct, setSeverityPct] = useState(75);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterAlias, setReporterAlias] = useState('');
  const [lat, setLat] = useState(19.0178);
  const [lon, setLon] = useState(72.8478);
  const [nearestNode, setNearestNode] = useState('MH-042 (Dadar TT Main)');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const activePenalty = getActiveBlockagePenalty(selectedCityId);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Number(pos.coords.latitude.toFixed(4));
          const newLon = Number(pos.coords.longitude.toFixed(4));
          setLat(newLat);
          setLon(newLon);
          setNearestNode(calculateNearestManhole(newLat, newLon));
          setIsLocating(false);
        },
        () => {
          setLat(19.0178);
          setLon(72.8478);
          setNearestNode(calculateNearestManhole(19.0178, 72.8478));
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handlePresetPhoto = (url: string) => {
    setPhotoPreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSignal = submitCitizenSignal({
      cityId: selectedCityId,
      issueType: selectedIssue,
      title,
      description: description || 'Citizen reported severe drainage bottleneck.',
      latitude: lat,
      longitude: lon,
      nearestManholeId: nearestNode,
      severityRatio: severityPct / 100,
      reporterAlias: reporterAlias || 'CitizenObserver',
      photoUrl: photoPreview || undefined
    });

    setSignals([newSignal, ...signals]);
    setTitle('');
    setDescription('');
    setPhotoPreview(null);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handleUpvote = (id: string) => {
    upvoteCitizenSignal(id);
    setSignals(getCitizenSignals(selectedCityId));
  };

  const filteorangeSignals = filterStatus === 'ALL'
    ? signals
    : signals.filter((s) => s.status === filterStatus);

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div>
          <p className="ui-eyebrow">Citizen Reports · Live</p>
          <h2 className="ui-title mt-0.5">Ground Alerts</h2>
          <p className="ui-subtitle mt-1.5">
            Real-time crowdsourced reports of street waterlogging, choked catch-basins, and drain overbank spills across the city.
          </p>
        </div>
      </section>

      {submitSuccess && (
        <div className="ui-notice">
          <CheckCircle2 />
          <span>Report submitted successfully! Queued for municipal review and placed on GIS vector mesh.</span>
        </div>
      )}

      {/* Live community stream */}
      <section className="ui-card space-y-3">
        <div className="min-w-0">
          <h3 className="ui-section-title">
            <Waves />
            <span>{t.citizenSignal.liveStreamHeader}</span>
          </h3>
          <p className="ui-section-sub">{t.citizenSignal.crowdObsSub}</p>
        </div>

        <div>
          <label className="ui-label" htmlFor="signal-status-filter">{t.citizenSignal.statusLabel}</label>
          <select
            id="signal-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="ui-input cursor-pointer"
          >
            <option value="ALL">{t.citizenSignal.allReports}</option>
            <option value="validated">Validated</option>
            <option value="active">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
          {filteorangeSignals.map((sig) => {
            const cfg = ISSUE_TYPE_CONFIG[sig.issueType];
            return (
              <article
                key={sig.id}
                onClick={() => onSelectFeature?.(sig.id)}
                className="ui-card-muted ui-card-interactive space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${cfg.badgeColor}`}>
                      {cfg.label}
                    </span>
                    <span className="ui-chip ui-chip-info ui-mono">{sig.nearestManholeId}</span>
                  </div>
                  <span className={`ui-chip uppercase ${
                    sig.status === 'validated'
                      ? 'ui-chip-ok'
                      : sig.status === 'resolved'
                      ? 'ui-chip-info'
                      : 'ui-chip-warn'
                  }`}>
                    {sig.status === 'validated' ? t.citizenSignal.verifiedByBmc : sig.status}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold leading-snug">{sig.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sig.description}</p>

                {sig.photoUrl && (
                  <div className="relative h-32 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <img src={sig.photoUrl} alt="Hazard photo" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 text-2xs ui-mono bg-black/75 px-1.5 py-0.5 rounded text-sky-300">
                      {t.citizenSignal.photoEvidence}
                    </span>
                  </div>
                )}

                <div
                  className="flex flex-wrap items-center justify-between gap-2 pt-2 text-2xs"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
                >
                  <span className="ui-mono">
                    By: {sig.reporterAlias} • {new Date(sig.reportedAt).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="ui-mono font-bold" style={{ color: 'var(--color-status-warning)' }}>
                      {Math.round(sig.severityRatio * 100)}% {t.citizenSignal.penalty}
                    </span>
                    <button
                      onClick={() => handleUpvote(sig.id)}
                      className="ui-btn !px-2 !py-1 !min-h-0 text-2xs"
                    >
                      <ThumbsUp style={{ color: 'var(--color-selection-active)' }} />
                      <span>{sig.upvotes}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
