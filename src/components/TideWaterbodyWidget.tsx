'use client';

import React from 'react';
import { CityId, CITIES } from '@/lib/mock-data';
import { getCityTideData } from '@/lib/tide-service';
import { getPumpingStationsForCity, getTotalCityPumpingCapacityLps } from '@/lib/pumping-station-service';
import { Waves, Zap, Gauge, AlertTriangle, Activity, Anchor } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TideWaterbodyWidgetProps {
  selectedCityId: CityId;
  timeOffsetMins: number;
  rainfallRateMmHr?: number;
}

export const TideWaterbodyWidget: React.FC<TideWaterbodyWidgetProps> = ({
  selectedCityId,
  timeOffsetMins,
  rainfallRateMmHr = 25
}) => {
  const { t } = useLanguage();
  const city = CITIES[selectedCityId];
  const tideData = getCityTideData(selectedCityId, timeOffsetMins, rainfallRateMmHr);
  const pumpingStations = getPumpingStationsForCity(selectedCityId);
  const activeDischargeLps = getTotalCityPumpingCapacityLps(selectedCityId, true);
  const maxCapacityLps = getTotalCityPumpingCapacityLps(selectedCityId, false);
  const pumpEfficiencyPct = Math.round((activeDischargeLps / maxCapacityLps) * 100);

  const getBackpressureColor = (coeff: number) => {
    if (coeff >= 0.7) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (coeff >= 0.35) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getTideBadge = (state: string) => {
    switch (state) {
      case 'high_tide':
        return { label: 'HIGH TIDE', bg: 'bg-orange-600 text-white' };
      case 'rising_flood':
        return { label: 'RISING STAGE', bg: 'bg-orange-500 text-gray-950' };
      case 'ebbing_discharge':
        return { label: 'GRAVITY DISCHARGE', bg: 'bg-blue-600 text-white' };
      default:
        return { label: 'NORMAL STAGE', bg: 'bg-gray-700 text-white' };
    }
  };

  const badge = getTideBadge(tideData.tideState);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
      {/* Header Title Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm tracking-tight flex items-center gap-1.5">
              <span>{t.tide.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-gray-100 text-gray-700">
                {city.name}
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 truncate max-w-[280px]">
              {tideData.stationName}
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg font-mono border ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Tide Level / River Stage Height */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="font-semibold flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5 text-sky-600" />
              {selectedCityId === 'delhi' ? 'River Stage' : t.tide.seaLevel}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold font-mono text-gray-900">
              {tideData.currentHeightMeters} <span className="text-xs font-semibold text-gray-500">m</span>
            </p>
            <span className="text-[10px] text-gray-500 font-mono">
              Peak: {tideData.highTidePeakHeightMeters}m
            </span>
          </div>
        </div>

        {/* Outfall Backpressure Coefficient */}
        <div className={`p-3 rounded-xl border space-y-1 ${getBackpressureColor(tideData.outfallBackpressureCoeff)}`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              Choke
            </span>
            <span className="font-mono text-[10px]">Backpressure</span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold font-mono">
              {Math.round(tideData.outfallBackpressureCoeff * 100)}%
            </p>
          </div>
        </div>

        {/* SCADA Dewatering Pumping Discharge */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Pumps
            </span>
            <span className="font-mono text-[10px] text-blue-700 font-bold">{pumpEfficiencyPct}%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold font-mono text-gray-900">
              {(activeDischargeLps / 1000).toFixed(1)}k <span className="text-xs font-semibold text-gray-500">L/s</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

