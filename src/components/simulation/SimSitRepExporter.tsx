'use client';

import React from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import { CITIES } from '@/lib/mock-data';
import { X, Printer, Shield, AlertTriangle, Sparkles, History, FileText, Check } from 'lucide-react';

interface SimSitRepExporterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimSitRepExporter: React.FC<SimSitRepExporterProps> = ({ isOpen, onClose }) => {
  const {
    selectedEvent,
    selectedCityId,
    currentSnapshot,
    aiDecisionOverride,
    currentRainfallMmHr,
    currentTimeOffsetMins,
    currentFrame,
  } = useSimulationContext();

  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const city = CITIES[selectedCityId];
  const now = new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdownReport = () => {
    if (!selectedEvent || !currentSnapshot) return '';
    return `
# [SIMULATION REPLAY] HISTORICAL FLOOD SITUATION REPORT
**Event**: ${selectedEvent.eventTitle} (${selectedEvent.date})
**City**: ${city.name}
**Replay Timestep**: ${currentFrame?.timeLabel || `T+${currentTimeOffsetMins}m`}
**Generated**: ${now}
**Source Citation**: ${selectedEvent.primarySourceCitation.agency} - ${selectedEvent.primarySourceCitation.documentName}

---

## HYDRO-TELEMETRY SNAPSHOT
- **Current Rainfall Rate**: ${currentRainfallMmHr} mm/h
- **24h Event Total**: ${selectedEvent.totalRainfall24hMm} mm
- **Peak Intensity**: ${selectedEvent.peakIntensityMmHr} mm/h
- **Max Depth**: ${currentSnapshot.maxWaterDepthCm} cm
- **Critical Surcharge Nodes**: ${currentSnapshot.criticalSurchargeNodesCount}

## AI TRIAGE SUMMARY
${aiDecisionOverride?.sitRepSummary || 'No AI summary generated for this frame.'}

## HISTORICAL AFFECTED HOTSPOTS
${selectedEvent.affectedAreas
  .map(
    (a) =>
      `- **${a.hotspotName}** (${a.boroughOrZone}): Recorded ${a.recordedDepthRangeCm[0]}–${a.recordedDepthRangeCm[1]} cm. ${a.impactDescription}`
  )
  .join('\n')}

---
*DISCLAIMER: This document was generated in AquaAlert Simulation Replay Mode using historical IMD/NDRF benchmark data. NOT LIVE OPERATIONAL DATA.*
    `.trim();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-slate-100 relative">
        {/* Top Watermark */}
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-2.5 flex items-center justify-between text-amber-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold uppercase tracking-wider">
              [SIMULATION REPLAY REPORT] — HISTORICAL BENCHMARK DATA
            </span>
          </div>
          <span>NOT LIVE TELEMETRY</span>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-sky-400">
            <Shield className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              Situation Report — {selectedEvent?.eventTitle || city.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-200 text-xs space-y-4 font-mono relative overflow-hidden">
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none font-bold text-6xl text-amber-500 rotate-[-25deg]">
            SIMULATION REPLAY
          </div>

          <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-sky-400">
                  MINISTRY OF EARTH SCIENCES / NDMA
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Deterministic Replay Engine
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                AquaAlert Post-Event Hydro-Sim & Disaster Triage System
              </p>
              <p className="text-xs font-bold text-amber-300 mt-1">
                HISTORICAL EVENT: {selectedEvent?.eventTitle.toUpperCase()} ({selectedEvent?.date})
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              <p>Generated: {now}</p>
              <p>
                Sim Timestep:{' '}
                <span className="text-sky-300 font-bold font-mono">
                  {currentFrame?.timeLabel}
                </span>
              </p>
            </div>
          </div>

          {/* AI SitRep Synthesis */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-200 border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1 text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                EXECUTIVE SITUATION REPORT SUMMARY
              </span>
              <span className="text-[9.5px] font-normal text-slate-400">
                Simulation Step {currentSnapshot ? currentFrame?.stepIndex! + 1 : 0}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
              {aiDecisionOverride?.sitRepSummary || 'No AI summary available for this frame.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-slate-400 text-[10px]">Precipitation Rate</p>
              <p className="text-sm font-bold text-sky-400">{currentRainfallMmHr} mm/h</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-slate-400 text-[10px]">Max Inundation Depth</p>
              <p className="text-sm font-bold text-amber-400">
                {currentSnapshot?.maxWaterDepthCm || 0} cm
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-slate-400 text-[10px]">Critical Surcharged Drains</p>
              <p className="text-sm font-bold text-red-400">
                {currentSnapshot?.criticalSurchargeNodesCount || 0}
              </p>
            </div>
          </div>

          {/* Citation / Provenance Box */}
          {selectedEvent && (
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-1 text-[11px] font-sans">
              <div className="flex items-center gap-1.5 font-semibold text-blue-300 font-mono text-[11px]">
                <History className="w-3.5 h-3.5 text-blue-400" />
                PRIMARY HISTORICAL SOURCE CITATION
              </div>
              <div className="text-slate-300">
                <span className="font-semibold text-white">Agency:</span>{' '}
                {selectedEvent.primarySourceCitation.agency} —{' '}
                <span className="font-semibold text-white">Document:</span>{' '}
                {selectedEvent.primarySourceCitation.documentName} ({selectedEvent.primarySourceCitation.archiveRef})
              </div>
            </div>
          )}

          {/* Affected Areas */}
          {selectedEvent && (
            <div className="space-y-2">
              <p className="font-bold text-slate-200 flex items-center space-x-1.5 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                <span>BENCHMARK HISTORICAL AFFECTED ZONES</span>
              </p>
              <div className="space-y-1.5">
                {selectedEvent.affectedAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-sans flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-200">
                        {area.hotspotName} ({area.boroughOrZone})
                      </span>
                      <span className="text-red-400 font-bold">
                        {area.recordedDepthRangeCm[0]}–{area.recordedDepthRangeCm[1]} cm
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10.5px]">
                      {area.impactDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
