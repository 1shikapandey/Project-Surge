'use client';

import React from 'react';
import { CITIES, CityId } from '@/lib/mock-data';
import {
  Building2,
  Languages,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/translations';

interface LandingPageProps {
  onSelectCity: (cityId: CityId) => void;
  onGoToCitizenApp?: () => void;
  onOpenAuthModal: (defaultCity?: CityId) => void;
  authorityAuth: { isLoggedIn: boolean; loginId: string; cityId: CityId } | null;
}

// 🌧️ Full-Screen Realistic Atmospheric Rain Overlay
const ConstantRainOverlay: React.FC = () => {
  const drops = Array.from({ length: 90 }).map((_, i) => {
    const left = ((i * 1.618033 * 100) % 100).toFixed(2);
    const isForeground = i % 3 === 0;

    const duration = isForeground
      ? 0.45 + ((i * 13) % 35) / 100
      : 0.75 + ((i * 17) % 55) / 100;

    const delay = (((i * 29) % 100) / 100) * 1.5;
    const height = isForeground
      ? 75 + ((i * 19) % 45)
      : 35 + ((i * 11) % 40);

    const opacity = isForeground
      ? 0.35 + ((i * 7) % 30) / 100
      : 0.10 + ((i * 5) % 20) / 100;

    return {
      id: i,
      left: `${left}%`,
      duration: `${duration}s`,
      delay: `${delay}s`,
      height: `${height}px`,
      opacity,
      width: isForeground ? '1.2px' : '0.8px',
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute rounded-full animate-rain-drop bg-gradient-to-b from-transparent via-sky-400/40 dark:via-sky-200/40 to-sky-500/20 shadow-[0_0_2px_rgba(56,189,248,0.4)]"
          style={{
            left: drop.left,
            top: '-130px',
            width: drop.width,
            height: drop.height,
            opacity: drop.opacity,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }}
        />
      ))}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectCity,
  onGoToCitizenApp,
  onOpenAuthModal,
  authorityAuth
}) => {
  const { lang, setLang, t, supportedLanguages } = useLanguage();
  const cityList = Object.values(CITIES);
  const [selectedCityId, setSelectedCityId] = React.useState<CityId>('mumbai');

  const selectedCity = CITIES[selectedCityId] || cityList[0];

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col justify-between font-sans transition-colors duration-300 overflow-x-hidden overflow-y-auto selection:bg-sky-500 selection:text-white">
      {/* 🏙️ BACKGROUND IMAGE LAYER */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/light-theme-bg.png"
          alt="SURGE Light Theme City Skyline Background"
          className="dark:hidden absolute inset-0 w-full h-full object-cover object-bottom transition-opacity duration-500"
        />
        <img
          src="/images/dark-theme-bg.png"
          alt="SURGE Dark Theme City Skyline Background"
          className="hidden dark:block absolute inset-0 w-full h-full object-cover object-bottom transition-opacity duration-500"
        />
      </div>

      {/* 🌧️ CONSTANT ATMOSPHERIC RAIN OVERLAY */}
      <ConstantRainOverlay />

      {/* 🔝 Glassmorphic Header */}
      <header className="relative z-30 w-full max-w-full bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-sky-100 dark:border-neutral-800/80 px-4 sm:px-8 py-3 flex items-center justify-between shrink-0 transition-colors shadow-xs">
        {/* Brand Mark */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white shadow-md shadow-sky-400/20 border border-sky-300/60 shrink-0 p-0.5">
            <img
              src="/images/surge-logo.png"
              alt="SURGE Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          {/* The logo already contains the wordmark; keep the name for screen readers / document outline */}
          <h1 className="sr-only">SURGE</h1>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* City Dropdown in Header */}
          <div className="relative flex items-center px-3 py-1.5 bg-sky-50/90 dark:bg-neutral-900/90 border border-sky-200/80 dark:border-neutral-800 rounded-xl text-2xs sm:text-xs font-bold text-slate-900 dark:text-sky-200 hover:border-sky-400 dark:hover:border-sky-500/50 transition-all shadow-xs shrink-0 group">
            <Building2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 mr-1.5 shrink-0 pointer-events-none group-hover:scale-110 transition-transform" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value as CityId)}
              className="bg-transparent text-2xs sm:text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-1"
              aria-label="Select City"
            >
              {cityList.map((city) => (
                <option key={city.id} value={city.id} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white font-medium">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector Dropdown */}
          <div className="relative flex items-center px-2.5 py-1.5 bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 rounded-xl text-2xs sm:text-xs text-slate-900 dark:text-slate-200 font-bold hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition-colors shadow-xs shrink-0">
            <Languages className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 mr-1 shrink-0 pointer-events-none" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguage)}
              className="bg-transparent text-2xs sm:text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-0.5"
              aria-label="Select Language"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white font-medium">
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* 🚀 Main Workspace Content */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 sm:py-14 max-w-3xl mx-auto w-full my-auto space-y-6">
        
        {/* HERO CONTENT CARD - Premium Glassmorphic Container */}
        <div className="w-full bg-white/25 dark:bg-neutral-950/10 backdrop-blur-2xl border border-sky-100 dark:border-neutral-800/90 rounded-3xl p-6 sm:p-10 text-center shadow-2xl dark:shadow-[0_0_60px_rgba(56,189,248,0.12)] flex flex-col items-center space-y-6 transition-all duration-300">
          
          {/* Dignitaries & SURGE Logo Row */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 pt-1">

            {/* SURGE Logo Badge */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-white dark:bg-black shadow-xl shadow-sky-400/25 dark:shadow-sky-400/30 border-2 border-sky-300/80 dark:border-sky-400/60 p-1 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
              <img
                src="/images/surge-logo.png"
                alt="SURGE Logo"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Title & Full Form */}
          <div className="space-y-2.5 max-w-xl">
            <h2 className="sr-only">SURGE</h2>
            <p className="text-xs sm:text-sm font-extrabold text-sky-300 dark:text-sky-300 tracking-wider leading-snug">
              {t.landing.fullForm}
            </p>
          </div>

          {/* Action Buttons at Bottom of Hero Section */}
          <div className="pt-2 w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Citizen Dashboard Button */}
            <button
              type="button"
              onClick={() => onSelectCity(selectedCityId)}
              className="w-full sm:flex-1 min-h-[48px] px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-sky-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer group"
            >
              <span>{t.landing.citizenDashboardBtn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Authority Login Button */}
            {authorityAuth?.isLoggedIn ? (
              <button
                type="button"
                onClick={() => onSelectCity(authorityAuth.cityId)}
                className="w-full sm:flex-1 min-h-[48px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.nav.authorityCenter}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal(selectedCityId)}
                className="w-full sm:flex-1 min-h-[48px] px-6 py-3.5 rounded-2xl bg-slate-900 dark:bg-neutral-100 text-white dark:text-black hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] font-extrabold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400 dark:text-sky-600" />
                <span>{t.landing.authorityLoginBtn}</span>
              </button>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};



