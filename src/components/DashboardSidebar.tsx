'use client';

import React from 'react';
import {
  Compass,
  Zap,
  Activity,
  FileCheck,
  Layers,
  PlaySquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowLeft,
  LogOut,
  Navigation,
  Users
} from 'lucide-react';
import { AppTab } from '@/components/HeaderNavbar';

import { useLanguage } from '@/context/LanguageContext';

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: AppTab | 'simulation';
  onSelectTab: (tab: AppTab) => void;
  onGoToLanding?: () => void;
  onLogoutAuthority?: () => void;
  authorityAuth?: { isLoggedIn: boolean; loginId: string; cityId: string } | null;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  onGoToLanding,
  onLogoutAuthority,
  authorityAuth
}) => {
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'gis_layers',
      label: 'GIS Map',
      description: 'Layers & legend',
      icon: Layers,
      badge: null
    },
    {
      id: 'flood_routing',
      label: 'Flood safe routing',
      description: 'Vehicle-aware safe routes',
      icon: Navigation,
      badge: null
    },
    {
      id: 'excess_water',
      label: 'Excess water routing',
      description: 'Pipe network & surcharge',
      icon: Zap,
      badge: null
    },
    {
      id: 'citizen_reports',
      label: 'Citizen reports',
      description: 'Ground signals & moderation',
      icon: Users,
      badge: null
    },
    {
      id: 'water_map',
      label: 'Water map',
      description: 'Rivers, lakes & coast',
      icon: Compass,
      badge: null
    }
  ];

  const isSimulationActive = activeTab === 'simulation';

  return (
    <aside
      className={`h-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 relative z-30 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Toggle Area */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden px-1">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 truncate">
              surge hub
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 py-3 space-y-1 px-2.5 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
            Operations
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id as AppTab)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-700 dark:text-sky-300 font-bold ring-1 ring-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && !isCollapsed && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600 dark:bg-sky-400" aria-hidden="true" />
              )}
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>

              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold truncate leading-tight">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate leading-tight mt-0.5 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Tooltip on Collapsed Hover */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                  {item.label}
                  {item.badge && <span className="ml-1.5 text-[9px] text-cyan-600 dark:text-cyan-400">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}

        {/* Simulation Link */}
        {!isCollapsed && (
          <p className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
            Tools
          </p>
        )}
        {isCollapsed && <div className="my-2 border-t border-slate-200 dark:border-slate-800" aria-hidden="true" />}
        <a
          href="/simulation"
          className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 group relative ${
            isSimulationActive
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500/40'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
          } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          title={isCollapsed ? t.sidebar.simulationReplay : undefined}
        >
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isSimulationActive ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            <PlaySquare className="w-4 h-4" />
          </span>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold truncate leading-tight">{t.sidebar.simulationReplay}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black ${
                  isSimulationActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                }`}>
                  3D
                </span>
              </div>
              <p className="text-[11px] truncate leading-tight mt-0.5 text-amber-700/80 dark:text-amber-400/70">
                {t.simulation.benchmarkTitle}
              </p>
            </div>
          )}

          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg shadow-xl border border-amber-300 dark:border-amber-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
              {t.sidebar.simulationReplay}
            </div>
          )}
        </a>
      </div>

      {/* Footer / Logout & Landing Return Buttons */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
        {authorityAuth?.isLoggedIn && onLogoutAuthority && (
          <button
            type="button"
            onClick={onLogoutAuthority}
            className={`w-full flex items-center p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 transition-all ${
              isCollapsed ? 'justify-center' : 'space-x-2'
            }`}
            title={isCollapsed ? `Logout (${authorityAuth.loginId.split('.')[0]})` : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            {!isCollapsed && (
              <span className="text-xs font-bold truncate">
                Logout ({authorityAuth.loginId.split('.')[0]})
              </span>
            )}
          </button>
        )}

        {onGoToLanding && (
          <button
            type="button"
            onClick={onGoToLanding}
            className={`w-full flex items-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/40 transition-all ${
              isCollapsed ? 'justify-center' : 'space-x-2'
            }`}
            title={isCollapsed ? t.nav.backToLanding : undefined}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="text-xs font-bold">{t.nav.backToLanding}</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
