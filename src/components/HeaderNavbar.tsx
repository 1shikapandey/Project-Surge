'use client';

import React, { useState } from 'react';
import {
  CloudRain,
  MapPin,
  ArrowLeft,
  Menu,
  Wind,
  Bell,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Zap,
  Activity,
  FileCheck,
  Layers,
  PlaySquare,
  X,
  HelpCircle,
  Navigation,
  Users
} from 'lucide-react';
import { CITIES, CityId } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/translations';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationModal } from '@/components/NotificationModal';

export type AppTab =
  | 'gis_layers'
  | 'flood_routing'
  | 'excess_water'
  | 'citizen_reports'
  | 'water_map';

interface HeaderNavbarProps {
  selectedCityId: CityId;
  onSelectCity: (cityId: CityId) => void;
  onGoToLanding: () => void;
  onGoToCitizenApp?: () => void;
  authorityAuth: { isLoggedIn: boolean; loginId: string; cityId: CityId } | null;
  onOpenAuthModal: () => void;
  onLogoutAuthority: () => void;
  onGoToAuthorityDashboard?: () => void;
  selectedEventId: string | null;
  onSelectEventId: (eventId: string | null) => void;
  lang?: SupportedLanguage | string;
  setLang?: (lang: any) => void;
  maxWaterDepthCm: number;
  floodedRoadsCount: number;
  surchargingNodesCount: number;
  rainfallRateMmHr: number;
  windSpeedKmh?: number;
  windDirectionCardinal?: string;
  openMeteoSource?: string;
  onOpenReportModal: () => void;
  onOpenSitRepModal?: () => void;
  onOpenTutorial?: () => void;
  activeTab?: AppTab;
  onSelectTab?: (tab: AppTab) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  timeOffsetMins?: number;
  onSelectFeature?: (id: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  selectedCityId,
  onSelectCity,
  onGoToLanding,
  onGoToCitizenApp,
  authorityAuth,
  onOpenAuthModal,
  onLogoutAuthority,
  onGoToAuthorityDashboard,
  selectedEventId,
  onSelectEventId,
  maxWaterDepthCm,
  floodedRoadsCount,
  surchargingNodesCount,
  rainfallRateMmHr,
  windSpeedKmh = 28.5,
  windDirectionCardinal = 'SW',
  openMeteoSource,
  onOpenReportModal,
  onOpenSitRepModal,
  onOpenTutorial,
  activeTab = 'nowcast_gis',
  onSelectTab,
  isSidebarCollapsed = false,
  onToggleSidebar,
  timeOffsetMins = 0,
  onSelectFeature = () => {}
}) => {
  const { lang, setLang, t, supportedLanguages } = useLanguage();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Total active alerts for notification bell badge count
  const totalAlerts = floodedRoadsCount + surchargingNodesCount;

  return (
    <>
      <header className="w-full px-4 sm:px-6 py-2.5 sticky top-0 z-40 transition-all duration-300 backdrop-blur-xl border-b shadow-sm bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        <div className="max-w-[1900px] mx-auto flex items-center justify-between gap-3">
          
          {/* Left Brand & Hub Navigation */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Mobile Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700/60 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-800 dark:text-white" />}
            </button>

            {/* Return to Landing */}
            <button
              type="button"
              onClick={onGoToLanding}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/50 transition-all hidden sm:flex items-center justify-center"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Brand Logo & Title */}
            <div className="flex items-center space-x-2.5" data-tut="auth-header-brand">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white shadow-md shadow-sky-500/20 border border-sky-400/40 shrink-0 p-0.5 transition-transform hover:scale-105 cursor-pointer" onClick={onGoToLanding}>
                <img
                  src="/images/surge-logo.png"
                  alt="SURGE Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <h1 className="sr-only">SURGE</h1>
                {authorityAuth?.isLoggedIn && (
                  <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                    AUTHORITY MODE
                  </span>
                )}
              </div>
            </div>

            {/* City Selection Dropdown */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-3 py-1.5 rounded-xl text-sm ml-2 shadow-2xs">
              <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 mr-2 shrink-0" />
              <select
                value={selectedCityId}
                onChange={(e) => onSelectCity(e.target.value as CityId)}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="mumbai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mumbai</option>
                <option value="delhi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delhi NCR</option>
                <option value="chennai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chennai</option>
              </select>
            </div>
          </div>

          {/* Right Status Controls & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Guide Tutorial Launcher Button */}
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold transition-all active:scale-95"
                title="Launch Interactive Guide Tutorial"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Guide Tutorial</span>
              </button>
            )}

            {/* Live Wind Indication */}
            <div className="hidden xl:flex items-center px-3 py-1.5 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 rounded-xl space-x-2 font-mono font-bold text-xs tabular-nums">
              <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{windSpeedKmh.toFixed(1)} km/h {windDirectionCardinal}</span>
            </div>

            {/* Authority Login Button (when not logged in) */}
            {!authorityAuth?.isLoggedIn && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-bold transition-all"
                title="Municipal Disaster Officer Sign In"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Authority Login</span>
              </button>
            )}

            {/* Notification Bell Icon matching ThemeToggle size */}
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="relative flex items-center justify-center h-8 px-2.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300/60 dark:border-slate-700/60 transition-all shadow-2xs group"
              title="Live Flood Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-mono font-black text-white bg-red-600 rounded-full border border-slate-900 animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle className="h-8" />
          </div>
        </div>
      </header>

      {/* Notification Feed Modal */}
      <NotificationModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        selectedCityId={selectedCityId}
        timeOffsetMins={timeOffsetMins}
        onSelectFeature={onSelectFeature}
      />

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-4 animate-fadeIn max-h-[calc(100vh-70px)] overflow-y-auto text-slate-900 dark:text-slate-100">
          
          {/* Operations Hub Navigation Options from Sidebar */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Operations Hub Modules
            </h3>
            {[
              { id: 'gis_layers', label: 'GIS Map', icon: Layers },
              { id: 'flood_routing', label: 'Flood safe routing', icon: Navigation },
              { id: 'excess_water', label: 'Excess water routing', icon: Zap },
              { id: 'citizen_reports', label: 'Citizen reports', icon: Users },
              { id: 'water_map', label: 'Water map', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(tab.id as AppTab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <a
              href="/simulation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800/60 text-amber-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-amber-300 dark:border-amber-500/30 transition-all min-h-[44px]"
            >
              <PlaySquare className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Simulation Replay</span>
            </a>
          </div>

          {/* Focus City Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Select Focus City</h3>
            <select
              value={selectedCityId}
              onChange={(e) => {
                onSelectCity(e.target.value as CityId);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white min-h-[44px]"
            >
              <option value="mumbai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mumbai</option>
              <option value="delhi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delhi NCR</option>
              <option value="chennai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chennai</option>
            </select>
          </div>

          </div>
      )}
    </>
  );
};
