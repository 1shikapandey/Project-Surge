'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSimulationContext } from '@/context/SimulationContext';
import { SimBanner } from './SimBanner';
import { SimPlaybackControls } from './SimPlaybackControls';
import { SimAlertFeed } from './SimAlertFeed';
import { SimDrainagePanel } from './SimDrainagePanel';
import { SimHistoricalQueue } from './SimHistoricalQueue';
import { SimSitRepExporter } from './SimSitRepExporter';
import { SimTutorialOverlay } from './SimTutorialOverlay';
import {
  Activity,
  FileText,
  ShieldAlert,
  Truck,
  Power,
  HelpCircle,
  Sliders,
  Map,
} from 'lucide-react';

const OpenLayersMapCanvas = dynamic(
  () => import('@/components/OpenLayersMapCanvas').then((mod) => mod.OpenLayersMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-800">
        <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-amber-400 font-mono font-bold">
          Loading Authority Command Map Canvas...
        </p>
      </div>
    ),
  }
);

interface SimAuthorityDashboardProps {
  onOpenEventSelector: () => void;
  onOpenPersonaSelector: () => void;
}

export const SimAuthorityDashboard: React.FC<SimAuthorityDashboardProps> = ({
  onOpenEventSelector,
  onOpenPersonaSelector,
}) => {
  const {
    selectedCityId,
    currentTimeOffsetMins,
    historicalImpactMarkers,
    currentSnapshot,
    aiDecisionOverride,
  } = useSimulationContext();

  const [activeTab, setActiveTab] = useState<'scada' | 'dispatch' | 'stream'>('scada');
  const [mobileGisTab, setMobileGisTab] = useState<'panel' | 'map'>('panel');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isSitRepOpen, setIsSitRepOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleTutorialStepChange = (step: { dataTut: string }) => {
    if (step.dataTut === 'sim-scada-panel') {
      setActiveTab('scada');
      setMobileGisTab('panel');
    } else if (step.dataTut === 'sim-dispatch-queue') {
      setActiveTab('dispatch');
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
      {/* Simulation Safety Banner */}
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
              mobileGisTab === 'panel' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Control Panel</span>
          </button>
          <button
            onClick={() => setMobileGisTab('map')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all min-h-[38px] ${
              mobileGisTab === 'map' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4 overflow-hidden relative">
        {/* Left Panel: SCADA / Emergency Queue / Stream */}
        <div
          className={`${
            mobileGisTab === 'panel' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-[460px] flex-col gap-3 shrink-0 overflow-y-auto`}
        >
          {/* Action Bar (SitRep Exporter & Guide Tutorial) */}
          <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <button
              data-tut="sim-sitrep-export"
              onClick={() => setIsSitRepOpen(true)}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Sim SitRep</span>
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-xs flex items-center gap-1.5 border border-amber-500/30 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Tutorial</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 flex justify-between gap-1">
            <button
              onClick={() => setActiveTab('scada')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'scada'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>SCADA Dewatering</span>
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'dispatch'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Dispatch Desk</span>
            </button>
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'stream'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Event Stream</span>
            </button>
          </div>

          {/* Active Tab Component */}
          <div className="flex-1 min-h-[350px]">
            {activeTab === 'scada' && (
              <div data-tut="sim-scada-panel" className="h-full">
                <SimDrainagePanel />
              </div>
            )}

            {activeTab === 'dispatch' && (
              <div data-tut="sim-dispatch-queue" className="h-full">
                <SimHistoricalQueue />
              </div>
            )}

            {activeTab === 'stream' && (
              <div className="h-full">
                <SimAlertFeed />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Map Canvas + Playback Controls */}
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
              personaMode="authority"
              activeRoute={null}
              citizenReports={[]}
              selectedFeatureId={selectedFeatureId}
              setSelectedFeatureId={setSelectedFeatureId}
              historicalImpactMarkers={historicalImpactMarkers}
            />
          </div>

          {/* Playback Controls */}
          <div data-tut="sim-playback-controls">
            <SimPlaybackControls />
          </div>
        </div>
      </div>

      {/* SitRep Exporter Modal */}
      <SimSitRepExporter
        isOpen={isSitRepOpen}
        onClose={() => setIsSitRepOpen(false)}
      />

      {/* Persona Tutorial Overlay */}
      <SimTutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStepChange={handleTutorialStepChange}
      />
    </div>
  );
};
