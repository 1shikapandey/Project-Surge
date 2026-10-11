'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSimulationContext, SimulationPersona } from '@/context/SimulationContext';
import {
  X,
  ChevronRight,
  ShieldAlert,
  Calendar,
  MapPin,
  Play,
  CheckCircle2,
  Navigation,
  Activity,
  Truck,
  FileText,
  User,
  Power,
} from 'lucide-react';

export const SIMULATION_TUTORIAL_STORAGE_KEY = 'aquaalert_sim_tutorial_seen';

export interface TutorialStep {
  stepId: number;
  dataTut: string;
  title: string;
  text: string;
  icon: React.ElementType;
}

export const CITIZEN_TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepId: 1,
    dataTut: 'sim-banner',
    title: 'Simulation Safety Banner',
    text: 'Indicates historical replay mode is active. Shows historical 24h rainfall totals, peak intensity, and persona details.',
    icon: ShieldAlert,
  },
  {
    stepId: 2,
    dataTut: 'sim-playback-controls',
    title: 'Historical Replay Timeline Controls',
    text: 'Use the play/pause, speed toggles (1x/4x/16x), and scrubber bar to advance historical time steps and observe how flooding evolves.',
    icon: Play,
  },
  {
    stepId: 3,
    dataTut: 'sim-citizen-routing',
    title: 'Hydro-Aware Evacuation Route Planner',
    text: 'Tests flood-safe routing algorithms against historical inundation layers to calculate safe paths avoiding flooded corridors.',
    icon: Navigation,
  },
  {
    stepId: 4,
    dataTut: 'sim-citizen-signal',
    title: 'Citizen SOS & Report Submission',
    text: 'Simulate submitting emergency flood reports and SOS alerts during historical deluges without affecting live database records.',
    icon: User,
  },
  {
    stepId: 5,
    dataTut: 'sim-map-container',
    title: 'Interactive Vector Map Canvas',
    text: 'Visualizes water depth contours, road inundation severities, historical benchmark markers, and safe evacuation corridors.',
    icon: MapPin,
  },
];

export const AUTHORITY_TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepId: 1,
    dataTut: 'sim-banner',
    title: 'Authority Command Replay Banner',
    text: 'Provides full context for historical disaster analysis, event citations, and persona switching.',
    icon: ShieldAlert,
  },
  {
    stepId: 2,
    dataTut: 'sim-playback-controls',
    title: 'Temporal Control Center',
    text: 'Step forward or rewind through historical deluges to analyze drainage response timelines and peak surcharge moments.',
    icon: Play,
  },
  {
    stepId: 3,
    dataTut: 'sim-scada-panel',
    title: 'SCADA Dewatering & Pump Override Panel',
    text: 'Monitor manhole surcharge levels and test manual pump overrides to simulate mitigating historical inundation.',
    icon: Power,
  },
  {
    stepId: 4,
    dataTut: 'sim-dispatch-queue',
    title: 'Historical Emergency Dispatch Desk',
    text: 'Review and simulate dispatching NDRF relief units to historical inundation hotspots.',
    icon: Truck,
  },
  {
    stepId: 5,
    dataTut: 'sim-sitrep-export',
    title: 'AI SitRep Report Generator',
    text: 'Export tagged situation reports with historical source citations and deterministic AI triage summaries.',
    icon: FileText,
  },
];

interface SimTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStepChange?: (step: TutorialStep) => void;
}

export const SimTutorialOverlay: React.FC<SimTutorialOverlayProps> = ({
  isOpen,
  onClose,
  onComplete,
  onStepChange,
}) => {
  const { simulationPersona } = useSimulationContext();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const prevHighlightedElRef = useRef<HTMLElement | null>(null);

  const steps =
    simulationPersona === 'authority' ? AUTHORITY_TUTORIAL_STEPS : CITIZEN_TUTORIAL_STEPS;

  const activeStep = steps[currentStepIndex];

  const resetPrevElementScaling = useCallback(() => {
    if (prevHighlightedElRef.current) {
      prevHighlightedElRef.current.style.transition = 'transform 0.3s ease';
      prevHighlightedElRef.current.style.transform = '';
      prevHighlightedElRef.current = null;
    }
  }, []);

  const updateTargetRect = useCallback(() => {
    if (!isOpen || !activeStep) return;

    const el = document.querySelector(`[data-tut="${activeStep.dataTut}"]`) as HTMLElement;
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        width: 300,
        height: 200,
      });
    }
  }, [isOpen, activeStep]);

  useEffect(() => {
    if (!isOpen || !activeStep) {
      resetPrevElementScaling();
      return;
    }

    if (onStepChange) {
      onStepChange(activeStep);
    }

    resetPrevElementScaling();

    // Small delay to allow container tab switching / mounting if required
    const stepTimer = setTimeout(() => {
      const el = document.querySelector(`[data-tut="${activeStep.dataTut}"]`) as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        el.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = 'scale(1.02)';
        prevHighlightedElRef.current = el;

        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        updateTargetRect();
      }
    }, 150);

    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(stepTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, currentStepIndex, activeStep, resetPrevElementScaling, updateTargetRect, onStepChange]);

  useEffect(() => {
    return () => {
      resetPrevElementScaling();
    };
  }, [resetPrevElementScaling]);

  if (!isOpen || !activeStep) return null;

  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    resetPrevElementScaling();
    try {
      localStorage.setItem(SIMULATION_TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {}
    onClose();
  };

  const handleFinish = () => {
    resetPrevElementScaling();
    try {
      localStorage.setItem(SIMULATION_TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {}
    if (onComplete) onComplete();
    onClose();
  };

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 12;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const tooltipWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth - 24 : 320, isMobile ? 320 : 360);
    const tooltipHeight = 240;

    let top = targetRect.top + targetRect.height + padding;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    if (top + tooltipHeight > window.innerHeight - 20) {
      top = targetRect.top - tooltipHeight - padding;
    }
    if (top < 20) top = Math.max(20, targetRect.top + 20);
    if (left < 12) left = 12;
    if (left + tooltipWidth > (typeof window !== 'undefined' ? window.innerWidth - 12 : 360)) {
      left = (typeof window !== 'undefined' ? window.innerWidth : 360) - tooltipWidth - 12;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      maxWidth: 'calc(100vw - 24px)',
      zIndex: 1000,
    };
  };

  const StepIcon = activeStep.icon;
  const paddingMargin = 8;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto select-none font-sans">
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-in-out">
        <defs>
          <mask id="sim-tutorial-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - paddingMargin}
                y={targetRect.top - paddingMargin}
                width={targetRect.width + paddingMargin * 2}
                height={targetRect.height + paddingMargin * 2}
                rx="16"
                ry="16"
                fill="black"
                className="transition-all duration-300 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(3, 7, 18, 0.82)"
          mask="url(#sim-tutorial-spotlight-mask)"
        />
      </svg>

      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${targetRect.top - paddingMargin}px`,
            left: `${targetRect.left - paddingMargin}px`,
            width: `${targetRect.width + paddingMargin * 2}px`,
            height: `${targetRect.height + paddingMargin * 2}px`,
          }}
          className="pointer-events-none rounded-2xl ring-2 ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.7)] animate-pulse transition-all duration-300 ease-in-out z-[999]"
        />
      )}

      <div
        style={getTooltipStyle()}
        className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 text-white shadow-2xl space-y-3 transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                {simulationPersona === 'authority' ? 'Authority Track' : 'Citizen Track'} — Step {activeStep.stepId} of {steps.length}
              </span>
              <h3 className="text-xs font-bold text-white leading-tight">
                {activeStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
          {activeStep.text}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1.5">
            {steps.map((s, idx) => (
              <div
                key={s.stepId}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex ? 'w-5 bg-amber-400 shadow-sm' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all min-h-[36px]"
            >
              <span>{isLastStep ? 'Finish' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
