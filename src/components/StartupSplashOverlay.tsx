'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const StartupSplashOverlay: React.FC = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      // 1. Session Storage Guard: Only show on true initial load / first visit per session
      const splashSeen = sessionStorage.getItem('vrishti_splash_session_seen');
      if (splashSeen) return;

      // Mark session as seen
      sessionStorage.setItem('vrishti_splash_session_seen', 'true');
      setIsVisible(true);
      document.body.style.overflow = 'hidden';

      // 2. Early System Theme Detection (Before full context is hydrated)
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const htmlDark = document.documentElement.classList.contains('dark');
      const savedTheme = localStorage.getItem('vrishti-theme-preference') || localStorage.getItem('vrishti-theme');
      
      let isDark = true;
      if (savedTheme === 'light') isDark = false;
      else if (savedTheme === 'dark') isDark = true;
      else isDark = htmlDark || systemDark;
      
      setIsDarkTheme(isDark);

      // 3. Accessibility: Check prefers-reduced-motion
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);

      // 4. Asset Load Promise + 2000ms Minimum Delay Promise
      const minTimerPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      
      const assetLoadPromise = new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true), { once: true });
          // Fallback timeout if window load is delayed
          setTimeout(resolve, 3000);
        }
      });

      // 5. Proceed only when BOTH 2-second timer AND asset loading resolve
      Promise.all([minTimerPromise, assetLoadPromise]).then(() => {
        // Smooth 1000ms (1.0s) extra departure fade transition
        setIsFadingOut(true);
        
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = '';
        }, 1000);
      });

      return () => {
        document.body.style.overflow = '';
      };
    } catch (e) {
      /* ignore storage or window errors */
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t.splash.loadingLabel}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
        isDarkTheme ? 'bg-[#0B101D] text-white' : 'bg-[#E3F0FB] text-slate-900'
      } ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ willChange: 'opacity' }}
    >
      {/* Background Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className={`absolute w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-in-out ${
          isDarkTheme ? 'bg-sky-500/15' : 'bg-sky-400/25'
        } ${isFadingOut ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} ${
          prefersReducedMotion ? '' : 'animate-pulse'
        }`}
      />

      {/* Main Branded Splash Content Container */}
      <div
        className={`relative flex flex-col items-center space-y-4 sm:space-y-6 px-4 text-center transform-gpu transition-all duration-1000 ease-in-out ${
          isFadingOut ? 'scale-90 opacity-0 -translate-y-8' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* SURGE Cloud Logo Badge */}
        <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl shadow-sky-500/30 border-2 border-sky-400/60 p-1 flex items-center justify-center shrink-0">
          <img
            src="/images/surge-logo.png"
            alt="SURGE Logo"
            className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
          />
        </div>

        {/* Wordmark Title & Subtitle */}
        <div className="flex flex-col items-center space-y-1.5 max-w-xs sm:max-w-md">
          <h1 className={`sr-only text-4xl sm:text-6xl font-extrabold tracking-normal font-logo drop-shadow-md text-transparent bg-clip-text ${
            isDarkTheme
              ? 'bg-gradient-to-r from-white via-sky-300 to-white'
              : 'bg-gradient-to-r from-slate-900 via-sky-600 to-slate-900'
          } ${prefersReducedMotion ? '' : 'animate-text-shine'}`}>
            {t.splash.title}
          </h1>
          <p className={`text-xs sm:text-sm font-bold tracking-widest uppercase font-mono px-2 leading-tight ${
            isDarkTheme ? 'text-sky-300' : 'text-slate-600'
          } ${prefersReducedMotion ? '' : 'animate-pulse'}`}>
            {t.splash.subtitle}
          </p>
        </div>

        {/* Monochromatic Monsoon Indigo Progress Line Indicator */}
        <div
          aria-hidden="true"
          className="w-36 sm:w-48 h-1 rounded-full bg-slate-700/30 dark:bg-slate-800 overflow-hidden relative mt-2"
        >
          <div
            className={`h-full bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-300 rounded-full ${
              prefersReducedMotion
                ? 'w-full'
                : 'w-full animate-[progress_2s_ease-in-out_infinite]'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
