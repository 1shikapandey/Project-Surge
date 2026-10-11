'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSimulationContext } from '@/context/SimulationContext';
import { SimBanner } from './SimBanner';
import { SimPlaybackControls } from './SimPlaybackControls';
import { SimAlertFeed } from './SimAlertFeed';
import { RoutingWidget } from '@/components/RoutingWidget';
import { NavigationRoute, CitizenReport } from '@/lib/mock-data';
import { SimTutorialOverlay } from './SimTutorialOverlay';
import {
  Navigation,
  AlertOctagon,
  Camera,
  PhoneCall,
  MapPin,
  Send,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Map,
  Layers
} from 'lucide-react';
import { INDIAN_EMERGENCY_SERVICES } from '@/lib/emergency-data';
import { CitizenGisLayersWidget, DEFAULT_CITIZEN_LAYERS, MapLayerVisibility } from '@/components/CitizenGisLayersWidget';

const OpenLayersMapCanvas = dynamic(
  () => import('@/components/OpenLayersMapCanvas').then((mod) => mod.OpenLayersMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-800">
        <div className="w-9 h-9 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-sky-400 font-mono font-bold">
          Loading Simulation Map Canvas...
        </p>
      </div>
    ),
  }
);

interface SimCitizenDashboardProps {
  onOpenEventSelector: () => void;
  onOpenPersonaSelector: () => void;
}

export const SimCitizenDashboard: React.FC<SimCitizenDashboardProps> = ({
  onOpenEventSelector,
  onOpenPersonaSelector,
}) => {
  const {
    selectedCityId,
    currentTimeOffsetMins,
    historicalImpactMarkers,
    currentSnapshot,
  } = useSimulationContext();

  const [activeTab, setActiveTab] = useState<'gis' | 'routing' | 'alerts' | 'report' | 'emergency'>('gis');
  const [layerVisibility, setLayerVisibility] = useState<MapLayerVisibility>(DEFAULT_CITIZEN_LAYERS);
  const [mobileGisTab, setMobileGisTab] = useState<'panel' | 'map'>('panel');
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [routePinMode, setRoutePinMode] = useState<'none' | 'origin' | 'destination'>('none');
  const [pinnedOrigin, setPinnedOrigin] = useState<[number, number] | null>(null);
  const [pinnedDestination, setPinnedDestination] = useState<[number, number] | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  // Simulated Report State
  const [simReports, setSimReports] = useState<CitizenReport[]>([]);
  const [reportDepthCm, setReportDepthCm] = useState(25);
  const [reportLocation, setReportLocation] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleLocationPicked = (mode: 'origin' | 'destination', coords: [number, number]) => {
    if (mode === 'origin') setPinnedOrigin(coords);
    else setPinnedDestination(coords);
  };

  const handleSimReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: CitizenReport = {
      id: `sim-rep-${Date.now()}`,
      cityId: selectedCityId,
      timestamp: 'Simulated Just Now',
      lat: pinnedOrigin ? pinnedOrigin[0] : 19.02,
      lng: pinnedOrigin ? pinnedOrigin[1] : 72.85,
      locationName: reportLocation || 'Simulated Zone',
      coordinates: pinnedOrigin || [19.02, 72.85],
      waterDepthCm: reportDepthCm,
      userNote: `[SIMULATION] ${reportNote || 'Reported during replay'}`,
      verified: true,
      upvotes: 1,
      timestampMinsAgo: 0,
      status: 'pending',
    };
    setSimReports((prev) => [newReport, ...prev]);
    setReportSuccess(true);
    setReportNote('');
    setTimeout(() => setReportSuccess(false), 3000);
  };

  const handleTutorialStepChange = (step: { dataTut: string }) => {
    if (step.dataTut === 'sim-citizen-routing') {
      setActiveTab('routing');
      setMobileGisTab('panel');
    } else if (step.dataTut === 'sim-citizen-signal') {
      setActiveTab('report');
      setMobileGisTab('panel');
    } else if (step.dataTut === 'sim-map-container') {
      setMobileGisTab('map');
    } else if (step.dataTut === 'sim-playback-controls') {
      setMobileGisTab('map');
    } else {
      setMobileGisTab('panel');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Simulation Persistent Safety Banner */}
      <div data-tut="sim-banner">
        <SimBanner
          onOpenEventSelector={onOpenEventSelector}
          onOpenPersonaSelector={onOpenPersonaSelector}
        />
      </div>

      {/* Mobile View Switcher (Panel vs GIS Map) */}
      <div className="lg:hidden flex justify-center pt-2 px-4">
        <div className="bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-800 w-full max-w-sm shadow-xs">
          <button
            onClick={() => setMobileGisTab('panel')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all min-h-[38px] ${
              mobileGisTab === 'panel' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Control Panel</span>
          </button>
          <button
            onClick={() => setMobileGisTab('map')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all min-h-[38px] ${
              mobileGisTab === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4 overflow-hidden relative">
        {/* Left Side: Citizen Controls Panel */}
        <div
          className={`${
            mobileGisTab === 'panel' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-[420px] flex-col gap-3 shrink-0 overflow-y-auto`}
        >
          {/* Navigation Bar */}
          <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex justify-between gap-1">
            <button
              onClick={() => setActiveTab('gis')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'gis'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GIS Layers</span>
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'routing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Routing</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Stream</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'emergency'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helplines</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 min-h-[300px]">
            {activeTab === 'gis' && (
              <CitizenGisLayersWidget
                layerVisibility={layerVisibility}
                setLayerVisibility={setLayerVisibility}
                selectedCityId={selectedCityId}
                timeOffsetMins={currentTimeOffsetMins}
              />
            )}

            {activeTab === 'routing' && (
              <div data-tut="sim-citizen-routing">
                <RoutingWidget
                  selectedCityId={selectedCityId}
                  timeOffsetMins={currentTimeOffsetMins}
                  activeRoute={activeRoute}
                  setActiveRoute={setActiveRoute}
                  routePinMode={routePinMode}
                  setRoutePinMode={setRoutePinMode}
                  pinnedOrigin={pinnedOrigin}
                  pinnedDestination={pinnedDestination}
                />
              </div>
            )}

            {activeTab === 'alerts' && <SimAlertFeed />}

            {activeTab === 'report' && (
              <div
                data-tut="sim-citizen-signal"
                className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Simulate Citizen Hazard Report</span>
                </h3>

                {reportSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Report logged to simulation queue!</span>
                  </div>
                )}

                <form onSubmit={handleSimReportSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Inundation Location</label>
                    <input
                      type="text"
                      required
                      value={reportLocation}
                      onChange={(e) => setReportLocation(e.target.value)}
                      placeholder="e.g. Kurla Station West"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 font-bold mb-1">
                      <span>Water Depth</span>
                      <span className="text-amber-400 font-mono">{reportDepthCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      value={reportDepthCm}
                      onChange={(e) => setReportDepthCm(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">User Observation Note</label>
                    <textarea
                      rows={2}
                      value={reportNote}
                      onChange={(e) => setReportNote(e.target.value)}
                      placeholder="e.g. Knee deep water, vehicles stalling"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Simulated Report</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-orange-400" />
                  <span>24x7 Flood Emergency Helplines</span>
                </h3>
                <div className="space-y-2">
                  {INDIAN_EMERGENCY_SERVICES.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{srv.badgeText}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{srv.number}</div>
                      </div>
                      <a
                        href={srv.telUri}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-[11px]"
                      >
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map Canvas + Playback Controls */}
        <div
          className={`${
            mobileGisTab === 'map' ? 'flex' : 'hidden'
          } lg:flex flex-1 flex-col gap-3 min-h-[350px]`}
        >
          {/* Map Canvas */}
          <div
            data-tut="sim-map-container"
            className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl"
          >
            <OpenLayersMapCanvas
              selectedCityId={selectedCityId}
              timeOffsetMins={currentTimeOffsetMins}
              personaMode="citizen"
              activeRoute={activeRoute}
              citizenReports={simReports}
              selectedFeatureId={selectedFeatureId}
              setSelectedFeatureId={setSelectedFeatureId}
              routePinMode={routePinMode}
              setRoutePinMode={setRoutePinMode}
              pinnedOrigin={pinnedOrigin}
              pinnedDestination={pinnedDestination}
              onLocationPicked={handleLocationPicked}
              historicalImpactMarkers={historicalImpactMarkers}
              layerVisibility={layerVisibility}
              setLayerVisibility={setLayerVisibility}
            />

            {/* Tutorial Button Floating */}
            <button
              onClick={() => setShowTutorial(true)}
              className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-xs font-medium shadow-lg flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Guide Tutorial</span>
            </button>
          </div>

          {/* Playback Controls */}
          <div data-tut="sim-playback-controls">
            <SimPlaybackControls />
          </div>
        </div>
      </div>

      {/* Persona Tutorial Overlay */}
      <SimTutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStepChange={handleTutorialStepChange}
      />
    </div>
  );
};
