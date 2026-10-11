'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LandingPage } from '@/components/LandingPage';
import { HeaderNavbar, AppTab } from '@/components/HeaderNavbar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { TimeSlider } from '@/components/TimeSlider';
import { RoutingWidget } from '@/components/RoutingWidget';
import { ReportModal } from '@/components/ReportModal';
import { AuthorityAuthModal } from '@/components/AuthorityAuthModal';
import { AuthorityDashboard } from '@/components/AuthorityDashboard';
import { HydroRoutingPanel } from '@/components/HydroRoutingPanel';
import { CitizenSignalDesk } from '@/components/CitizenSignalDesk';
import { AdminModerationQueue } from '@/components/AdminModerationQueue';
import { SubmitHazardResolutionForm } from '@/components/SubmitHazardResolutionForm';
import { WaterBodiesAtlas } from '@/components/WaterBodiesAtlas';
import { SitRepExporter } from '@/components/SitRepExporter';
import { NowcastPredictionCard } from '@/components/NowcastPredictionCard';
import { CityId, CITIES, INITIAL_CITIZEN_REPORTS, CitizenReport, NavigationRoute } from '@/lib/mock-data';
import { submitCitizenSignal } from '@/lib/citizen-signals-service';
import { SurgeAppTutorialOverlay, SURGE_AUTHORITY_TUTORIAL_KEY } from '@/components/SurgeAppTutorialOverlay';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { HISTORICAL_CLOUDBURST_EVENTS } from '@/lib/openmeteo-service';
import { CitizenGisLayersWidget, DEFAULT_CITIZEN_LAYERS, MapLayerVisibility } from '@/components/CitizenGisLayersWidget';
import { Map, Sliders, Zap, Radio, FileCheck, Anchor, Layers, Compass, HelpCircle, Activity, Users, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Dynamically import OpenLayersMapCanvas with SSR disabled
const OpenLayersMapCanvas = dynamic(
  () => import('@/components/OpenLayersMapCanvas').then((mod) => mod.OpenLayersMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-800">
        <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-cyan-400 font-mono font-bold">
          Loading OpenLayers Vector GIS Engine...
        </p>
      </div>
    )
  }
);

// Dynamically import CitizenAppView with SSR disabled
const CitizenAppView = dynamic(
  () => import('@/components/CitizenAppView').then((mod) => mod.CitizenAppView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-cyan-400 font-mono font-bold">
          Loading SURGE Citizen App...
        </p>
      </div>
    )
  }
);

function HomeContent() {
  const { lang, setLang, t } = useLanguage();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as AppTab | null;

  const [viewMode, setViewMode] = useState<'landing' | 'citizen_app' | 'citizen_dashboard' | 'authority_dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<AppTab>('gis_layers');
  const [selectedCityId, setSelectedCityId] = useState<CityId>('mumbai');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [timeOffsetMins, setTimeOffsetMins] = useState(0);
  const [mobileGisTab, setMobileGisTab] = useState<'map' | 'panel'>('map');
  const [layerVisibility, setLayerVisibility] = useState<MapLayerVisibility>(DEFAULT_CITIZEN_LAYERS);
  const [citizenReportsSubTab, setCitizenReportsSubTab] = useState<'signals' | 'queue' | 'resolution'>('signals');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.33);
  const [isResizing, setIsResizing] = useState(false);

  // Auto-switch to citizen_dashboard when URL contains ?tab= parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
      setViewMode('citizen_dashboard');
    }
  }, [tabParam]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftPanelWidth(newWidth);
        window.dispatchEvent(new Event('resize'));
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      window.dispatchEvent(new Event('resize'));
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Dispatch window resize event on sidebar collapse toggle so GIS Map canvas updates dimensions
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 310);
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed]);

  // Authority Authentication State
  const [authorityAuth, setAuthorityAuth] = useState<{ isLoggedIn: boolean; loginId: string; cityId: CityId } | null>(null);

  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Map Pin Picker State for Routing
  const [routePinMode, setRoutePinMode] = useState<'none' | 'origin' | 'destination'>('none');
  const [pinnedOrigin, setPinnedOrigin] = useState<[number, number] | null>(null);
  const [pinnedDestination, setPinnedDestination] = useState<[number, number] | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);
  const [authDefaultCity, setAuthDefaultCity] = useState<CityId>('mumbai');
  const [liveRainTimeline, setLiveRainTimeline] = useState<number[] | null>(null);

  // Fetch real-time fused precipitation telemetry from /api/nowcast for selected city
  useEffect(() => {
    let isMounted = true;
    if (selectedEventId) {
      setLiveRainTimeline(null);
      return;
    }
    const fetchLiveNowcast = async () => {
      try {
        const res = await fetch(`/api/nowcast?city=${selectedCityId}&time=${timeOffsetMins}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.openMeteoTelemetry?.nowcastTimelineMmHr) {
            setLiveRainTimeline(data.openMeteoTelemetry.nowcastTimelineMmHr);
          }
        }
      } catch (err) {
        console.warn('Live nowcast telemetry fetch failed:', err);
      }
    };
    fetchLiveNowcast();
    const interval = setInterval(fetchLiveNowcast, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCityId, timeOffsetMins, selectedEventId]);

  // Active rain timeline from selected event or live fused telemetry
  const activeEvent = HISTORICAL_CLOUDBURST_EVENTS.find((e) => e.id === selectedEventId);
  const effectiveRainTimeline = selectedEventId
    ? activeEvent?.timelineMmHr
    : liveRainTimeline || undefined;
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId, effectiveRainTimeline);

  const handleSelectCityFromLanding = (cityId: CityId) => {
    setSelectedCityId(cityId);
    setSelectedEventId(null);
    setPinnedOrigin(null);
    setPinnedDestination(null);
    setRoutePinMode('none');
    setViewMode('citizen_dashboard');
  };

  const handleLocationPicked = (mode: 'origin' | 'destination', coords: [number, number]) => {
    if (mode === 'origin') {
      setPinnedOrigin(coords);
    } else {
      setPinnedDestination(coords);
    }
  };

  const handleOpenAuthModal = (cityId?: CityId) => {
    if (cityId) setAuthDefaultCity(cityId);
    setIsAuthModalOpen(true);
  };

  const handleSuccessLogin = (cityId: CityId, loginId: string) => {
    setAuthorityAuth({ isLoggedIn: true, loginId, cityId });
    setSelectedCityId(cityId);
    setActiveTab('citizen_reports');
    setViewMode('authority_dashboard');
  };

  const handleLogoutAuthority = () => {
    setAuthorityAuth(null);
    setViewMode('citizen_dashboard');
  };

  const handleAddReport = (report: CitizenReport) => {
    setCitizenReports((prev) => [report, ...prev]);

    submitCitizenSignal({
      cityId: report.cityId,
      issueType: 'waterlogging',
      title: `Water Sump Report: ${report.locationName}`,
      description: `${report.userNote || 'Citizen ground observation.'} (Depth: ${report.waterDepthCm} cm)`,
      latitude: report.lat,
      longitude: report.lng,
      nearestManholeId: `MH-${Math.floor(100 + Math.random() * 800)} (${report.locationName})`,
      severityRatio: Math.min(0.95, Math.max(0.2, report.waterDepthCm / 100)),
      reporterAlias: report.reporterName ? `${report.reporterName} (+91 ${report.reporterMobile || ''})` : 'Verified Citizen',
      photoUrl: report.photoUrl
    });
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setViewMode('authority_dashboard');
  };

  // 1. Landing View
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onSelectCity={handleSelectCityFromLanding}
          onGoToCitizenApp={() => setViewMode('citizen_dashboard')}
          onOpenAuthModal={handleOpenAuthModal}
          authorityAuth={authorityAuth}
        />
        <AuthorityAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultCityId={authDefaultCity}
          onSuccessLogin={handleSuccessLogin}
        />
      </>
    );
  }

  // 2. Citizen Dashboard / Citizen Portal View (Only Citizen Portal)
  if (viewMode === 'citizen_app' || viewMode === 'citizen_dashboard') {
    return (
      <>
        <CitizenAppView
          selectedCityId={selectedCityId}
          onSelectCity={(cityId) => setSelectedCityId(cityId)}
          onGoToLanding={() => setViewMode('landing')}
          onOpenAuthModal={() => handleOpenAuthModal(selectedCityId)}
          citizenReports={citizenReports}
          onAddReport={handleAddReport}
        />
        <AuthorityAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultCityId={authDefaultCity}
          onSuccessLogin={handleSuccessLogin}
        />
      </>
    );
  }

  // 3. Authority Dashboard / Command Center View (The Main UI)
  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Top Navbar Header */}
      <HeaderNavbar
        selectedCityId={selectedCityId}
        onSelectCity={(cityId) => {
          setSelectedCityId(cityId);
          setSelectedEventId(null);
        }}
        onGoToLanding={() => setViewMode('landing')}
        onGoToCitizenApp={() => setViewMode('citizen_app')}
        authorityAuth={authorityAuth}
        onOpenAuthModal={() => handleOpenAuthModal(selectedCityId)}
        onLogoutAuthority={handleLogoutAuthority}
        onGoToAuthorityDashboard={() => setViewMode('authority_dashboard')}
        selectedEventId={selectedEventId}
        onSelectEventId={setSelectedEventId}
        lang={lang}
        setLang={setLang}
        maxWaterDepthCm={snapshot.maxWaterDepthCm}
        floodedRoadsCount={snapshot.totalFloodedRoadsCount}
        surchargingNodesCount={snapshot.criticalSurchargeNodesCount}
        rainfallRateMmHr={snapshot.rainfallRateMmHr}
        windSpeedKmh={snapshot.windCloudData?.windSpeedKmh}
        windDirectionCardinal={snapshot.windCloudData?.windDirectionCardinal}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSitRepModal={() => setIsSitRepOpen(true)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        timeOffsetMins={timeOffsetMins}
        onSelectFeature={(id) => {
          setSelectedFeatureId(id);
          setMobileGisTab('map');
        }}
      />

      {/* Main Body Container: Collapsible Sidebar + Content Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toggleable Sidebar */}
        <div className="hidden lg:block h-full">
          <DashboardSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            activeTab={activeTab}
            onSelectTab={handleTabChange}
            onGoToLanding={() => setViewMode('landing')}
            onLogoutAuthority={handleLogoutAuthority}
            authorityAuth={authorityAuth}
          />
        </div>

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-3 sm:p-4 max-w-[1900px] mx-auto w-full flex flex-col overflow-hidden">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex justify-center mb-3">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-xs">
              <button
                onClick={() => setMobileGisTab('panel')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  mobileGisTab === 'panel' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.common.panelTab}</span>
              </button>
              <button
                onClick={() => setMobileGisTab('map')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  mobileGisTab === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>{t.common.gisMapTab}</span>
              </button>
            </div>
          </div>

          <div
            className="flex-1 flex flex-col lg:flex-row gap-4 w-full min-h-0 overflow-hidden"
            style={{
              cursor: isResizing ? "col-resize" : "default",
              userSelect: isResizing ? "none" : "auto",
              "--left-width": `${leftPanelWidth}%`,
              "--right-width": `calc(${100 - leftPanelWidth}% - 1rem)`
            } as React.CSSProperties}
          >
            {/* ── LEFT NAVIGATION/CONTROL PANEL ───────────────── */}
            <div
              className={`${
                mobileGisTab === "panel" ? "flex w-full" : "hidden"
              } lg:flex lg:w-[var(--left-width)] flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pr-1 shrink-0`}
            >
              {/* Tab 1: GIS Map (Layers & Legend Manager) */}
              {activeTab === 'gis_layers' && (
                <CitizenGisLayersWidget
                  layerVisibility={layerVisibility}
                  setLayerVisibility={setLayerVisibility}
                  selectedCityId={selectedCityId}
                  timeOffsetMins={timeOffsetMins}
                />
              )}

              {/* Tab 2: Flood safe routing (Route planner & Predictions) */}
              {activeTab === 'flood_routing' && (
                <>
                  <RoutingWidget
                    selectedCityId={selectedCityId}
                    timeOffsetMins={timeOffsetMins}
                    activeRoute={activeRoute}
                    setActiveRoute={setActiveRoute}
                    routePinMode={routePinMode}
                    setRoutePinMode={setRoutePinMode}
                    pinnedOrigin={pinnedOrigin}
                    pinnedDestination={pinnedDestination}
                  />
                  <NowcastPredictionCard
                    cityId={selectedCityId}
                    timeOffsetMins={timeOffsetMins}
                  />
                </>
              )}

              {/* Tab 3: Excess water routing (1D Pipe Hydro Routing) */}
              {activeTab === 'excess_water' && (
                <HydroRoutingPanel
                  selectedCityId={selectedCityId}
                  onSelectFeature={(id) => {
                    setSelectedFeatureId(id);
                    setMobileGisTab('map');
                  }}
                />
              )}

              {/* Tab 4: Citizen reports (Ground alerts, Reports queue, Submit hazard resolution) */}
              {activeTab === 'citizen_reports' && (
                <div className="flex flex-col gap-3">
                  {/* Sub-tab navigation */}
                  <div className="ui-segment" role="tablist" aria-label="Citizen reports sections">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={citizenReportsSubTab === 'signals'}
                      onClick={() => setCitizenReportsSubTab('signals')}
                    >
                      <Activity />
                      <span>Ground alerts</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={citizenReportsSubTab === 'queue'}
                      onClick={() => setCitizenReportsSubTab('queue')}
                    >
                      <FileCheck />
                      <span>Reports queue</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={citizenReportsSubTab === 'resolution'}
                      onClick={() => setCitizenReportsSubTab('resolution')}
                    >
                      <ShieldCheck />
                      <span>Resolution</span>
                    </button>
                  </div>

                  {/* Subtab Content */}
                  {citizenReportsSubTab === 'signals' && (
                    <CitizenSignalDesk
                      selectedCityId={selectedCityId}
                      onSelectFeature={(id) => {
                        setSelectedFeatureId(id);
                        setMobileGisTab('map');
                      }}
                    />
                  )}
                  {citizenReportsSubTab === 'queue' && (
                    <AdminModerationQueue
                      selectedCityId={selectedCityId}
                      onSelectFeature={(id) => {
                        setSelectedFeatureId(id);
                        setMobileGisTab('map');
                      }}
                    />
                  )}
                  {citizenReportsSubTab === 'resolution' && (
                    <SubmitHazardResolutionForm
                      selectedCityId={selectedCityId}
                      onSelectFeature={(id) => {
                        setSelectedFeatureId(id);
                        setMobileGisTab('map');
                      }}
                    />
                  )}
                </div>
              )}

              {/* Tab 5: Water map (Water Bodies Atlas) */}
              {activeTab === 'water_map' && (
                <WaterBodiesAtlas
                  selectedCityId={selectedCityId}
                  onSelectFeature={(id) => {
                    setSelectedFeatureId(id);
                    setMobileGisTab('map');
                  }}
                />
              )}
            </div>

            {/* Split Resizer Divider */}
            <div
              onMouseDown={handleMouseDown}
              className="hidden lg:flex w-2 -mx-3 z-10 cursor-col-resize justify-center items-center group"
            >
              <div className="h-16 w-1 rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors" />
            </div>

            {/* ── RIGHT GIS MAP CANVAS ─────────── */}
            <div
              className={`${
                mobileGisTab === "map" ? "flex w-full" : "hidden"
              } lg:flex lg:w-[var(--right-width)] flex-col gap-3 h-full min-h-0 relative shrink-0`}
            >
              <div className="flex-1 relative min-h-[460px] md:min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <OpenLayersMapCanvas
                  selectedCityId={selectedCityId}
                  timeOffsetMins={timeOffsetMins}
                  personaMode="authority"
                  activeTab={activeTab}
                  activeRoute={activeRoute}
                  layerVisibility={layerVisibility}
                  citizenReports={citizenReports.filter((r) => r.cityId === selectedCityId || !r.cityId)}
                  selectedFeatureId={selectedFeatureId}
                  setSelectedFeatureId={setSelectedFeatureId}
                  routePinMode={routePinMode}
                  setRoutePinMode={setRoutePinMode}
                  pinnedOrigin={pinnedOrigin}
                  pinnedDestination={pinnedDestination}
                  onLocationPicked={handleLocationPicked}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedCityId={selectedCityId}
        onAddReport={handleAddReport}
      />
      <AuthorityAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultCityId={authDefaultCity}
        onSuccessLogin={handleSuccessLogin}
      />
      <SitRepExporter
        isOpen={isSitRepOpen}
        onClose={() => setIsSitRepOpen(false)}
        selectedCityId={selectedCityId}
        timeOffsetMins={timeOffsetMins}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-cyan-400 font-mono font-bold">
          Loading SURGE Operations Hub...
        </p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
