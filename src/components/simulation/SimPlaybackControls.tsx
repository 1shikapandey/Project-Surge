'use client';

import React from 'react';
import { useSimulationContext, PlaybackSpeed } from '@/context/SimulationContext';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Clock,
  Activity,
} from 'lucide-react';

export const SimPlaybackControls: React.FC = () => {
  const {
    currentStepIndex,
    totalSteps,
    setStep,
    playbackState,
    play,
    pause,
    reset,
    setSpeed,
    currentFrame,
    currentRainfallMmHr,
    selectedEvent,
  } = useSimulationContext();

  const speeds: PlaybackSpeed[] = [1, 4, 16];

  if (totalSteps === 0) return null;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-3">
      {/* Top row: Current Frame info + Rainfall gauge */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {currentFrame?.timeLabel ?? `T+${currentStepIndex * 30}m`}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Step {currentStepIndex + 1} of {totalSteps}
            </div>
          </div>
        </div>

        {/* Rainfall Gauge */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <CloudRain
            className={`w-4 h-4 ${
              currentRainfallMmHr > 40
                ? 'text-red-400 animate-bounce'
                : currentRainfallMmHr > 15
                ? 'text-amber-400'
                : 'text-cyan-400'
            }`}
          />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono text-white">
                {currentRainfallMmHr.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">mm/h</span>
            </div>
            <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentRainfallMmHr > 40
                    ? 'bg-red-500'
                    : currentRainfallMmHr > 20
                    ? 'bg-amber-500'
                    : 'bg-cyan-500'
                }`}
                style={{
                  width: `${Math.min(100, (currentRainfallMmHr / Math.max(1, selectedEvent?.peakIntensityMmHr ?? 60)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrubber Bar */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-400 min-w-[35px]">
          {selectedEvent?.timeSeriesProfile?.[0]?.timeLabel || 'Start'}
        </span>
        <div className="relative flex-1 group">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => setStep(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />
          {/* Timeline markers indicator */}
          <div className="absolute top-3 left-0 right-0 flex justify-between px-1 pointer-events-none">
            {selectedEvent?.timeSeriesProfile.map((step, idx) => (
              <div
                key={idx}
                className={`w-1 h-1.5 rounded-full ${
                  idx === currentStepIndex
                    ? 'bg-blue-400 ring-2 ring-blue-500/40'
                    : idx < currentStepIndex
                    ? 'bg-blue-600/60'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 min-w-[35px] text-right">
          {selectedEvent?.timeSeriesProfile?.[totalSteps - 1]?.timeLabel || 'End'}
        </span>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-between pt-1">
        {/* Play/Pause/Reset/Step */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={reset}
            title="Reset simulation to T=0"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setStep(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            title="Previous step"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={playbackState.isPlaying ? pause : play}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all shadow-md ${
              playbackState.isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-500/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-500/30'
            }`}
          >
            {playbackState.isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => setStep(currentStepIndex + 1)}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Next step"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <FastForward className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5" />
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                playbackState.speed === s
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
