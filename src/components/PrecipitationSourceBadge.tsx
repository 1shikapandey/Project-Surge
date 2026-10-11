'use client';

import React, { useState } from 'react';
import { Radio, CloudRain, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type PrecipitationSourceType = 'radar' | 'openmeteo_fallback' | 'unavailable';

export interface PrecipitationSourceInfo {
  active: PrecipitationSourceType;
  lastUpdated: string | null;
  confidence: number | null;
  radarFreshness?: 'fresh' | 'stale' | 'unavailable';
  radarStationCode?: string | null;
}

interface PrecipitationSourceBadgeProps {
  sourceInfo: PrecipitationSourceInfo;
  align?: 'left' | 'right' | 'center';
}

// ---------------------------------------------------------------------------
// HELPER — Format timestamp for display
// ---------------------------------------------------------------------------

function formatTimestamp(isoString: string | null): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ${diffMins % 60}m ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
}

export const PrecipitationSourceBadge: React.FC<PrecipitationSourceBadgeProps> = ({
  sourceInfo,
  align = 'right',
}) => {
  const { t } = useLanguage();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const BADGE_CONFIG: Record<PrecipitationSourceType, {
    label: string;
    shortLabel: string;
    bgGradient: string;
    borderColor: string;
    textColor: string;
    dotColor: string;
    dotPulse: boolean;
    Icon: typeof Radio;
    tooltipBg: string;
  }> = {
    radar: {
      label: t.precipitationBadge.liveRadar,
      shortLabel: 'Radar',
      bgGradient: 'bg-gradient-to-r from-emerald-500/90 to-green-600/90',
      borderColor: 'border-emerald-400/60',
      textColor: 'text-white',
      dotColor: 'bg-emerald-200',
      dotPulse: true,
      Icon: Radio,
      tooltipBg: 'bg-emerald-950/95',
    },
    openmeteo_fallback: {
      label: t.precipitationBadge.modelEstimate,
      shortLabel: 'Model',
      bgGradient: 'bg-gradient-to-r from-amber-400/90 to-orange-500/90',
      borderColor: 'border-amber-300/60',
      textColor: 'text-white',
      dotColor: 'bg-amber-200',
      dotPulse: false,
      Icon: CloudRain,
      tooltipBg: 'bg-amber-950/95',
    },
    unavailable: {
      label: t.precipitationBadge.noData,
      shortLabel: 'Offline',
      bgGradient: 'bg-gradient-to-r from-red-500/90 to-rose-600/90',
      borderColor: 'border-red-400/60',
      textColor: 'text-white',
      dotColor: 'bg-red-200',
      dotPulse: true,
      Icon: AlertTriangle,
      tooltipBg: 'bg-red-950/95',
    },
  };

  const config = BADGE_CONFIG[sourceInfo.active] || BADGE_CONFIG.unavailable;
  const { Icon } = config;

  const confidencePct = sourceInfo.confidence !== null && sourceInfo.confidence !== undefined
    ? (sourceInfo.confidence * 100).toFixed(0)
    : null;

  // Tooltip positioning classes based on alignment
  const tooltipAlignClass =
    align === 'left' ? 'left-0' :
    align === 'center' ? 'left-1/2 -translate-x-1/2' :
    'right-0';

  const arrowAlignClass =
    align === 'left' ? 'left-5' :
    align === 'center' ? 'left-1/2 -translate-x-1/2' :
    'right-5';

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onClick={() => setIsTooltipVisible(!isTooltipVisible)}
    >
      {/* Main Badge */}
      <div
        id="precipitation-source-badge"
        className={`
          flex items-center space-x-1.5 px-2.5 py-1.5
          rounded-full backdrop-blur-md border shadow-lg
          cursor-pointer select-none transition-all duration-300
          hover:scale-105 hover:shadow-xl
          ${config.bgGradient} ${config.borderColor} ${config.textColor}
        `}
      >
        {/* Status dot */}
        <span className="relative flex h-2 w-2">
          {config.dotPulse && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotColor}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}
          />
        </span>

        {/* Icon */}
        <Icon className="w-3.5 h-3.5 shrink-0" />

        {/* Label */}
        <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">
          <span className="hidden sm:inline">{config.label}</span>
          <span className="sm:hidden">{config.shortLabel}</span>
        </span>

        {/* Confidence chip (only for radar) */}
        {sourceInfo.active === 'radar' && confidencePct && (
          <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-white/20 border border-white/20">
            {confidencePct}%
          </span>
        )}
      </div>

      {/* Hover/Tap Tooltip */}
      {isTooltipVisible && (
        <div
          className={`
            absolute bottom-full ${tooltipAlignClass} mb-2
            w-64 sm:w-72 p-3 rounded-xl border border-white/10 shadow-2xl
            backdrop-blur-xl z-50
            ${config.tooltipBg}
            animate-in fade-in slide-in-from-bottom-1 duration-150
          `}
        >
          {/* Arrow */}
          <div
            className={`absolute top-full ${arrowAlignClass} w-0 h-0
              border-l-[6px] border-l-transparent
              border-r-[6px] border-r-transparent
              border-t-[6px] ${
                sourceInfo.active === 'radar' ? 'border-t-emerald-950/95' :
                sourceInfo.active === 'openmeteo_fallback' ? 'border-t-amber-950/95' :
                'border-t-red-950/95'
              }`}
          />

          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <Icon className="w-4 h-4 text-white/90" />
              <span className="text-white font-bold text-xs">
                {config.label}
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-1.5 text-[10.5px]">
              <div className="flex justify-between items-center">
                <span className="text-white/60">{t.precipitationBadge.lastUpdated}</span>
                <span className="text-white font-mono font-bold">
                  {formatTimestamp(sourceInfo.lastUpdated)}
                </span>
              </div>

              {sourceInfo.active === 'radar' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">{t.precipitationBadge.decodeConfidence}</span>
                    <span className={`font-mono font-bold ${
                      (sourceInfo.confidence || 0) >= 0.5 ? 'text-emerald-300' :
                      (sourceInfo.confidence || 0) >= 0.3 ? 'text-amber-300' :
                      'text-red-300'
                    }`}>
                      {confidencePct}% pixel match
                    </span>
                  </div>
                  {sourceInfo.radarStationCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">{t.precipitationBadge.stationCode}</span>
                      <span className="text-white font-mono font-bold uppercase">
                        {sourceInfo.radarStationCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">{t.precipitationBadge.freshness}</span>
                    <span className={`font-mono font-bold ${
                      sourceInfo.radarFreshness === 'fresh' ? 'text-emerald-300' : 'text-amber-300'
                    }`}>
                      {sourceInfo.radarFreshness === 'fresh' ? `● ${t.precipitationBadge.freshLabel}` : `○ ${t.precipitationBadge.staleLabel}`}
                    </span>
                  </div>
                </>
              )}

              {sourceInfo.active === 'openmeteo_fallback' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Reason</span>
                  <span className="text-amber-200 font-bold text-[9.5px]">
                    Radar unavailable or low confidence
                  </span>
                </div>
              )}

              {sourceInfo.active === 'unavailable' && (
                <div className="text-red-200 text-[10px] font-medium pt-1 border-t border-white/10">
                  ⚠️ Both radar decode and Open-Meteo API are unreachable.
                  Displaying stale or zero precipitation values.
                  Check network connectivity and source availability.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-[9px] text-white/40 pt-1 border-t border-white/10 font-mono">
              {t.precipitationBadge.source}: {sourceInfo.active === 'radar'
                ? 'mausamnow.com IMD DWR CAZ'
                : sourceInfo.active === 'openmeteo_fallback'
                ? 'Open-Meteo Forecast API'
                : 'No active source'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
