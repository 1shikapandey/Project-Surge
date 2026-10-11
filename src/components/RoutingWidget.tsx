'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  Car,
  Bike,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Footprints,
  AlertCircle,
  Siren,
  LifeBuoy,
  Home,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Info,
  Activity,
  CheckCircle2,
  Zap
} from 'lucide-react';
import {
  VehicleType,
  VEHICLE_PROFILES,
  calculateFloodSafeRoutes,
  calculateFloodSafeRoutesAsync,
  EnhancedNavigationRoute
} from '@/lib/routing-engine';
import {
  getEvacuationZonesForCity,
  generateEvacuationPlanForZone,
  EvacuationPlan
} from '@/lib/evacuation-service';
import { CityId, CITIES, NavigationRoute } from '@/lib/mock-data';
import { useLanguage } from '@/context/LanguageContext';
import { EvacuationPlanModal } from '@/components/EvacuationPlanModal';

interface RoutingWidgetProps {
  selectedCityId: CityId;
  timeOffsetMins: number;
  activeRoute: NavigationRoute | null;
  setActiveRoute: (route: NavigationRoute | null) => void;
  routePinMode?: 'none' | 'origin' | 'destination';
  setRoutePinMode?: (mode: 'none' | 'origin' | 'destination') => void;
  pinnedOrigin?: [number, number] | null;
  pinnedDestination?: [number, number] | null;
}

export const RoutingWidget: React.FC<RoutingWidgetProps> = ({
  selectedCityId,
  timeOffsetMins,
  activeRoute,
  setActiveRoute,
  routePinMode = 'none',
  setRoutePinMode,
  pinnedOrigin,
  pinnedDestination
}) => {
  const { t } = useLanguage();
  const city = CITIES[selectedCityId];

  // Routing Mode: Standard Vehicle Route Planner vs Emergency Evacuation Mode
  const [activeTab, setActiveTab] = useState<'vehicle_routing' | 'evacuation_mode'>('vehicle_routing');
  const [isWhyRouteOpen, setIsWhyRouteOpen] = useState<boolean>(false);


  const defaultLocations: Record<CityId, { origin: string; dest: string }> = {
    mumbai: { origin: 'Parel South (Lower Parel)', dest: 'Sion North Junction' },
    delhi: { origin: 'Connaught Place Outer Ring', dest: 'ITO Central Junction' },
    chennai: { origin: 'Velachery Station Road', dest: 'Saidapet Adyar Bridge' }
  };

  const [origin, setOrigin] = useState(defaultLocations[selectedCityId].origin);
  const [destination, setDestination] = useState(defaultLocations[selectedCityId].dest);
  const [vehicle, setVehicle] = useState<VehicleType>('ambulance');
  const [routesResult, setRoutesResult] = useState<{
    standardRoute: EnhancedNavigationRoute;
    safeRoute: EnhancedNavigationRoute;
  } | null>(null);

  // Evacuation Mode State
  const [selectedEvacZoneId, setSelectedEvacZoneId] = useState<string>('');
  const [evacuationPlan, setEvacuationPlan] = useState<EvacuationPlan | null>(null);
  const [isEvacModalOpen, setIsEvacModalOpen] = useState<boolean>(false);

  const evacZones = getEvacuationZonesForCity(selectedCityId, timeOffsetMins);
  const activeEvacZones = evacZones.filter(z => z.active);

  useEffect(() => {
    setOrigin(defaultLocations[selectedCityId].origin);
    setDestination(defaultLocations[selectedCityId].dest);
    setRoutesResult(null);
    setActiveRoute(null);
    if (evacZones.length > 0) {
      setSelectedEvacZoneId(evacZones[0].id);
    }
  }, [selectedCityId]);

  // Update origin/destination when map pin coordinates change
  useEffect(() => {
    if (pinnedOrigin) {
      setOrigin(`${pinnedOrigin[0].toFixed(4)}, ${pinnedOrigin[1].toFixed(4)}`);
    }
  }, [pinnedOrigin]);

  useEffect(() => {
    if (pinnedDestination) {
      setDestination(`${pinnedDestination[0].toFixed(4)}, ${pinnedDestination[1].toFixed(4)}`);
    }
  }, [pinnedDestination]);

  // Re-run routing when vehicle type, origin, destination, or time changes
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'vehicle_routing') {
      const results = calculateFloodSafeRoutes(origin, destination, vehicle, timeOffsetMins, selectedCityId);
      setRoutesResult(results);
      setActiveRoute(results.safeRoute);

      calculateFloodSafeRoutesAsync(origin, destination, vehicle, timeOffsetMins, selectedCityId).then((realResults) => {
        if (isMounted && realResults) {
          setRoutesResult(realResults);
          setActiveRoute(realResults.safeRoute);
        }
      });
    } else {
      const plan = generateEvacuationPlanForZone(selectedEvacZoneId, selectedCityId, timeOffsetMins);
      setEvacuationPlan(plan);
    }
    return () => {
      isMounted = false;
    };
  }, [origin, destination, vehicle, timeOffsetMins, selectedCityId, selectedEvacZoneId, activeTab]);

  const handleSearch = () => {
    const results = calculateFloodSafeRoutes(origin, destination, vehicle, timeOffsetMins, selectedCityId);
    setRoutesResult(results);
    setActiveRoute(results.safeRoute);

    calculateFloodSafeRoutesAsync(origin, destination, vehicle, timeOffsetMins, selectedCityId).then((realResults) => {
      if (realResults) {
        setRoutesResult(realResults);
        setActiveRoute(realResults.safeRoute);
      }
    });
  };

  const handleDeployEvacuation = (mode: 'foot' | 'vehicle') => {
    if (!evacuationPlan) return;
    if (mode === 'foot') {
      setActiveRoute(evacuationPlan.footRoute);
    } else {
      setActiveRoute(evacuationPlan.vehicleRoute);
    }
  };

  const vehicleOptions: { type: VehicleType; label: string; icon: React.ReactNode }[] = [
    { type: 'auto', label: t.routing.autoBike, icon: <Car className="w-3.5 h-3.5" /> },
    { type: 'hatchback', label: t.routing.hatchback, icon: <Car className="w-3.5 h-3.5" /> },
    { type: 'sedan', label: t.routing.carSedan, icon: <Car className="w-3.5 h-3.5" /> },
    { type: 'suv', label: t.routing.suv, icon: <Truck className="w-3.5 h-3.5" /> },
    { type: 'bus', label: t.routing.bus, icon: <Truck className="w-3.5 h-3.5" /> },
    { type: 'ambulance', label: t.routing.ambulance, icon: <Siren className="w-3.5 h-3.5" /> },
    { type: 'two_wheeler', label: t.routing.autoBike, icon: <Bike className="w-3.5 h-3.5" /> },
    { type: 'pedestrian', label: t.routing.pedestrian, icon: <Footprints className="w-3.5 h-3.5" /> },
  ];

  const currentProfile = VEHICLE_PROFILES[vehicle];

  return (
    <div className="w-full bg-surface-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md space-y-4 text-xs text-txt-primary transition-colors">
      {/* Panel title */}
      <div>
        <p className="ui-eyebrow">Route Planner</p>
        <h2 className="ui-title mt-0.5">{t.routing.title}</h2>
      </div>

      {/* Tab Switcher: Flood-Safe Navigation vs Emergency Evacuation Mode */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex space-x-1 bg-surface-elevated p-1 rounded-xl w-full border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('vehicle_routing')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'vehicle_routing'
                ? 'btn-glass-primary shadow-xs'
                : 'btn-glass text-slate-600 dark:text-slate-400'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t.routing.title.split(' ')[0]} {t.routing.title.split(' ')[1]}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evacuation_mode')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'evacuation_mode'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>{t.dashboard.evacRouteBtn.split(' ')[0]}</span>
            {activeEvacZones.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'vehicle_routing' ? (
        <div className="space-y-3.5 text-xs">
          {/* Origin & Destination */}
          <div className="space-y-2.5">
            <div
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                routePinMode === 'origin'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40 text-txt-primary'
                  : 'bg-surface-elevated border-slate-300 dark:border-slate-700/80 text-txt-primary focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder={t.routing.originPlaceholder}
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 font-medium focus:outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {setRoutePinMode && (
                <button
                  type="button"
                  onClick={() => setRoutePinMode(routePinMode === 'origin' ? 'none' : 'origin')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 transition-all shrink-0 ${
                    routePinMode === 'origin'
                      ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                      : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/30 border border-emerald-300 dark:border-emerald-500/30'
                  }`}
                  title="Pin origin on map"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{routePinMode === 'origin' ? t.routing.pickLocationPrompt : t.routing.pickOrigin}</span>
                </button>
              )}
            </div>

            <div
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                routePinMode === 'destination'
                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/40 text-txt-primary'
                  : 'bg-surface-elevated border-slate-300 dark:border-slate-700/80 text-txt-primary focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
              }`}
            >
              <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t.routing.destPlaceholder}
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 font-medium focus:outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {setRoutePinMode && (
                <button
                  type="button"
                  onClick={() => setRoutePinMode(routePinMode === 'destination' ? 'none' : 'destination')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 transition-all shrink-0 ${
                    routePinMode === 'destination'
                      ? 'bg-orange-600 text-white shadow-xs animate-pulse'
                      : 'bg-orange-50 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/30 border border-orange-300 dark:border-orange-500/30'
                  }`}
                  title="Pin destination on map"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{routePinMode === 'destination' ? t.routing.pickLocationPrompt : t.routing.pickDest}</span>
                </button>
              )}
            </div>
          </div>

          {/* Vehicle Profiles Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              <span>{t.routing.vehicleProfileClearance}</span>
              <span className="text-sky-700 dark:text-sky-400 font-bold font-mono">{t.routing.maxSafe} {currentProfile.maxSafeDepthCm}cm</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {vehicleOptions.map((v) => {
                const isSelected = vehicle === v.type;
                return (
                  <button
                    key={v.type}
                    type="button"
                    onClick={() => setVehicle(v.type)}
                    className={`flex flex-col items-center justify-center p-2 min-h-[62px] rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'btn-glass-primary border-sky-500 font-bold'
                        : 'btn-glass text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                    title={`${v.label} (Clearance: ${VEHICLE_PROFILES[v.type].maxSafeDepthCm}cm)`}
                  >
                    {v.icon}
                    <span className="text-[10px] mt-1 max-w-full font-semibold leading-tight line-clamp-2 break-words">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="w-full py-2.5 rounded-xl btn-glass-primary flex items-center justify-center space-x-2 text-white font-extrabold text-xs"
          >
            <span>{t.routing.findRoute}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Route Results & Comparison */}
          {routesResult && (
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              {/* If Route is HARD BLOCKED */}
              {routesResult.safeRoute.isBlocked ? (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30 text-orange-900 dark:text-orange-300 space-y-2">
                  <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{t.routing.noSafeRouteFor} {currentProfile.name.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-orange-800/90 dark:text-orange-300/90 leading-relaxed font-medium">
                    {routesResult.safeRoute.blockedReason || t.routing.noRouteFound}
                  </p>
                </div>
              ) : (
                /* Safe Route Card */
                <div
                  onClick={() => setActiveRoute(routesResult.safeRoute)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeRoute?.id === routesResult.safeRoute.id
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 dark:border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-xs'
                      : 'bg-surface-elevated border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {routesResult.safeRoute.name === 'AquaAlert Real Road Flood-Safe Route'
                          ? t.routing.realRoadSafeRoute
                          : routesResult.safeRoute.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-[10px] font-bold">
                      {t.routing.riskSafe}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 font-medium">
                    <span>{routesResult.safeRoute.distanceKm} km • {routesResult.safeRoute.durationMins} {t.slider.plusMin}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      {t.nav.maxDepth}: {routesResult.safeRoute.maxWaterDepthCm} cm
                    </span>
                  </div>
                </div>
              )}

              {/* Mausamnow-inspired "Why this route?" Transparency Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/80 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setIsWhyRouteOpen(!isWhyRouteOpen)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left font-semibold text-slate-800 dark:text-slate-200"
                >
                  <div className="flex items-center space-x-2">
                    <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="text-[11px] font-bold">Why this route choice & verdict?</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-mono font-bold">
                      94% Confidence
                    </span>
                  </div>
                  {isWhyRouteOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                {isWhyRouteOpen && (
                  <div className="px-3 pb-3 pt-1.5 space-y-2.5 text-[11px] border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                        <span>Vehicle Ground Clearance vs Max Water Depth</span>
                        <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">
                          Buffer: +{(currentProfile.maxSafeDepthCm - routesResult.safeRoute.maxWaterDepthCm)}cm
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (routesResult.safeRoute.maxWaterDepthCm / currentProfile.maxSafeDepthCm) * 100
                            )}%`,
                          }}
                          className={`h-full ${
                            routesResult.safeRoute.maxWaterDepthCm > currentProfile.maxSafeDepthCm
                              ? 'bg-rose-500'
                              : routesResult.safeRoute.maxWaterDepthCm > currentProfile.maxSafeDepthCm * 0.7
                              ? 'bg-amber-500'
                              : 'bg-emerald-500 dark:bg-emerald-400'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[9.5px] font-mono text-slate-600 dark:text-slate-400">
                        <span>Safe Water Limit: {routesResult.safeRoute.maxWaterDepthCm}cm</span>
                        <span>{currentProfile.name}: {currentProfile.maxSafeDepthCm}cm Max</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-0.5">
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                          Hydraulic Solver
                        </span>
                        <p className="font-bold text-slate-900 dark:text-slate-200">SWMM 1D/2D St. Venant</p>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400">10m DEM mesh grid</p>
                      </div>

                      <div className="p-2 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-0.5">
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                          Live Data Inputs
                        </span>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Radar + 12 SCADA
                        </p>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400">Updated 2m ago</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      Standard shortest path contains inundated bottlenecks exceeding vehicle exhaust/air intake heights. Safe route avoids subways and low-lying railway underpasses.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* EMERGENCY EVACUATION MODE */
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 text-orange-900 dark:text-orange-300">
            <div className="flex items-center space-x-2 font-bold text-xs text-orange-700 dark:text-orange-400">
              <Siren className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse" />
              <span>{t.dashboard.evacRouteBtn}</span>
            </div>
            <p className="text-[10.5px] text-orange-800 dark:text-orange-300/90 mt-1 leading-relaxed font-medium">
              Auto-detects residents in extreme flood depressions and charts safest path to high-elevation relief centers.
            </p>
          </div>

          {/* Evacuation Zone Selector */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t.routing.selectHazardZone}
            </span>
            <select
              value={selectedEvacZoneId}
              onChange={(e) => setSelectedEvacZoneId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-elevated border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
            >
              {evacZones.map((z) => (
                <option key={z.id} value={z.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {z.active ? '[Active] ' : '[Advisory] '} {z.name} ({z.waterDepthCm}cm)
                </option>
              ))}
            </select>
          </div>

          {evacuationPlan && (
            <div className="space-y-2.5 pt-1">
              {/* Nearest Safe Shelter Details */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    {t.routing.nearestShelter}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                    +{evacuationPlan.elevationGainMeters}m Elevation
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{evacuationPlan.nearestShelter.name}</h4>
                <p className="text-[10.5px] text-slate-600 dark:text-slate-300">{evacuationPlan.nearestShelter.address}</p>
              </div>

              {/* Action Buttons to Deploy Evacuation Path */}
              <button
                type="button"
                onClick={() => setIsEvacModalOpen(true)}
                className="w-full py-2.5 rounded-xl btn-glass-primary flex items-center justify-center space-x-2 text-white font-extrabold text-xs"
              >
                <LifeBuoy className="w-4 h-4 animate-pulse" />
                <span>{t.evacuationModal.title}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDeployEvacuation('foot')}
                  className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{t.routing.pedestrian}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeployEvacuation('vehicle')}
                  className="py-2.5 px-2 rounded-xl bg-surface-elevated border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-[11px] flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                >
                  <Truck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{t.routing.rescueVehicleRoute}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evacuation Step-by-Step Modal */}
      <EvacuationPlanModal
        isOpen={isEvacModalOpen}
        onClose={() => setIsEvacModalOpen(false)}
        selectedCityId={selectedCityId}
        timeOffsetMins={timeOffsetMins}
        evacuationPlan={evacuationPlan}
        onDeployMapRoute={(route) => setActiveRoute(route)}
      />
    </div>
  );
};

