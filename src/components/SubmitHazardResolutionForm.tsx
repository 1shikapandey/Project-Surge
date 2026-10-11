'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Wrench,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  FileCheck,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import {
  CitizenSignal,
  getCitizenSignals,
  updateSignalStatus,
  calculateNearestManhole,
  submitCitizenSignal,
  getActiveBlockagePenalty
} from '@/lib/citizen-signals-service';

interface SubmitHazardResolutionFormProps {
  selectedCityId: string;
  onSelectFeature?: (id: string) => void;
}

export const SubmitHazardResolutionForm: React.FC<SubmitHazardResolutionFormProps> = ({
  selectedCityId,
  onSelectFeature
}) => {
  const [signals, setSignals] = useState<CitizenSignal[]>(() => getCitizenSignals(selectedCityId));
  const activeAndValidated = signals.filter(
    (s) => s.status === 'active' || s.status === 'validated'
  );

  const [selectedSignalId, setSelectedSignalId] = useState<string>(
    activeAndValidated.length > 0 ? activeAndValidated[0].id : 'custom'
  );

  // Custom node fields if not selecting from list
  const [customNodeId, setCustomNodeId] = useState('MH-042 (Dadar TT Circle)');
  const [customLat, setCustomLat] = useState(19.0178);
  const [customLng, setCustomLng] = useState(72.8478);
  const [customTitle, setCustomTitle] = useState('');

  // Resolution details
  const [resolutionAction, setResolutionAction] = useState<string>('desilting');
  const [officerName, setOfficerName] = useState('Officer M. Sharma (MCGM Zone-3)');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const activePenalty = getActiveBlockagePenalty(selectedCityId);

  const handleSignalChange = (id: string) => {
    setSelectedSignalId(id);
    const target = signals.find((s) => s.id === id);
    if (target) {
      setCustomNodeId(target.nearestManholeId);
      setCustomLat(target.latitude);
      setCustomLng(target.longitude);
      setCustomTitle(target.title);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      let resolvedTitle = '';
      let targetNode = '';

      if (selectedSignalId !== 'custom') {
        const resolvedSignal = updateSignalStatus(
          selectedSignalId,
          'resolved',
          officerName,
          {
            notes: resolutionNotes || 'Resolved by municipal emergency response crew.',
            action: resolutionAction,
            photoUrl: photoPreview || undefined
          }
        );
        resolvedTitle = resolvedSignal?.title || 'Selected hazard';
        targetNode = resolvedSignal?.nearestManholeId || '';
      } else {
        // Create custom resolved signal
        const newSig = submitCitizenSignal({
          cityId: selectedCityId,
          issueType: 'blocked_inlet',
          title: customTitle || 'Direct Municipal Emergency Clearance',
          description: resolutionNotes || 'Proactive municipal de-sludging and pump clearance.',
          latitude: customLat,
          longitude: customLng,
          nearestManholeId: customNodeId,
          severityRatio: 0.1,
          reporterAlias: officerName,
          photoUrl: photoPreview || undefined
        });
        updateSignalStatus(newSig.id, 'resolved', officerName, {
          notes: resolutionNotes,
          action: resolutionAction,
          photoUrl: photoPreview || undefined
        });
        resolvedTitle = newSig.title;
        targetNode = newSig.nearestManholeId;
      }

      // Refresh signal state
      const freshList = getCitizenSignals(selectedCityId);
      setSignals(freshList);
      setIsSubmitting(false);

      const remainingActive = freshList.filter((s) => s.status === 'active' || s.status === 'validated');
      if (remainingActive.length > 0) {
        setSelectedSignalId(remainingActive[0].id);
      } else {
        setSelectedSignalId('custom');
      }

      setResolutionNotes('');
      setSuccessNotice(
        `Hazard resolution logged! Node ${targetNode} restored to 100% hydraulic capacity.`
      );

      setTimeout(() => setSuccessNotice(null), 5000);
    }, 400);
  };

  const selectedSignal = signals.find((s) => s.id === selectedSignalId);

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div>
          <p className="ui-eyebrow">Citizen Reports · Resolution</p>
          <h2 className="ui-title mt-0.5">Submit Hazard Resolution</h2>
          <p className="ui-subtitle mt-1.5">
            Log completed de-sludging, pump truck deployment, and drain unclogging actions to clear active bottlenecks and update hydraulic simulation models.
          </p>
        </div>
        <div className="ui-kpi">
          <div className="ui-kpi-label"><span>City Hydraulic Capacity</span></div>
          <div>
            <span className="ui-kpi-value" style={{ color: 'var(--color-status-safe)' }}>
              {Math.round(activePenalty * 100)}%
            </span>
          </div>
          <p className="ui-kpi-foot">
            {activeAndValidated.length} unresolved hotspot{activeAndValidated.length === 1 ? '' : 's'} remaining
          </p>
        </div>
      </section>

      {successNotice && (
        <div className="ui-notice">
          <CheckCircle2 />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Resolution form */}
      <form onSubmit={handleSubmit} className="ui-card space-y-4">
        {/* Step 1: hazard */}
        <div className="space-y-1.5">
          <label className="ui-section-title !text-xs" htmlFor="hazard-select">
            <AlertTriangle style={{ color: 'var(--color-status-warning)' }} />
            <span>Select Active Hazard / Bottleneck to Resolve</span>
          </label>
          <select
            id="hazard-select"
            value={selectedSignalId}
            onChange={(e) => handleSignalChange(e.target.value)}
            className="ui-input cursor-pointer"
          >
            {activeAndValidated.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.status.toUpperCase()}] {s.nearestManholeId} — {s.title}
              </option>
            ))}
            <option value="custom">+ Register New Direct Resolution (Unlisted Node)</option>
          </select>
        </div>

        {selectedSignal && selectedSignalId !== 'custom' && (
          <div className="ui-card-muted space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap font-bold">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--color-selection-active)' }}>
                <MapPin className="w-3.5 h-3.5" />
                <span>Target Node: {selectedSignal.nearestManholeId}</span>
              </span>
              <span className="ui-chip ui-chip-warn ui-mono">
                {Math.round(selectedSignal.severityRatio * 100)}% Blockage Penalty
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>{selectedSignal.description}</p>
            <p className="text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
              Reported by {selectedSignal.reporterAlias} at {new Date(selectedSignal.reportedAt).toLocaleTimeString()}
            </p>
          </div>
        )}

        {selectedSignalId === 'custom' && (
          <div className="ui-card-muted grid grid-cols-1 gap-3">
            <div>
              <label className="ui-label">Incident Title / Location Summary</label>
              <input
                type="text"
                required
                placeholder="e.g. Cleared trash rack choke at Breach Candy Sluice"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="ui-input"
              />
            </div>
            <div>
              <label className="ui-label">Manhole / Asset ID</label>
              <input
                type="text"
                required
                value={customNodeId}
                onChange={(e) => setCustomNodeId(e.target.value)}
                className="ui-input ui-mono"
              />
            </div>
            <div>
              <label className="ui-label">Coordinates (Lat, Lng)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={(e) => setCustomLat(Number(e.target.value))}
                  className="ui-input ui-mono"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={customLng}
                  onChange={(e) => setCustomLng(Number(e.target.value))}
                  className="ui-input ui-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: action category */}
        <div className="space-y-1.5">
          <span className="ui-section-title !text-xs">
            <Wrench />
            <span>Resolution Action Category</span>
          </span>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'desilting', label: 'Catchpit De-sludging & Grate Clearing', icon: Wrench },
              { id: 'pump_deployed', label: 'High-Capacity Dewatering Pump Deployed', icon: Truck },
              { id: 'sluice_opened', label: 'Outfall Floodgate / Sluice Opened', icon: Activity },
              { id: 'jetting', label: 'Storm Sewer Siphon High-Pressure Jetting', icon: Sparkles },
              { id: 'dredging', label: 'Culvert & Nalla Trash Rack Dredging', icon: Layers }
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = resolutionAction === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setResolutionAction(item.id)}
                  aria-pressed={isSelected}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-bold transition-all"
                  style={{
                    background: isSelected ? 'color-mix(in srgb, var(--color-status-safe) 12%, transparent)' : 'var(--surface-elevated)',
                    border: `1px solid ${isSelected ? 'var(--color-status-safe)' : 'var(--border)'}`,
                    color: isSelected ? 'color-mix(in srgb, var(--color-status-safe) 70%, var(--text-primary))' : 'var(--text-secondary)'
                  }}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: officer + notes */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="ui-label">Resolving Officer / Unit Designation</label>
            <input
              type="text"
              required
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="ui-input"
            />
          </div>
          <div>
            <label className="ui-label">Resolution Work Notes & Operations Summary</label>
            <input
              type="text"
              placeholder="e.g. Silt cleared using suction vehicle, free gravity discharge restored."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="ui-input"
            />
          </div>
        </div>

        {/* Step 4: photo evidence */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="ui-section-title !text-xs">
              <Camera />
              <span>Resolution Photo Evidence</span>
            </span>
            {photoPreview && (
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="text-2xs font-bold hover:underline"
                style={{ color: 'var(--color-status-severe)' }}
              >
                Clear Photo
              </button>
            )}
          </div>
          <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>Proof of Clearance</p>

          {photoPreview ? (
            <div className="relative h-32 w-full rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-status-safe)' }}>
              <img src={photoPreview} alt="Resolution Evidence" className="w-full h-full object-cover" />
              <span className="absolute bottom-1.5 right-1.5 text-2xs ui-mono bg-black/80 px-1.5 py-0.5 rounded text-emerald-300 font-bold">
                Proof Attached
              </span>
            </div>
          ) : (
            <div
              className="h-24 w-full rounded-lg flex flex-col items-center justify-center text-xs gap-1"
              style={{ border: '2px dashed var(--border)', color: 'var(--text-tertiary)' }}
            >
              <Camera className="w-5 h-5" />
              <span>No photo selected</span>
            </div>
          )}

          <div>
            <span className="ui-label">Select Quick Sample Evidence Photo</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Cleared Grate', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
                { label: 'De-watering Pump Truck', url: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=600&q=80' },
                { label: 'Open Sluice Drain', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoPreview(p.url)}
                  className="ui-chip hover:!border-[var(--color-status-safe)] transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="ui-btn ui-btn-success w-full !py-2.5 !text-sm">
          <CheckCircle2 className="!w-4 !h-4" />
          <span>{isSubmitting ? 'Logging Resolution...' : 'Confirm & Submit Hazard Resolution'}</span>
        </button>
      </form>
    </div>
  );
};
