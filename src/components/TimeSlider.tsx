'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock, CloudRain } from 'lucide-react';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { CityId } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';

interface TimeSliderProps {
  timeOffsetMins: number;
  setTimeOffsetMins: React.Dispatch<React.SetStateAction<number>>;
  rainfallRateMmHr?: number;
  cityId?: CityId;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  timeOffsetMins,
  setTimeOffsetMins,
  rainfallRateMmHr,
  cityId = 'mumbai'
}) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setTimeOffsetMins((prev) => {
          if (prev >= 180) {
            setIsPlaying(false);
            return 180;
          }
          return prev + 15;
        });
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setTimeOffsetMins]);

  const rainIntensity = rainfallRateMmHr ?? getHydraulicSnapshotAtTime(timeOffsetMins, cityId).rainfallRateMmHr;

  const hours = Math.floor(timeOffsetMins / 60);
  const mins = timeOffsetMins % 60;
  const timeLabel = `+${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  const presetTimes = [0, 30, 60, 120, 180];

  return (
    <div className="w-full bg-surface-card text-slate-900 dark:text-slate-100 backdrop-blur-xl p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-3.5 transition-colors">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-action-primary hover:bg-blue-600 text-white font-bold transition-all active:scale-95 shadow-xs"
            title={isPlaying ? t.slider.pause : t.slider.play}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setTimeOffsetMins(0);
            }}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all active:scale-95"
            title={t.slider.reset}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.landing.metricLeadTimeSub}:
            </span>
            <span className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 px-2.5 py-0.5 rounded-lg shadow-2xs">
              {timeLabel} ({timeOffsetMins} {t.slider.plusMin})
            </span>
          </div>
        </div>

        {/* Live Rainfall Intensity */}
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-slate-600 dark:text-slate-400 font-semibold">{t.slider.rainRateLabel}</span>
          <span className="font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-300 dark:border-sky-500/30">{rainIntensity} mm/h</span>
        </div>
      </div>

      {/* Main Scrubber Slider */}
      <div className="relative pt-1 px-1">
        <input
          type="range"
          min={0}
          max={180}
          step={15}
          value={timeOffsetMins}
          onChange={(e) => setTimeOffsetMins(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-sky-600 dark:accent-sky-400"
        />

        {/* Ticks and preset buttons */}
        <div className="flex justify-between items-center text-[11px] font-mono pt-2">
          {presetTimes.map((presetTime) => (
            <button
              key={presetTime}
              type="button"
              onClick={() => setTimeOffsetMins(presetTime)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeOffsetMins === presetTime
                  ? 'btn-glass-primary font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
              }`}
            >
              {presetTime === 0 ? t.slider.nowLive : `+${presetTime}${t.slider.plusMin}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
