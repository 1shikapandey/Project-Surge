'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TimeSlider } from '@/components/TimeSlider';
import { DrainageGraphPanel } from '@/components/DrainageGraphPanel';
import { AlertFeed } from '@/components/AlertFeed';
import { SitRepExporter } from '@/components/SitRepExporter';
import { TideWaterbodyWidget } from '@/components/TideWaterbodyWidget';
import { SurgeAppTutorialOverlay, SURGE_AUTHORITY_TUTORIAL_KEY } from '@/components/SurgeAppTutorialOverlay';
import { CityId, CITIES, CitizenReport } from '@/lib/mock-data';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { getPumpingStationsForCity } from '@/lib/pumping-station-service';
import type { AiDecisionOutput } from '@/lib/flood-decision-service';
import {
  Building2,
  Zap,
  FileText,
  CheckCircle2,
  Power,
  Languages,
  ArrowLeft,
  Map,
  Sliders,
  Sparkles,
  Cpu,
  AlertOctagon,
  UserCheck,
  PhoneCall,
  Camera,
  Truck,
  ShieldCheck,
  X,
  HelpCircle,
  ThumbsUp,
  MapPin,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/translations';
import { ThemeToggle } from '@/components/ThemeToggle';

// Dynamically import OpenLayersMapCanvas with SSR disabled
const OpenLayersMapCanvas = dynamic(
  () => import('@/components/OpenLayersMapCanvas').then((mod) => mod.OpenLayersMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 border-3 border-blue-600 dark:border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-blue-700 dark:text-sky-400 font-mono font-bold">
          Loading OpenLayers Authority Command GIS Canvas...
        </p>
      </div>
    )
  }
);

interface AuthorityDashboardProps {
  selectedCityId: CityId;
  onSelectCity: (cityId: CityId) => void;
  onGoToLanding: () => void;
  onGoToCitizenDashboard: () => void;
  authorityAuth: { isLoggedIn: boolean; loginId: string; cityId: CityId };
  onLogoutAuthority: () => void;
  citizenReports?: CitizenReport[];
  onAddReport?: (report: CitizenReport) => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  selectedCityId,
  onSelectCity,
  onGoToLanding,
  onGoToCitizenDashboard,
  authorityAuth,
  onLogoutAuthority,
  citizenReports = [],
  onAddReport
}) => {
  const { lang, setLang, t, supportedLanguages } = useLanguage();
  const [timeOffsetMins, setTimeOffsetMins] = useState(0);
  const [isSitRepModalOpen, setIsSitRepModalOpen] = useState(false);
  const [pumpStates, setPumpStates] = useState<Record<string, boolean>>({});
  const [mobileTab, setMobileTab] = useState<'map' | 'panel'>('map');
  const [aiDecision, setAiDecision] = useState<AiDecisionOutput | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Local state for interactive verification & crew dispatch on citizen reports
  const [reportsList, setReportsList] = useState<CitizenReport[]>(citizenReports);
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Tutorial overlay state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    setReportsList(citizenReports);
  }, [citizenReports]);

  // Auto launch tutorial for first-time authority command visitors
  useEffect(() => {
    try {
      const seen = localStorage.getItem(SURGE_AUTHORITY_TUTORIAL_KEY);
      if (!seen) {
        setIsTutorialOpen(true);
      }
    } catch (e) {}
  }, []);

  const [liveRainTimeline, setLiveRainTimeline] = useState<number[] | null>(null);

  useEffect(() => {
    fetch(`/api/nowcast?city=${selectedCityId}&time=${timeOffsetMins}`)
      .then(res => res.json())
      .then(data => {
        if (data.aiDecision) {
          setAiDecision(data.aiDecision);
        }
        if (data.openMeteoTelemetry?.nowcastTimelineMmHr) {
          setLiveRainTimeline(data.openMeteoTelemetry.nowcastTimelineMmHr);
        }
      })
      .catch(() => {});
  }, [selectedCityId, timeOffsetMins]);

  const city = CITIES[selectedCityId];
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId, liveRainTimeline || undefined, pumpStates);
  const pumpingStations = getPumpingStationsForCity(selectedCityId);

  const togglePump = (pumpId: string) => {
    setPumpStates((prev) => {
      const current = prev[pumpId] ?? true;
      return {
        ...prev,
        [pumpId]: !current
      };
    });
  };

  const handleVerifyReport = (id: string) => {
    setReportsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, verified: true } : r))
    );
    setDispatchToast(`Ground report verified & synced across disaster control cell.`);
    setTimeout(() => setDispatchToast(null), 3500);
  };

  const handleDispatchCrew = (r: CitizenReport) => {
    setDispatchToast(`Dewatering Pump Truck #104 & Crew Dispatched to ${r.locationName}!`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  const handleDismissReport = (id: string) => {
    setReportsList((prev) => prev.filter((r) => r.id !== id));
    setDispatchToast(`Report dismissed by Authority Operator.`);
    setTimeout(() => setDispatchToast(null), 3000);
  };

  const cityFilteredReports = reportsList.filter(
    (r) => r.cityId === selectedCityId || !r.cityId
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-200">
      
      {/* ── Authority Command Header Navbar ─────────────────────────────────── */}
      <header className="w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl text-slate-900 dark:text-white px-4 md:px-5 py-2.5 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Left Side: Landing Return & Brand Header */}
        <div className="flex items-center space-x-3" data-tut="auth-header-brand">
          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all border border-slate-200 dark:border-slate-700/80 active:scale-95"
            title={t.nav.backToLanding}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm md:text-base font-black tracking-tight text-slate-900 dark:text-white font-mono">
                  {t.dashboard.title}
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  {city.name} Command Cell
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">{t.dashboard.subTitle}</p>
            </div>
          </div>
        </div>

        {/* Right Controls: Theme, City, SitRep, Tutorial & Officer Badge */}
        <div className="flex items-center space-x-2 flex-wrap">
          
          {/* Guide Tutorial Launcher Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold transition-all active:scale-95"
            title="Launch Interactive Command Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Guide Tutorial</span>
          </button>

          <ThemeToggle className="h-8" />

          {/* Language Selector */}
          {setLang && (
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-900 dark:text-white">
              <Languages className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 mr-1.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* City Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-900 dark:text-white">
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400 mr-1 font-medium">{t.nav.selectCity}:</span>
            <select
              value={selectedCityId}
              onChange={(e) => onSelectCity(e.target.value as CityId)}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="mumbai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mumbai</option>
              <option value="delhi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delhi NCR</option>
              <option value="chennai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chennai</option>
            </select>
          </div>

          {/* SitRep Exporter Button */}
          <button
            data-tut="auth-sitrep-export"
            onClick={() => setIsSitRepModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.dashboard.exportSitRep}</span>
          </button>

          {/* Officer Credentials */}
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-mono font-bold text-[11px] truncate max-w-[100px]">{authorityAuth.loginId.split('.')[0]}</span>
          </div>
        </div>
      </header>

      {/* Dispatch Action Notification Banner */}
      {dispatchToast && (
        <div className="bg-emerald-600 text-white text-xs font-extrabold py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-md shrink-0 animate-fadeIn">
          <Truck className="w-4 h-4 animate-bounce" />
          <span>{dispatchToast}</span>
        </div>
      )}

      {/* Mobile View Switcher (Visible on screens < lg) */}
      <div className="lg:hidden flex justify-center px-4 pt-2.5">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl flex space-x-1 border border-slate-200 dark:border-slate-800 shadow-2xs w-full max-w-sm">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              mobileTab === 'map' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Command GIS Map</span>
          </button>
          <button
            onClick={() => setMobileTab('panel')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              mobileTab === 'panel' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>SCADA & Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main Authority Command Workspace */}
      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1900px] mx-auto w-full lg:h-[calc(100vh-76px)] overflow-y-auto lg:overflow-hidden">
        
        {/* Left Side Authority Controls (4 Cols on Desktop, Toggled on Mobile) */}
        <div className={`${mobileTab === 'panel' ? 'flex' : 'hidden'} lg:flex lg:col-span-4 flex-col gap-3.5 overflow-y-auto pr-1 custom-scrollbar`}>
          
          {/* AI Operational Triage & SitRep Synthesis Panel */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3" data-tut="auth-ai-triage">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    Operational AI Triage Layer
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">DeepSeek R1 1.5B • Non-Generative Synthesis</p>
                </div>
              </div>
              {aiDecision?.aiAssisted ? (
                <span className="text-[9.5px] bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                  AI Active
                </span>
              ) : (
                <span className="text-[9.5px] bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/30 flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                  Raw Compute
                </span>
              )}
            </div>

            {/* AI SitRep Text */}
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {aiDecision?.sitRepSummary || 'Synthesizing hydro-telemetry decision snapshot...'}
            </p>

            {/* Prioritized Road Risks List */}
            {aiDecision?.prioritizedRoadRisks && aiDecision.prioritizedRoadRisks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10.5px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Prioritized Road Corridors ({aiDecision.prioritizedRoadRisks.length})
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-[10.5px]">
                  {aiDecision.prioritizedRoadRisks.map(r => {
                    const isSelected = selectedFeatureId === r.roadId;
                    return (
                      <div
                        key={r.roadId}
                        onClick={() => {
                          setSelectedFeatureId(r.roadId);
                          setMobileTab('map');
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all hover:border-sky-400 dark:hover:border-slate-700 ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={`w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                          }`}>
                            #{r.priorityRank}
                          </span>
                          <span className="font-bold truncate">{r.roadName}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">{r.waterDepthCm} cm</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── CITIZEN REPORTED GROUND TRUTH & WATER SUMPS DESK ───────────────── */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3" data-tut="auth-citizen-reports-desk">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Citizen Reported Issues & Water Sumps
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Live Camera Snapshots & Verified Mobile Telemetry</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                {cityFilteredReports.length} Reports
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {cityFilteredReports.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center py-4 font-medium">
                  No citizen reports submitted for {city.name} yet.
                </p>
              ) : (
                cityFilteredReports.map((rep) => {
                  const isSelected = selectedFeatureId === rep.id;
                  const isVerified = rep.verified;

                  return (
                    <div
                      key={rep.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 transition-all text-xs ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-slate-900 dark:text-white'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Location & Verification Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          <h4 className="font-extrabold text-slate-900 dark:text-white truncate">
                            {rep.locationName}
                          </h4>
                        </div>

                        <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-extrabold shrink-0 border ${
                          isVerified
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        }`}>
                          {isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </div>

                      {/* Reporter Name & Mobile Number */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60 font-medium">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Reporter:</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {rep.reporterName || 'Apurv Sharma'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Mobile Contact:</span>
                          {rep.reporterMobile ? (
                            <a
                              href={`tel:+91${rep.reporterMobile}`}
                              className="font-mono font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                            >
                              <PhoneCall className="w-3 h-3 shrink-0" />
                              +91 {rep.reporterMobile}
                            </a>
                          ) : (
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">+91 9876543210</span>
                          )}
                        </div>
                      </div>

                      {/* Depth & Notes */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px]">
                          {rep.userNote || 'Water logging reported'}
                        </span>
                        <span className="font-mono font-black text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/20 px-2 py-0.5 rounded border border-sky-300 dark:border-sky-500/30">
                          {rep.waterDepthCm} cm
                        </span>
                      </div>

                      {/* Live Camera Photo Evidence Preview */}
                      {rep.photoUrl && (
                        <div
                          onClick={() => setActivePhotoModal(rep.photoUrl!)}
                          className="relative h-28 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer group"
                        >
                          <img
                            src={rep.photoUrl}
                            alt="Live site photo snapshot"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="text-[10px] font-bold bg-slate-900/90 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                              <Camera className="w-3 h-3 text-sky-400" />
                              Click to Inspect Live Photo
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons for Authority Operators */}
                      <div className="flex gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                        {!isVerified && (
                          <button
                            type="button"
                            onClick={() => handleVerifyReport(rep.id)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10.5px] shadow-xs flex items-center justify-center gap-1 active:scale-95"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify Report</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDispatchCrew(rep)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10.5px] shadow-xs flex items-center justify-center gap-1 active:scale-95"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch Crew</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissReport(rep.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10.5px]"
                          title="Dismiss Report"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tide & Water-Body Telemetry Widget */}
          <TideWaterbodyWidget
            selectedCityId={selectedCityId}
            timeOffsetMins={timeOffsetMins}
            rainfallRateMmHr={snapshot.rainfallRateMmHr}
          />

          {/* Dewatering Pump Control Station */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3" data-tut="auth-pump-controls">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.dashboard.pumpControllerTitle} ({city.name})
                </h2>
              </div>
              <span className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-sky-500/20">
                {pumpingStations.length} Stations
              </span>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {pumpingStations.map((pump) => {
                const isActive = pumpStates[pump.id] ?? pump.isOperational;

                return (
                  <div key={pump.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{pump.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Cap: {pump.capacityLps.toLocaleString()} L/s • Pumps: {pump.activePumpsCount}/{pump.totalPumpsCount}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{pump.locationName}</p>
                    </div>

                    <button
                      onClick={() => togglePump(pump.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                        isActive
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? t.dashboard.activatePump : t.dashboard.deactivatePump}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1D Drainage Network Graph Telemetry */}
          <DrainageGraphPanel
            selectedCityId={selectedCityId}
            timeOffsetMins={timeOffsetMins}
          />

          {/* Severe Inundation Bottlenecks Monitor */}
          <AlertFeed
            selectedCityId={selectedCityId}
            timeOffsetMins={timeOffsetMins}
            onSelectFeature={(id) => {
              setSelectedFeatureId(id);
              setMobileTab('map');
            }}
          />
        </div>

        {/* Center/Right OpenLayers Spatial GIS Canvas (8 Cols on Desktop, Toggled on Mobile) */}
        <div className={`${mobileTab === 'map' ? 'flex' : 'hidden'} lg:flex lg:col-span-8 flex-col gap-3 h-full relative`}>
          <div className="flex-1 relative min-h-[420px] md:min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
            <OpenLayersMapCanvas
              selectedCityId={selectedCityId}
              timeOffsetMins={timeOffsetMins}
              personaMode="authority"
              activeRoute={null}
              citizenReports={cityFilteredReports}
              selectedFeatureId={selectedFeatureId}
              setSelectedFeatureId={setSelectedFeatureId}
            />
          </div>

          {/* 0–3 Hour Forecast Timeline Scrubber */}
          <div data-tut="auth-time-scrubber">
            <TimeSlider
              timeOffsetMins={timeOffsetMins}
              setTimeOffsetMins={setTimeOffsetMins}
              cityId={selectedCityId}
              rainfallRateMmHr={snapshot.rainfallRateMmHr}
            />
          </div>
        </div>
      </main>

      {/* Situation Report Exporter Modal */}
      <SitRepExporter
        isOpen={isSitRepModalOpen}
        onClose={() => setIsSitRepModalOpen(false)}
        selectedCityId={selectedCityId}
        timeOffsetMins={timeOffsetMins}
      />

      {/* Photo Lightbox Preview Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-400" />
                Live Camera Site Photo Inspection
              </span>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img src={activePhotoModal} alt="Full resolution site photo" className="max-h-[75vh] w-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Authority Interactive Walkthrough Tutorial Overlay */}
      <SurgeAppTutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        mode="authority"
        onStepNavigate={(dataTut) => {
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
          if (isMobile) {
            if (['auth-ai-triage', 'auth-citizen-reports-desk', 'auth-pump-controls'].includes(dataTut)) {
              setMobileTab('panel');
            } else if (dataTut === 'auth-time-scrubber') {
              setMobileTab('map');
            }
          }
        }}
      />
    </div>
  );
};
