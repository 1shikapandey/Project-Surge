'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { RoutingWidget } from '@/components/RoutingWidget';
import { AlertFeed } from '@/components/AlertFeed';
import { TimeSlider } from '@/components/TimeSlider';
import { CityId, CITIES, CitizenReport, NavigationRoute } from '@/lib/mock-data';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import {
  Shield,
  ShieldAlert,
  Globe,
  MapPin,
  Navigation,
  AlertOctagon,
  Camera,
  Languages,
  ArrowLeft,
  Crosshair,
  CloudRain,
  CheckCircle2,
  AlertTriangle,
  Send,
  Layers,
  Sparkles,
  PhoneCall,
  Clock,
  ChevronLeft,
  ChevronRight,
  Map,
  Sliders,
  Bell,
  User,
  Smartphone,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Users,
  ThumbsUp,
  Menu
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SupportedLanguage } from '@/lib/i18n/translations';
import { INDIAN_EMERGENCY_SERVICES } from '@/lib/emergency-data';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationModal } from '@/components/NotificationModal';
import { SurgeAppTutorialOverlay, SURGE_CITIZEN_TUTORIAL_KEY } from '@/components/SurgeAppTutorialOverlay';

import { CitizenGisLayersWidget, DEFAULT_CITIZEN_LAYERS, MapLayerVisibility } from '@/components/CitizenGisLayersWidget';

// Dynamically import OpenLayersMapCanvas with SSR disabled
const OpenLayersMapCanvas = dynamic(
  () => import('@/components/OpenLayersMapCanvas').then((mod) => mod.OpenLayersMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-slate-800">
        <div className="w-9 h-9 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-sky-400 font-mono font-bold">
          Loading Public Citizen Vector GIS Canvas...
        </p>
      </div>
    )
  }
);

interface CitizenAppViewProps {
  selectedCityId: CityId;
  onSelectCity: (cityId: CityId) => void;
  onGoToLanding: () => void;
  onOpenAuthModal: () => void;
  citizenReports: CitizenReport[];
  onAddReport: (report: CitizenReport) => void;
}

export const CitizenAppView: React.FC<CitizenAppViewProps> = ({
  selectedCityId,
  onSelectCity,
  onGoToLanding,
  onOpenAuthModal,
  citizenReports,
  onAddReport
}) => {
  const { lang, setLang, t, supportedLanguages } = useLanguage();
  const [activeTab, setActiveTab] = useState<'gis' | 'routing' | 'alerts' | 'report' | 'emergency'>('gis');
  const [reportSubTab, setReportSubTab] = useState<'submit' | 'community'>('submit');
  const [upvotedReportIds, setUpvotedReportIds] = useState<Set<string>>(new Set());

  const handleUpvoteReport = (reportId: string) => {
    setUpvotedReportIds((prev) => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  };
  const [layerVisibility, setLayerVisibility] = useState<MapLayerVisibility>(DEFAULT_CITIZEN_LAYERS);
  const [timeOffsetMins, setTimeOffsetMins] = useState(0);
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Mobile View Toggle: Map vs Panel
  const [mobileGisTab, setMobileGisTab] = useState<'map' | 'panel'>('map');

  // Mobile Hamburger Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sidebar Collapse state for Laptop Screen
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Resizable Split Panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(36);
  const [isResizing, setIsResizing] = useState(false);

  // Alert Feed Modal & Interactive Tutorial
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Auto launch tutorial on first-time Citizen App visit
  useEffect(() => {
    try {
      const seen = localStorage.getItem(SURGE_CITIZEN_TUTORIAL_KEY);
      if (!seen) {
        setIsTutorialOpen(true);
      }
    } catch (e) {}
  }, []);

  // Live GPS Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatusText, setGpsStatusText] = useState<string | null>(null);

  // Map Pin Picker State
  const [routePinMode, setRoutePinMode] = useState<'none' | 'origin' | 'destination'>('none');
  const [pinnedOrigin, setPinnedOrigin] = useState<[number, number] | null>(null);
  const [pinnedDestination, setPinnedDestination] = useState<[number, number] | null>(null);

  // Citizen Ground Waterlogging Report & Camera Access State
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');
  const [reportDepthCm, setReportDepthCm] = useState(20);
  const [reportLocation, setReportLocation] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessToast, setReportSuccessToast] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Live Camera Access State (No Uploads Allowed)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('4892');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Stop Live Camera Stream Helper
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Stop Camera on Tab Change or Unmount
  useEffect(() => {
    if (activeTab !== 'report') {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Request & Start Device Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setFormValidationError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn('Video stream play:', e));
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please grant browser camera permission.');
      setIsCameraActive(false);
    }
  };

  // Capture Live Snapshot Frame to Offscreen Canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setReportPhoto(dataUrl);
      stopCamera();
    }
  };

  const [liveRainTimeline, setLiveRainTimeline] = useState<number[] | null>(null);

  // Fetch real-time fused precipitation telemetry from /api/nowcast for selected city
  useEffect(() => {
    let isMounted = true;
    const fetchLiveNowcast = async () => {
      try {
        const res = await fetch(`/api/nowcast?city=${selectedCityId}&time=${timeOffsetMins}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.openMeteoTelemetry?.nowcastTimelineMmHr) {
            setLiveRainTimeline(data.openMeteoTelemetry.nowcastTimelineMmHr);
          }
        }
      } catch (err) {
        console.warn('Live citizen nowcast fetch failed:', err);
      }
    };
    fetchLiveNowcast();
    const interval = setInterval(fetchLiveNowcast, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedCityId, timeOffsetMins]);

  const city = CITIES[selectedCityId];
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId, liveRainTimeline || undefined);
  const totalAlerts = snapshot.totalFloodedRoadsCount + snapshot.criticalSurchargeNodesCount;

  // Handle panel resizer
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 22 && newWidth < 70) {
        setLeftPanelWidth(newWidth);
        window.dispatchEvent(new Event('resize'));
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      window.dispatchEvent(new Event('resize'));
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Dispatch resize event when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 310);
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed]);

  // Trigger Browser GPS Location
  const handleAcquireGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusText(t.citizenApp.gpsDenied);
      return;
    }

    setIsLocating(true);
    setGpsStatusText('Acquiring GPS Signal...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const label = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label });
        setPinnedOrigin(coords);
        setReportLocation(label);
        setIsLocating(false);
        setGpsStatusText(t.citizenApp.gpsAcquired);
        setTimeout(() => setGpsStatusText(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGpsStatusText(t.citizenApp.gpsDenied);
        setTimeout(() => setGpsStatusText(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLocationPicked = (mode: 'origin' | 'destination', coords: [number, number]) => {
    if (mode === 'origin') {
      setPinnedOrigin(coords);
    } else {
      setPinnedDestination(coords);
    }
  };

  // Initiate Report Submission: Validate & Open Mobile OTP Verification Modal
  const handleInitiateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    if (!reporterName.trim()) {
      setFormValidationError('Please enter your full name.');
      return;
    }
    if (!reporterMobile.trim() || !/^[0-9]{10}$/.test(reporterMobile.trim())) {
      setFormValidationError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!reportLocation.trim()) {
      setFormValidationError('Please specify or acquire ground location.');
      return;
    }
    if (!reportPhoto) {
      setFormValidationError('Live site camera snapshot is required. Please click camera to take a photo.');
      return;
    }

    // Generate random 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpInput(code); // Pre-fill for instant demo submission
    setOtpError(null);
    setIsOtpModalOpen(true);
  };

  // Confirm OTP & Add Verified Report
  const handleVerifyOtpAndSubmit = () => {
    if (otpInput.trim() !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the 4-digit code shown.');
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      const coords = pinnedOrigin || [city.center[0], city.center[1]];
      const newReport: CitizenReport = {
        id: `report-citizen-${Date.now()}`,
        cityId: selectedCityId,
        timestamp: 'Just now',
        lat: coords[0],
        lng: coords[1],
        locationName: reportLocation || `${city.name} Central`,
        coordinates: coords,
        waterDepthCm: reportDepthCm,
        userNote: reportNote || 'Reported via Citizen App',
        verified: true,
        upvotes: 1,
        timestampMinsAgo: 0,
        status: 'pending',
        photoUrl: reportPhoto || undefined,
        reporterName: reporterName.trim(),
        reporterMobile: reporterMobile.trim()
      };

      onAddReport(newReport);
      setIsVerifyingOtp(false);
      setIsOtpModalOpen(false);
      setReportSuccessToast(true);
      
      // Clear form inputs
      setReportNote('');
      setReportPhoto(null);
      setReporterName('');
      setReporterMobile('');
      setFormValidationError(null);

      setTimeout(() => setReportSuccessToast(false), 5000);
    }, 600);
  };

  const citizenNavItems = [
    {
      id: 'gis',
      label: t.citizenApp.tabGis || 'Live Inundation',
      shortLabel: 'Inundation',
      description: 'Layer & Legend Manager',
      icon: Layers
    },
    {
      id: 'routing',
      label: t.citizenApp.tabRoute || 'Flood Safe Navigation',
      shortLabel: 'Safe Route',
      description: 'Flood-avoidance routes',
      icon: Navigation
    },
    {
      id: 'alerts',
      label: t.citizenApp.tabAlerts || 'Live Alerts',
      shortLabel: 'Alerts',
      description: 'Live Inundation Warnings',
      icon: AlertOctagon
    },
    {
      id: 'report',
      label: t.citizenApp.tabReport || 'Report Water logging',
      shortLabel: 'Report',
      description: 'Crowdsource Waterlogging',
      icon: Camera
    },
    {
      id: 'emergency',
      label: t.citizenApp.tabEmergency || 'Emergency Contacts',
      shortLabel: 'Emergency',
      description: '24x7 Helpline Directory',
      icon: PhoneCall
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* ── Citizen Top Header Navbar ────────────────────────────────────────────── */}
      <header className="w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-40 flex items-center justify-between gap-2 sm:gap-3 shadow-sm text-slate-900 dark:text-white">
        
        {/* Left Side: Hamburger (mobile) + Back Button & Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 transition-all min-w-[40px] min-h-[40px] shadow-sm"
            title="Open Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onGoToLanding}
            className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px]"
            title={t.nav.backToLanding}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer" onClick={onGoToLanding} data-tut="cit-brand-header">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white shadow-md shadow-sky-500/20 border border-sky-400/40 shrink-0 p-0.5 transition-transform hover:scale-105">
              <img
                src="/images/surge-logo.png"
                alt="SURGE Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="sr-only">SURGE</h1>
            </div>
          </div>
        </div>

        {/* Right Side: City Dropdown & Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          
          {/* Guide Tutorial Launcher Button */}
          <button
            type="button"
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold transition-all active:scale-95"
            title="Launch Interactive Citizen Guide Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Guide Tutorial</span>
          </button>

          {/* City Selection Dropdown */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 mr-1 sm:mr-1.5 shrink-0" />
            <select
              value={selectedCityId}
              onChange={(e) => onSelectCity(e.target.value as CityId)}
              className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-0.5 text-xs"
            >
              <option value="mumbai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mumbai</option>
              <option value="delhi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delhi NCR</option>
              <option value="chennai" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chennai</option>
            </select>
          </div>

          {/* Language Switcher Dropdown */}
          {setLang && (
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mr-1.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle className="h-8" />
        </div>
      </header>

      {/* GPS Geo-Location Active Banner */}
      {userLocation && (
        <div className="bg-sky-700 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center space-x-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 animate-bounce" />
          <span>{gpsStatusText}</span>
        </div>
      )}

      {/* ── Mobile Hamburger Slide-Down Drawer (< lg breakpoint) ────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Drawer Panel */}
          <div
            className="relative mx-3 mt-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-2 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Items */}
            {citizenNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-tut={`cit-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all min-h-[48px] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/20 font-extrabold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-bold'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-sm block truncate">{item.label}</span>
                    <span className={`text-[10px] block truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>{item.description}</span>
                  </div>
                </button>
              );
            })}

            {/* Back to Home */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onGoToLanding();
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-bold transition-all mt-1 border-t border-slate-200 dark:border-slate-800 pt-3"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm">Back to Home</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile View Switcher (Panel vs GIS Map) — always visible on mobile ── */}
      <div className="lg:hidden px-2 sm:px-4 py-1.5 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl flex space-x-1 border border-slate-200 dark:border-slate-800 w-full max-w-sm mx-auto shadow-2xs">
          <button
            onClick={() => setMobileGisTab('panel')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all min-h-[38px] ${
              mobileGisTab === 'panel' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Control Panel</span>
          </button>
          <button
            onClick={() => setMobileGisTab('map')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all min-h-[38px] ${
              mobileGisTab === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Quick Navigation (section chips; the full menu stays in the hamburger) ── */}
      <nav
        className="lg:hidden shrink-0 flex gap-1.5 overflow-x-auto px-2 sm:px-4 py-1.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 custom-scrollbar"
        aria-label="Citizen portal sections"
      >
        {citizenNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                setActiveTab(item.id as any);
                setMobileGisTab('panel');
              }}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all min-h-[34px] border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Main Citizen Workspace: Laptop Sidebar + Split Resizable Layout ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Laptop Sidebar (Hidden on Mobile) */}
        <aside
          className={`hidden lg:flex h-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex-col justify-between transition-all duration-300 relative z-30 shrink-0 select-none ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Top Toggle Button */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2 overflow-hidden px-1">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 truncate">
                  Citizen Portal
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all ${
                isSidebarCollapsed ? 'mx-auto' : ''
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-3 space-y-1 px-2.5 overflow-y-auto custom-scrollbar">
            {!isSidebarCollapsed && (
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                Menu
              </p>
            )}
            {citizenNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-tut={`cit-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-700 dark:text-sky-300 font-bold ring-1 ring-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  } ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {isActive && !isSidebarCollapsed && (
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
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-sm font-bold truncate leading-tight block">{item.label}</span>
                      <p className="text-[11px] truncate leading-tight mt-0.5 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Back Button */}
          <div className="p-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onGoToLanding}
              className={`w-full flex items-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/40 transition-all ${
                isSidebarCollapsed ? 'justify-center' : 'space-x-2'
              }`}
              title={isSidebarCollapsed ? 'Back to Home Page' : undefined}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span className="text-xs font-bold">Home Page</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Workspace Split View */}
        <main className="flex-1 p-2 sm:p-4 max-w-[1900px] mx-auto w-full flex flex-col overflow-hidden">
          <div
            className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 w-full h-full min-h-0"
            style={{
              cursor: isResizing ? "col-resize" : "default",
              userSelect: isResizing ? "none" : "auto",
              "--left-width": `${leftPanelWidth}%`,
              "--right-width": `calc(${100 - leftPanelWidth}% - 1rem)`
            } as React.CSSProperties}
          >
            {/* ── LEFT ACTIVE TAB PANEL ───────────────── */}
            <div
              className={`${
                mobileGisTab === "panel" ? "flex w-full h-full" : "hidden"
              } lg:flex lg:w-[var(--left-width)] flex-col gap-4 overflow-y-auto custom-scrollbar h-full min-h-0 pr-1 shrink-0`}
            >
              {/* TAB 0: GIS MAP & LAYERS MANAGER */}
              {activeTab === 'gis' && (
                <CitizenGisLayersWidget
                  layerVisibility={layerVisibility}
                  setLayerVisibility={setLayerVisibility}
                  selectedCityId={selectedCityId}
                  timeOffsetMins={timeOffsetMins}
                />
              )}

              {/* TAB 1: VEHICLE-AWARE SAFE ROUTE PLANNER */}
              {activeTab === 'routing' && (
                <RoutingWidget
                  selectedCityId={selectedCityId}
                  timeOffsetMins={timeOffsetMins}
                  activeRoute={activeRoute}
                  setActiveRoute={setActiveRoute}
                  routePinMode={routePinMode}
                  setRoutePinMode={setRoutePinMode}
                  pinnedOrigin={pinnedOrigin}
                  pinnedDestination={pinnedDestination}
                />
              )}

              {/* TAB 2: LIVE FLOOD HAZARD ALERTS FEED */}
              {activeTab === 'alerts' && (
                <AlertFeed
                  selectedCityId={selectedCityId}
                  timeOffsetMins={timeOffsetMins}
                  onSelectFeature={(id) => {
                    setSelectedFeatureId(id);
                    setMobileGisTab('map');
                  }}
                />
              )}

              {/* TAB 3: CITIZEN GROUND WATERLOGGING REPORT FORM & COMMUNITY FEED */}
              {activeTab === 'report' && (
                <div className="ui-stack">
                  {/* Panel header */}
                  <section className="ui-card ui-head">
                    <div>
                      <p className="ui-eyebrow">Citizen Reports</p>
                      <h2 className="ui-title mt-0.5">{t.citizenApp.tabReport || 'Report Water logging'}</h2>
                      <p className="ui-subtitle mt-1.5">
                        Verified ground observations help everyone avoid flooded roads.
                      </p>
                    </div>
                    <div className="ui-segment" role="tablist" aria-label="Report sections">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={reportSubTab === 'submit'}
                        onClick={() => setReportSubTab('submit')}
                      >
                        <Camera />
                        <span>Submit Report</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={reportSubTab === 'community'}
                        onClick={() => setReportSubTab('community')}
                      >
                        <Users />
                        <span>Community</span>
                        <span className="ui-chip !px-1.5 ui-mono">{citizenReports.length}</span>
                      </button>
                    </div>
                  </section>

                  {/* SUBTAB 1: SUBMIT WATERLOGGING REPORT FORM */}
                  {reportSubTab === 'submit' && (
                    <>
                      {reportSuccessToast && (
                        <div className="ui-notice">
                          <CheckCircle2 />
                          <div>
                            <p className="font-extrabold">Ground Report Verified & Broadcasted!</p>
                            <p className="font-normal text-2xs mt-0.5">Your ground observation has been verified via OTP and added to public vector GIS layers.</p>
                          </div>
                        </div>
                      )}

                      {formValidationError && (
                        <div
                          className="ui-notice"
                          style={{
                            background: 'color-mix(in srgb, var(--color-status-severe) 12%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--color-status-severe) 35%, transparent)',
                            color: 'color-mix(in srgb, var(--color-status-severe) 75%, var(--text-primary))'
                          }}
                        >
                          <AlertTriangle />
                          <span>{formValidationError}</span>
                        </div>
                      )}

                      <form onSubmit={handleInitiateReportSubmit} className="flex flex-col gap-3">

                        {/* 1. Reporter identity */}
                        <section className="ui-card space-y-3">
                          <h3 className="ui-section-title">
                            <User />
                            <span>Your Details</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="ui-label" htmlFor="rep-name">Reporter Full Name *</label>
                              <input
                                id="rep-name"
                                type="text"
                                required
                                value={reporterName}
                                onChange={(e) => setReporterName(e.target.value)}
                                placeholder="e.g. Apurv Sharma"
                                className="ui-input"
                              />
                            </div>
                            <div>
                              <label className="ui-label" htmlFor="rep-mobile">Mobile Number (10-Digit) *</label>
                              <input
                                id="rep-mobile"
                                type="tel"
                                required
                                maxLength={10}
                                value={reporterMobile}
                                onChange={(e) => setReporterMobile(e.target.value.replace(/\D/g, ''))}
                                placeholder="e.g. 9876543210"
                                className="ui-input"
                              />
                            </div>
                          </div>
                        </section>

                        {/* 2. Live photo capture (camera only, no file upload) */}
                        <section className="ui-card space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="ui-section-title">
                              <Camera />
                              <span>Live Site Water Photo *</span>
                            </h3>
                            <span className="ui-chip ui-chip-warn shrink-0">Camera Only</span>
                          </div>
                          <p className="ui-section-sub !mt-0">Camera access only · No file upload allowed</p>

                          {/* Hidden canvas for video frame capture */}
                          <canvas ref={canvasRef} className="hidden" />

                          {isCameraActive && (
                            <div className="space-y-2">
                              <div className="relative overflow-hidden rounded-xl border-2 border-sky-500 bg-black aspect-video flex items-center justify-center shadow-lg">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-red-600/90 text-white font-mono font-bold text-2xs px-2 py-0.5 rounded-md flex items-center gap-1.5 animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                  LIVE CAMERA FEED ACTIVE
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button type="button" onClick={capturePhoto} className="ui-btn ui-btn-success flex-1 !min-h-[44px]">
                                  <Camera />
                                  <span>Capture Photo Snapshot</span>
                                </button>
                                <button type="button" onClick={stopCamera} className="ui-btn !min-h-[44px]">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {!isCameraActive && reportPhoto && (
                            <div className="space-y-2">
                              <div className="relative overflow-hidden rounded-xl border-2 border-emerald-500 shadow-md">
                                <img
                                  src={reportPhoto}
                                  alt="Live captured water sump"
                                  className="w-full max-h-56 object-cover rounded-lg"
                                />
                                <div className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-2xs px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  LIVE PHOTO CAPTURED
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setReportPhoto(null);
                                  startCamera();
                                }}
                                className="ui-btn w-full !min-h-[44px]"
                              >
                                <RotateCcw style={{ color: 'var(--color-selection-active)' }} />
                                <span>Retake Live Photo</span>
                              </button>
                            </div>
                          )}

                          {!isCameraActive && !reportPhoto && (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={startCamera}
                                className="w-full py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs font-extrabold transition-all min-h-[84px] group"
                                style={{
                                  background: 'color-mix(in srgb, var(--color-selection-active) 8%, transparent)',
                                  border: '2px dashed color-mix(in srgb, var(--color-selection-active) 50%, transparent)',
                                  color: 'var(--color-selection-active)'
                                }}
                              >
                                <span
                                  className="p-2 rounded-full group-hover:scale-110 transition-transform"
                                  style={{ background: 'color-mix(in srgb, var(--color-selection-active) 16%, transparent)' }}
                                >
                                  <Camera className="w-5 h-5" />
                                </span>
                                <span>Click Here to Access Live Camera & Click Photo</span>
                                <span className="text-2xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                  Requires browser webcam or smartphone camera permission
                                </span>
                              </button>

                              {cameraError && (
                                <p className="text-2xs font-bold text-center" style={{ color: 'var(--color-status-severe)' }}>
                                  {cameraError}
                                </p>
                              )}
                            </div>
                          )}
                        </section>

                        {/* 3. Location, depth and notes */}
                        <section className="ui-card space-y-3">
                          <div>
                            <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 mb-1">
                              <label className="ui-label !mb-0" htmlFor="rep-location">Ground Location / Landmark *</label>
                              <button
                                type="button"
                                onClick={handleAcquireGpsLocation}
                                className="text-2xs font-bold flex items-center gap-1 hover:underline"
                                style={{ color: 'var(--color-selection-active)' }}
                              >
                                <Crosshair className="w-3 h-3" />
                                <span>{t.citizenApp.useLiveGps}</span>
                              </button>
                            </div>
                            <input
                              id="rep-location"
                              type="text"
                              required
                              value={reportLocation}
                              onChange={(e) => setReportLocation(e.target.value)}
                              placeholder="e.g. Hindmata Junction, Dadar / SV Road Subway"
                              className="ui-input"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="ui-label !mb-0">{t.reportModal.depthLabel}</span>
                              <span className="ui-chip ui-chip-info ui-mono !text-xs">{reportDepthCm} cm</span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={120}
                              step={5}
                              value={reportDepthCm}
                              onChange={(e) => setReportDepthCm(parseInt(e.target.value, 10))}
                              className="w-full cursor-pointer accent-sky-500"
                              aria-label="Observed water depth in centimetres"
                            />
                            <div className="flex justify-between text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                              <span>5 cm</span>
                              <span>120 cm</span>
                            </div>
                          </div>

                          <div>
                            <label className="ui-label" htmlFor="rep-note">{t.reportModal.obsLabel}</label>
                            <textarea
                              id="rep-note"
                              rows={2}
                              value={reportNote}
                              onChange={(e) => setReportNote(e.target.value)}
                              placeholder={t.reportModal.obsPlaceholder}
                              className="ui-input"
                            />
                          </div>
                        </section>

                        {/* 4. Verify mobile & submit */}
                        <button
                          type="submit"
                          disabled={isSubmittingReport}
                          className="ui-btn ui-btn-primary w-full !min-h-[46px] !text-sm"
                        >
                          <ShieldCheck className="!w-4 !h-4" />
                          <span>Verify Mobile Number & Submit Ground Report</span>
                        </button>
                      </form>
                    </>
                  )}

                  {/* SUBTAB 2: COMMUNITY REPORTS LIST */}
                  {reportSubTab === 'community' && (
                    <section className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <span className="text-xs font-extrabold">
                          Live Ground Reports by Citizens ({citizenReports.length})
                        </span>
                        <span className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>Verified crowd observations</span>
                      </div>

                      {citizenReports.length === 0 ? (
                        <div className="ui-card flex flex-col items-center text-center gap-1.5 py-8">
                          <Users className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
                          <p className="text-sm font-extrabold">No Citizen Reports Yet</p>
                          <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>
                            Be the first to submit a ground waterlogging report in your area!
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {citizenReports.map((report) => (
                            <article key={report.id} className="ui-card ui-card-interactive space-y-2.5">
                              {/* Reporter + verification */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                                    style={{ background: 'color-mix(in srgb, var(--color-selection-active) 16%, transparent)', color: 'var(--color-selection-active)' }}
                                  >
                                    {(report.reporterName || report.userNote || 'C').charAt(0).toUpperCase()}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-xs font-extrabold block truncate">
                                      {report.reporterName || 'Citizen Volunteer'}
                                    </span>
                                    <span className="text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                                      {report.timestamp}
                                    </span>
                                  </div>
                                </div>

                                {report.verified ? (
                                  <span className="ui-chip ui-chip-ok shrink-0">
                                    <CheckCircle2 className="w-3 h-3" />
                                    OTP Verified
                                  </span>
                                ) : (
                                  <span className="ui-chip ui-chip-warn shrink-0">Citizen Report</span>
                                )}
                              </div>

                              {/* Location + depth */}
                              <div className="ui-card-muted !p-2.5 flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold min-w-0">
                                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--color-selection-active)' }} />
                                  <span className="truncate">{report.locationName}</span>
                                </span>
                                <span className={`ui-chip ui-mono shrink-0 !text-xs ${
                                  report.waterDepthCm >= 40
                                    ? 'ui-chip-danger'
                                    : report.waterDepthCm >= 20
                                    ? 'ui-chip-warn'
                                    : 'ui-chip-info'
                                }`}>
                                  {report.waterDepthCm} cm
                                </span>
                              </div>

                              {report.userNote && (
                                <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                                  "{report.userNote}"
                                </p>
                              )}

                              {report.photoUrl && (
                                <div className="overflow-hidden rounded-lg max-h-44" style={{ border: '1px solid var(--border)' }}>
                                  <img
                                    src={report.photoUrl}
                                    alt="Ground waterlogging evidence"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                <span className="text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
                                  ID: {report.id}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleUpvoteReport(report.id)}
                                  className={`ui-btn !px-2.5 !py-1 !min-h-0 ${upvotedReportIds.has(report.id) ? 'ui-btn-primary' : ''}`}
                                >
                                  <ThumbsUp />
                                  <span>Upvote ({report.upvotes + (upvotedReportIds.has(report.id) ? 1 : 0)})</span>
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              )}

              {/* TAB 4: INDIAN EMERGENCY TOLL-FREE HELPLINES */}
              {activeTab === 'emergency' && (
                <div className="ui-stack">
                  <section className="ui-card ui-head">
                    <div>
                      <p className="ui-eyebrow">Helplines</p>
                      <h2 className="ui-title mt-0.5 flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 shrink-0" style={{ color: 'var(--color-status-critical)' }} />
                        <span>{t.emergencyServices.title}</span>
                      </h2>
                      <p className="ui-subtitle mt-1.5">{t.emergencyServices.subTitle}</p>
                    </div>
                  </section>

                  <div className="flex flex-col gap-2.5">
                    {INDIAN_EMERGENCY_SERVICES.map((srv) => {
                      const title = (t.emergencyServices as any)[srv.titleKey] || srv.badgeText;
                      const desc = (t.emergencyServices as any)[srv.descKey] || '';

                      return (
                        <article key={srv.id} className="ui-card ui-card-interactive space-y-2.5 group">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-2xs font-extrabold uppercase border ${srv.badgeColor}`}>
                              {srv.badgeText}
                            </span>
                            <span className="ui-chip ui-chip-ok ui-mono shrink-0">
                              <Clock className="w-3 h-3" />
                              24x7 Active
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold leading-snug">{title}</h4>
                            <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {desc}
                            </p>
                          </div>

                          <a href={srv.telUri} className="ui-btn ui-btn-primary w-full !min-h-[42px] !text-sm">
                            <PhoneCall className="!w-4 !h-4" />
                            <span>{t.emergencyServices.callNow} {srv.number}</span>
                          </a>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Split Resizer */}
            <div
              onMouseDown={handleMouseDown}
              className="hidden lg:flex w-2 -mx-3 z-10 cursor-col-resize justify-center items-center group"
            >
              <div className="h-16 w-1 rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors" />
            </div>

            {/* ── RIGHT GIS MAP CANVAS & SCRUBBER ─────────── */}
            <div
              className={`${
                mobileGisTab === "map" ? "flex w-full h-full flex-1" : "hidden"
              } lg:flex lg:w-[var(--right-width)] flex-col gap-3 h-full min-h-0 relative shrink-0`}
            >
              <div className="flex-1 relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl min-h-[300px]">
                <OpenLayersMapCanvas
                  selectedCityId={selectedCityId}
                  timeOffsetMins={timeOffsetMins}
                  personaMode="citizen"
                  activeRoute={activeRoute}
                  citizenReports={citizenReports.filter(r => r.cityId === selectedCityId || !r.cityId)}
                  selectedFeatureId={selectedFeatureId}
                  setSelectedFeatureId={setSelectedFeatureId}
                  routePinMode={routePinMode}
                  setRoutePinMode={setRoutePinMode}
                  pinnedOrigin={pinnedOrigin}
                  pinnedDestination={pinnedDestination}
                  onLocationPicked={handleLocationPicked}
                  layerVisibility={layerVisibility}
                  setLayerVisibility={setLayerVisibility}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        selectedCityId={selectedCityId}
        timeOffsetMins={timeOffsetMins}
        onSelectFeature={(id) => {
          setSelectedFeatureId(id);
          setMobileGisTab('map');
        }}
      />

      {/* OTP Mobile Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-bold">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Verify Mobile OTP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Enter 4-digit OTP sent to <span className="font-bold font-mono text-sky-600 dark:text-sky-400">+91 {reporterMobile}</span> for reporter <span className="font-bold">{reporterName}</span>.
              </p>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-center font-bold text-xs">
                Demo SMS OTP Code: <span className="bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded tracking-widest text-sm text-amber-900 dark:text-amber-100">{generatedOtp}</span>
              </div>

              {otpError && (
                <p className="text-red-600 dark:text-red-400 font-bold text-[11px]">
                  {otpError}
                </p>
              )}

              <div className="space-y-1 pt-1">
                <label className="block text-slate-700 dark:text-slate-300 font-bold">
                  Enter 4-Digit Code:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-black text-center text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifyingOtp}
                onClick={handleVerifyOtpAndSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>{isVerifyingOtp ? 'Verifying...' : 'Verify & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Citizen Interactive Walkthrough Tutorial Overlay */}
      <SurgeAppTutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          setIsMobileMenuOpen(false);
        }}
        mode="citizen"
        onStepNavigate={(dataTut) => {
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
          if (dataTut.startsWith('cit-nav-')) {
            const tabId = dataTut.replace('cit-nav-', '') as 'gis' | 'routing' | 'alerts' | 'report' | 'emergency';
            setActiveTab(tabId);
            if (isMobile) {
              setIsMobileMenuOpen(true);
              setMobileGisTab('panel');
            }
          } else if (dataTut === 'cit-brand-header') {
            if (isMobile) {
              setIsMobileMenuOpen(false);
            }
          }
        }}
      />
    </div>
  );
};
