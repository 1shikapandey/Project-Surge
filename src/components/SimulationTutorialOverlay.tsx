'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronRight,
  ShieldAlert,
  Calendar,
  MapPin,
  Play,
  CheckCircle2,
  Sparkles,
  PanelLeftOpen
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const SIMULATION_TUTORIAL_STORAGE_KEY = 'aquaalert_sim_tutorial_seen';

export interface TutorialStep {
  stepId: number;
  dataTut: string;
  title: string;
  text: string;
  icon: React.ElementType;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { stepId: 1, dataTut: 'sim-banner', title: 'Simulation Mode Safety Banner', text: '', icon: ShieldAlert },
  { stepId: 2, dataTut: 'sim-event-selector', title: 'City Focus & Event Selector', text: '', icon: Calendar },
  { stepId: 3, dataTut: 'sim-playback-controls', title: 'Interactive Timeline Replay Controls', text: '', icon: Play },
  { stepId: 4, dataTut: 'sim-provenance-badge', title: 'Data Provenance & AI Intelligence', text: '', icon: CheckCircle2 },
  { stepId: 5, dataTut: 'sim-map-container', title: 'Hydraulic GIS Vector Map Canvas', text: '', icon: MapPin },
];

interface SimulationTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const SimulationTutorialOverlay: React.FC<SimulationTutorialOverlayProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const prevHighlightedElRef = useRef<HTMLElement | null>(null);

  const TUTORIAL_STEPS: TutorialStep[] = [
    {
      stepId: 1,
      dataTut: 'sim-banner',
      title: t.simulationTutorial.bannerTitle,
      text: t.simulationTutorial.bannerText,
      icon: ShieldAlert,
      preferredPlacement: 'bottom',
    },
    {
      stepId: 2,
      dataTut: 'sim-event-selector',
      title: t.simulationTutorial.selectorTitle,
      text: t.simulationTutorial.selectorText,
      icon: Calendar,
      preferredPlacement: 'right',
    },
    {
      stepId: 3,
      dataTut: 'sim-playback-controls',
      title: t.simulationTutorial.controlsTitle,
      text: t.simulationTutorial.controlsText,
      icon: Play,
      preferredPlacement: 'right',
    },
    {
      stepId: 4,
      dataTut: 'sim-provenance-badge',
      title: t.simulationTutorial.provenanceTitle,
      text: t.simulationTutorial.provenanceText,
      icon: CheckCircle2,
      preferredPlacement: 'right',
    },
    {
      stepId: 5,
      dataTut: 'sim-map-container',
      title: t.simulationTutorial.mapTitle,
      text: t.simulationTutorial.mapText,
      icon: MapPin,
      preferredPlacement: 'left',
    },
  ];

  const activeStep = TUTORIAL_STEPS[currentStepIndex];

  // Helper: Reset scaling transform on previous element
  const resetPrevElementScaling = useCallback(() => {
    if (prevHighlightedElRef.current) {
      prevHighlightedElRef.current.style.transition = 'transform 0.3s ease';
      prevHighlightedElRef.current.style.transform = '';
      prevHighlightedElRef.current = null;
    }
  }, []);

  // Update target rect & scroll into view with zoom effect
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
      // Fallback: center spotlight
      setTargetRect({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        width: 300,
        height: 200,
      });
    }
  }, [isOpen, activeStep]);

  // Handle Smooth Scroll and Zoom-In / Zoom-Out on Target Step
  useEffect(() => {
    if (!isOpen || !activeStep) {
      resetPrevElementScaling();
      return;
    }

    resetPrevElementScaling();

    const el = document.querySelector(`[data-tut="${activeStep.dataTut}"]`) as HTMLElement;
    if (el) {
      // 1. Smooth scroll to center component in viewport
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      // 2. Apply smooth zoom-in scale effect (1.03x spring scale)
      el.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = 'scale(1.03)';
      prevHighlightedElRef.current = el;

      // Update target spotlight bounding box after smooth scroll settles
      const scrollTimer = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }, 350);

      const handleResize = () => updateTargetRect();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);

      return () => {
        clearTimeout(scrollTimer);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    } else {
      updateTargetRect();
    }
  }, [isOpen, currentStepIndex, activeStep, resetPrevElementScaling, updateTargetRect]);

  // Clean up element scaling on unmount or close
  useEffect(() => {
    return () => {
      resetPrevElementScaling();
    };
  }, [resetPrevElementScaling]);

  if (!isOpen || !activeStep) return null;

  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

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
    } catch (e) {
      /* ignore storage errors */
    }
    onClose();
  };

  const handleFinish = () => {
    resetPrevElementScaling();
    try {
      localStorage.setItem(SIMULATION_TUTORIAL_STORAGE_KEY, 'true');
    } catch (e) {
      /* ignore storage errors */
    }
    onComplete();
  };

  // Compute Tooltip position relative to target Rect
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 16;
    const tooltipWidth = 360;
    const tooltipHeight = 230;

    let top = targetRect.top + targetRect.height + padding;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    // Check bottom boundary
    if (top + tooltipHeight > window.innerHeight - 20) {
      top = targetRect.top - tooltipHeight - padding;
    }

    // Check top boundary overflow
    if (top < 20) {
      top = Math.max(20, targetRect.top + 20);
    }

    // Check horizontal boundaries
    if (left < 20) left = 20;
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = window.innerWidth - tooltipWidth - 20;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 1000,
    };
  };

  const StepIcon = activeStep.icon;
  const paddingMargin = 8;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto select-none font-sans">
      {/* Darkened Semi-transparent Overlay SVG with Spotlight Cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-in-out">
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White covers everything (visible dark veil) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black hole cuts out the target element */}
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
        {/* Backdrop Tint matching SURGE theme */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(3, 7, 18, 0.82)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* Animated Glowing Focus Ring matching SURGE Sky/Cyan theme */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${targetRect.top - paddingMargin}px`,
            left: `${targetRect.left - paddingMargin}px`,
            width: `${targetRect.width + paddingMargin * 2}px`,
            height: `${targetRect.height + paddingMargin * 2}px`,
          }}
          className="pointer-events-none rounded-2xl ring-2 ring-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.7)] animate-pulse transition-all duration-300 ease-in-out z-[999]"
        />
      )}

      {/* Floating Coachmark Tooltip Card matching SURGE UI theme */}
      <div
        style={getTooltipStyle()}
        className="bg-slate-900/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-4 text-white shadow-2xl space-y-3 transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95"
      >
        {/* Tooltip Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
                {t.simulationTutorial.stepOf} {activeStep.stepId} of {TUTORIAL_STEPS.length}
              </span>
              <h3 className="text-xs font-bold text-white leading-tight">
                {activeStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Close Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explanatory Text */}
        <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
          {activeStep.text}
        </p>

        {/* Step Dots & Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          {/* Progress Indicator Dots */}
          <div className="flex items-center space-x-1.5">
            {TUTORIAL_STEPS.map((s, idx) => (
              <div
                key={s.stepId}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-5 bg-sky-400 shadow-sm'
                    : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              {t.simulationTutorial.skipBtn}
            </button>

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all active:scale-95 min-h-[36px]"
            >
              <span>{isLastStep ? t.simulationTutorial.finishBtn : t.simulationTutorial.nextBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
