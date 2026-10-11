'use client';

import React, { useEffect, useState } from 'react';
import { X, Printer, Shield, FileCheck, AlertTriangle, Cpu, Sparkles, AlertOctagon } from 'lucide-react';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { CityId, CITIES } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';
import type { AiDecisionOutput } from '@/lib/flood-decision-service';

interface SitRepExporterProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCityId: CityId;
  timeOffsetMins: number;
}

export const SitRepExporter: React.FC<SitRepExporterProps> = ({
  isOpen,
  onClose,
  selectedCityId,
  timeOffsetMins
}) => {
  const { t } = useLanguage();
  const [aiDecision, setAiDecision] = useState<AiDecisionOutput | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingAi(true);
      fetch(`/api/nowcast?city=${selectedCityId}&time=${timeOffsetMins}`)
        .then(res => res.json())
        .then(data => {
          if (data.aiDecision) {
            setAiDecision(data.aiDecision);
          }
          setLoadingAi(false);
        })
        .catch(() => {
          setLoadingAi(false);
        });
    }
  }, [isOpen, selectedCityId, timeOffsetMins]);

  if (!isOpen) return null;

  const city = CITIES[selectedCityId];
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
  const now = new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-card rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-txt-primary">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-sky-400">
            <Shield className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-txt-primary text-sm">
              {t.sitrep.title} ({city.name})
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-action-primary hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.sitrep.generatePdf}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-txt-tertiary hover:text-txt-primary hover:bg-surface-elevated transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-surface-elevated p-5 rounded-xl border border-slate-800 text-txt-primary text-xs space-y-4 font-mono">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-sky-400">MINISTRY OF EARTH SCIENCES (MoES)</h2>
                {aiDecision?.aiAssisted ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                    AI-Assisted (DeepSeek R1 1.5B)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-amber-400" />
                    Raw Compute Only (Ollama Offline)
                  </span>
                )}
              </div>
              <p className="text-txt-tertiary text-[11px]">National Centre for Medium Range Weather Forecasting (NCMRWF)</p>
              <p className="text-xs font-bold text-txt-primary mt-1">{t.sitrep.summaryHeading} ({city.name.toUpperCase()})</p>
            </div>
            <div className="text-right text-[10px] text-txt-tertiary">
              <p>Generated: {now}</p>
              <p>Lead Time: <span className="text-sky-300 font-bold">{snapshot.timeLabel}</span></p>
            </div>
          </div>

          {/* AI Executive SitRep Synthesis */}
          <div className="p-3 rounded-lg bg-surface-card border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-txt-primary border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1 text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                EXECUTIVE SITUATION REPORT SUMMARY
              </span>
              <span className="text-[9.5px] font-normal text-txt-tertiary">
                {loadingAi ? 'Synthesizing...' : aiDecision?.aiAssisted ? 'DeepSeek R1 Reasoning' : 'Deterministic Synthesis'}
              </span>
            </div>
            <p className="text-[11px] text-txt-secondary leading-relaxed font-sans pt-1">
              {aiDecision?.sitRepSummary || 'Synthesizing live hydro-telemetry and road inundation states...'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-surface-card border border-slate-800">
              <p className="text-txt-tertiary text-[10px]">{t.slider.rainRateLabel}</p>
              <p className="text-sm font-bold text-sky-400">{snapshot.rainfallRateMmHr} mm/h</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-slate-800">
              <p className="text-txt-tertiary text-[10px]">{t.nav.maxDepth}</p>
              <p className="text-sm font-bold text-status-warning">{snapshot.maxWaterDepthCm} cm</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-slate-800">
              <p className="text-txt-tertiary text-[10px]">{t.drainage.criticalNodes}</p>
              <p className="text-sm font-bold text-status-warning">{snapshot.criticalSurchargeNodesCount}</p>
            </div>
          </div>

          {/* Advisory Escalation Flags */}
          {aiDecision?.advisoryEscalationFlags && aiDecision.advisoryEscalationFlags.length > 0 && (
            <div className="space-y-1.5 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-orange-300">
                <span className="flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-orange-400" />
                  ADVISORY ESCALATION SUGGESTIONS
                </span>
                <span className="text-[9px] uppercase tracking-wide bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-bold border border-orange-500/30">
                  Advisory Only — Requires Officer Sign-off
                </span>
              </div>
              <div className="space-y-1">
                {aiDecision.advisoryEscalationFlags.map(flag => (
                  <div key={flag.flagId} className="p-2 rounded bg-surface-card border border-orange-500/30 text-[10.5px] text-txt-secondary flex items-start gap-1.5 font-sans">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5 ${
                      flag.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      flag.severity === 'warning' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {flag.severity}
                    </span>
                    <span>{flag.recommendationText}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-bold text-txt-primary flex items-center space-x-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              <span>{t.sitrep.criticalZones}</span>
            </p>
            <div className="space-y-1.5">
              {snapshot.roadStates.filter(r => r.waterDepthCm >= 15).map(r => (
                <div key={r.roadId} className="flex justify-between p-2 rounded bg-surface-card border border-slate-800">
                  <span>{r.roadId}</span>
                  <span className="text-status-warning font-bold">{r.waterDepthCm} cm ({r.severity.toUpperCase()})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-txt-primary flex items-center space-x-1.5 text-[11px]">
              <FileCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>RECOMMENDED INTERVENTIONS</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-txt-secondary text-[11px]">
              <li>Deploy high-capacity mobile dewatering pumps at low elevation underpasses.</li>
              <li>Issue emergency traffic diversion alerts via Navigation API for critical corridors.</li>
              <li>Activate flood-safe transit corridors for ambulances and emergency vehicles.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

