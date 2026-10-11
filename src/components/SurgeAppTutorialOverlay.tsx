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
  Layers,
  Navigation,
  AlertOctagon,
  Camera,
  PhoneCall,
  Building2,
  Zap,
  FileText,
  HelpCircle,
  UserCheck
} from 'lucide-react';

export const SURGE_CITIZEN_TUTORIAL_KEY = 'vrishti_citizen_tutorial_seen';
export const SURGE_AUTHORITY_TUTORIAL_KEY = 'vrishti_authority_tutorial_seen';

export interface TutorialStepItem {
  stepId: number;
  dataTut: string;
  title: string;
  text: string;
  icon: React.ElementType;
}

const CITIZEN_STEPS: TutorialStepItem[] = [
  {
    stepId: 1,
    dataTut: 'cit-brand-header',
    title: 'Welcome to SURGE Citizen Portal',
    text: 'SURGE provides hyper-local urban flood nowcasting, flood-avoidance route navigation, and verified crowd hazard reporting.',
    icon: Sparkles
  },
  {
    stepId: 2,
    dataTut: 'cit-nav-gis',
    title: 'GIS Map & Layers Manager',
    text: 'Toggle vector GIS map layers including Road Inundation, Safe Corridors, Stormwater Nodes, and Digital Elevation Models.',
    icon: Layers
  },
  {
    stepId: 3,
    dataTut: 'cit-nav-routing',
    title: 'Vehicle-Aware Safe Route Planner',
    text: 'Find safe, flood-avoidance routes customized to your vehicle type (Sedan, SUV, Hatchback, Ambulance, or Pedestrian).',
    icon: Navigation
  },
  {
    stepId: 4,
    dataTut: 'cit-nav-alerts',
    title: 'Live Inundation Warnings Feed',
    text: 'Monitor real-time surface waterlogging, manhole surcharges, and emergency advisory warnings across your city.',
    icon: AlertOctagon
  },
  {
    stepId: 5,
    dataTut: 'cit-nav-report',
    title: 'Live Camera Water Sump Reporting',
    text: 'Report water sumps using live device camera photo capture (no uploads), your name, mobile number, and 1-tap OTP verification.',
    icon: Camera
  },
  {
    stepId: 6,
    dataTut: 'cit-nav-emergency',
    title: '24x7 Toll-Free Emergency Directory',
    text: 'One-tap dial emergency helplines for NDRF, Municipal Disaster Control Room (1916), Ambulance (108), and Coastal Security.',
    icon: PhoneCall
  }
];

const AUTHORITY_STEPS: TutorialStepItem[] = [
  {
    stepId: 1,
    dataTut: 'auth-header-brand',
    title: 'Municipal Disaster Command Hub',
    text: 'Welcome to the SURGE Authority Control Room! Monitor real-time SCADA telemetry, hydraulic engine forecasts, and citizen ground signals.',
    icon: Building2
  },
  {
    stepId: 2,
    dataTut: 'auth-ai-triage',
    title: 'Operational AI Triage Layer',
    text: 'DeepSeek AI synthesizes nowcast precipitation telemetry and prioritizes critical submerged road corridors for rapid intervention.',
    icon: Sparkles
  },
  {
    stepId: 3,
    dataTut: 'auth-citizen-reports-desk',
    title: 'Citizen Ground Reports & Water Sumps Desk',
    text: 'Review live crowdsourced reports, inspect camera photo evidence, verify reporter mobile numbers, and dispatch dewatering crews.',
    icon: UserCheck
  },
  {
    stepId: 4,
    dataTut: 'auth-pump-controls',
    title: 'SCADA Dewatering Pump Controls',
    text: 'Monitor pumping station discharge capacity (L/s) and remotely activate or deactivate dewatering pumps across municipal wards.',
    icon: Zap
  },
  {
    stepId: 5,
    dataTut: 'auth-time-scrubber',
    title: '0–3 Hour Forecast Scrubber & Simulation',
    text: 'Simulate rainfall propagation from t = 0 to 180 minutes to predict pipe surcharge levels and surface inundation bottlenecks.',
    icon: Play
  },
  {
    stepId: 6,
    dataTut: 'auth-sitrep-export',
    title: 'Automated SitRep Exporter',
    text: 'Generate and export formal municipal Situation Reports (SITREP) in PDF, CSV, and GeoJSON formats for disaster command.',
    icon: FileText
  }
];

interface SurgeAppTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'citizen' | 'authority';
  onStepNavigate?: (dataTut: string) => void;
}

export const SurgeAppTutorialOverlay: React.FC<SurgeAppTutorialOverlayProps> = ({
  isOpen,
  onClose,
  mode,
  onStepNavigate
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const prevHighlightedElRef = useRef<HTMLElement | null>(null);
  const steps = mode === 'citizen' ? CITIZEN_STEPS : AUTHORITY_STEPS;
  const activeStep = steps[currentStepIndex];

  const storageKey = mode === 'citizen' ? SURGE_CITIZEN_TUTORIAL_KEY : SURGE_AUTHORITY_TUTORIAL_KEY;

  const resetPrevElementScaling = useCallback(() => {
    if (prevHighlightedElRef.current) {
      prevHighlightedElRef.current.style.transition = 'transform 0.3s ease';
      prevHighlightedElRef.current.style.transform = '';
      prevHighlightedElRef.current = null;
    }
  }, []);

  // Helper: check if element is actually rendered (not display:none from `hidden` class)
  const isElementVisible = (el: HTMLElement): boolean => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  };

  const updateTargetRect = useCallback(() => {
    if (!isOpen || !activeStep) return;

    const el = document.querySelector(`[data-tut="${activeStep.dataTut}"]`) as HTMLElement;
    if (el && isElementVisible(el)) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    } else {
      // Element not found or hidden on mobile — no spotlight
      setTargetRect(null);
    }
  }, [isOpen, activeStep]);

  useEffect(() => {
    if (!isOpen || !activeStep) {
      resetPrevElementScaling();
      return;
    }

    resetPrevElementScaling();

    // Trigger auto-navigation in parent component (e.g. open hamburger, switch tab)
    if (onStepNavigate) {
      onStepNavigate(activeStep.dataTut);
    }

    // Delay lookup to allow hamburger drawer or tab transitions to complete rendering
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-tut="${activeStep.dataTut}"]`) as HTMLElement;
      if (el && isElementVisible(el)) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = 'scale(1.025)';
        prevHighlightedElRef.current = el;

        const rectTimer = setTimeout(() => {
          if (isElementVisible(el)) {
            const rect = el.getBoundingClientRect();
            setTargetRect({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            });
          } else {
            setTargetRect(null);
          }
        }, 150);

        return () => clearTimeout(rectTimer);
      } else {
        setTargetRect(null);
      }
    }, 250);

    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, currentStepIndex, activeStep, resetPrevElementScaling, updateTargetRect, onStepNavigate]);

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
      localStorage.setItem(storageKey, 'true');
    } catch (e) {}
    onClose();
  };

  const handleFinish = () => {
    resetPrevElementScaling();
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {}
    onClose();
  };

  // Whether we have a real visible target to spotlight
  const hasVisibleTarget = targetRect !== null && targetRect.width > 5 && targetRect.height > 5;

  const getTooltipStyle = (): React.CSSProperties => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const tooltipWidth = isMobile ? Math.min(window.innerWidth - 32, 340) : 360;
    const tooltipHeight = 240;

    // No visible target or mobile → centered bottom card
    if (!hasVisibleTarget || isMobile) {
      return {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${tooltipWidth}px`,
        zIndex: 1000
      };
    }

    const padding = 16;
    let top = targetRect!.top + targetRect!.height + padding;
    let left = targetRect!.left + targetRect!.width / 2 - tooltipWidth / 2;

    if (top + tooltipHeight > window.innerHeight - 20) {
      top = targetRect!.top - tooltipHeight - padding;
    }
    if (top < 20) {
      top = Math.max(20, targetRect!.top + 20);
    }
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 1000
    };
  };

  const StepIcon = activeStep.icon;
  const paddingMargin = 8;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-auto select-none font-sans">
      {/* Dark overlay — full screen when no target, masked spotlight when target is visible */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="surge-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {hasVisibleTarget && targetRect && (
              <rect
                x={targetRect.left - paddingMargin}
                y={targetRect.top - paddingMargin}
                width={targetRect.width + paddingMargin * 2}
                height={targetRect.height + paddingMargin * 2}
                rx="16"
                ry="16"
                fill="black"
                className="transition-all duration-300"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(2, 6, 23, 0.85)"
          mask={hasVisibleTarget ? "url(#surge-spotlight-mask)" : undefined}
        />
      </svg>

      {/* Spotlight ring — only render when target is truly visible */}
      {hasVisibleTarget && targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${targetRect.top - paddingMargin}px`,
            left: `${targetRect.left - paddingMargin}px`,
            width: `${targetRect.width + paddingMargin * 2}px`,
            height: `${targetRect.height + paddingMargin * 2}px`
          }}
          className="pointer-events-none rounded-2xl ring-2 ring-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.7)] animate-pulse transition-all duration-300 z-[999]"
        />
      )}

      <div
        style={getTooltipStyle()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white shadow-2xl space-y-3 transition-all duration-300 animate-fadeIn max-w-[calc(100vw-2rem)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
              <StepIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block truncate">
                {mode === 'citizen' ? 'Citizen Guide' : 'Authority Guide'} • {activeStep.stepId}/{steps.length}
              </span>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                {activeStep.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2"
            title="Close Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {activeStep.text}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1.5">
            {steps.map((s, idx) => (
              <div
                key={s.stepId}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-5 bg-sky-500 dark:bg-sky-400 shadow-xs'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[36px]"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-blue-500/20 transition-all active:scale-95 min-h-[40px]"
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
