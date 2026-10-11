'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  LifeBuoy,
  Footprints,
  Car,
  Truck,
  Siren,
  Bike,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  ArrowRight,
  Home,
  CheckCircle2,
  PhoneCall,
  Download,
  Navigation
} from 'lucide-react';
import { CityId, CITIES, NavigationRoute } from '@/lib/mock-data';
import { EvacuationPlan, generateEvacuationPlanForZone } from '@/lib/evacuation-service';
import { VehicleType, VEHICLE_PROFILES, calculateFloodSafeRoutes } from '@/lib/routing-engine';
import { useLanguage } from '@/context/LanguageContext';

interface EvacuationPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCityId: CityId;
  timeOffsetMins: number;
  evacuationPlan: EvacuationPlan | null;
  onDeployMapRoute: (route: NavigationRoute) => void;
}

export const EvacuationPlanModal: React.FC<EvacuationPlanModalProps> = ({
  isOpen,
  onClose,
  selectedCityId,
  timeOffsetMins,
  evacuationPlan: initialPlan,
  onDeployMapRoute
}) => {
  const { t } = useLanguage();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('pedestrian');
  const [activePlan, setActivePlan] = useState<EvacuationPlan | null>(initialPlan);

  useEffect(() => {
    setActivePlan(initialPlan);
  }, [initialPlan]);

  if (!isOpen || !activePlan) return null;

  const currentCity = CITIES[selectedCityId];
  const vehicleProfile = VEHICLE_PROFILES[selectedVehicle];

  // Dynamically calculate dynamic safe route for the chosen vehicle using exact coordinates
  const dynamicRouteResult = calculateFloodSafeRoutes(
    `${activePlan.zone.centroid[0]}, ${activePlan.zone.centroid[1]}`,
    `${activePlan.nearestShelter.coordinates[0]}, ${activePlan.nearestShelter.coordinates[1]}`,
    selectedVehicle,
    timeOffsetMins,
    selectedCityId
  );

  const activeRoute = dynamicRouteResult.safeRoute;

  const vehicleOptions: { type: VehicleType; label: string; icon: React.ReactNode }[] = [
    { type: 'pedestrian', label: t.routing.pedestrian, icon: <Footprints className="w-4 h-4" /> },
    { type: 'auto', label: t.routing.autoBike, icon: <Bike className="w-4 h-4" /> },
    { type: 'sedan', label: t.routing.carSedan, icon: <Car className="w-4 h-4" /> },
    { type: 'hatchback', label: t.routing.hatchback, icon: <Car className="w-4 h-4" /> },
    { type: 'suv', label: t.routing.suv, icon: <Truck className="w-4 h-4" /> },
    { type: 'bus', label: t.routing.bus, icon: <Truck className="w-4 h-4" /> },
    { type: 'ambulance', label: t.routing.ambulance, icon: <Siren className="w-4 h-4" /> },
  ];

  const handleDeployOnMap = () => {
    onDeployMapRoute(activeRoute);
    onClose();
  };

  const handleDownloadText = () => {
    const textContent = `
=== AQUAALERT EMERGENCY EVACUATION BRIEFING ===
City: ${currentCity.name}
Hazard Zone: ${activePlan.zone.name} (${activePlan.zone.waterDepthCm}cm Depth)
Vehicle Profile: ${vehicleProfile.name} (Max Safe Clearance: ${vehicleProfile.maxSafeDepthCm}cm)

DESTINATION ASSEMBLY SHELTER:
Name: ${activePlan.nearestShelter.name}
Address: ${activePlan.nearestShelter.address}
Elevation Gain: +${activePlan.elevationGainMeters}m MSL
Emergency Contact: ${activePlan.nearestShelter.contactEmergency}

STEP-BY-STEP EVACUATION PLAN:
1. ${t.evacuationModal.step1Title}: Check vehicle clearance limit (${vehicleProfile.maxSafeDepthCm}cm) against local zone water depth (${activePlan.zone.waterDepthCm}cm).
2. ${t.evacuationModal.step2Title}: Avoid submerged low-lying depressions and railway underpasses.
3. ${t.evacuationModal.step3Title}: Transit via ${activeRoute.distanceKm} km safe route (Est. Transit: ${activeRoute.durationMins} mins, Max Water: ${activeRoute.maxWaterDepthCm}cm).
4. ${t.evacuationModal.step4Title}: Report to Municipal Control Desk upon arrival at ${activePlan.nearestShelter.name}.
===============================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaAlert_Evacuation_Plan_${selectedCityId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900 font-sans">
        {/* Modal Header */}
        <div className="bg-gray-950 text-white p-5 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  {t.evacuationModal.title}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  {activePlan.zone.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {t.evacuationModal.subTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Vehicle Profile Selection Tabs */}
          <div className="space-y-2">
            <span className="font-bold text-gray-700 text-xs uppercase tracking-wider block">
              {t.evacuationModal.selectVehicle}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
              {vehicleOptions.map((v) => {
                const isSelected = selectedVehicle === v.type;
                return (
                  <button
                    key={v.type}
                    onClick={() => setSelectedVehicle(v.type)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold ring-2 ring-blue-500/30'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    {v.icon}
                    <span className="text-[10px] mt-1.5 truncate max-w-full">{v.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/80 font-mono">
              <span>Mode: <strong className="text-gray-800">{vehicleProfile.name}</strong></span>
              <span className="text-blue-700 font-bold">Max Safe Clearance: {vehicleProfile.maxSafeDepthCm}cm</span>
            </div>
          </div>

          {/* Active Hazard & Assembly Shelter KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Hazard Zone Card */}
            <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 text-orange-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  {t.evacuationModal.hazardZone}
                </span>
                <span className="text-xs font-mono font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                  {activePlan.zone.waterDepthCm} cm Inundation
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-orange-900">{activePlan.zone.name}</h4>
              <p className="text-[11px] text-orange-800 leading-relaxed font-medium">{activePlan.zone.description}</p>
              <div className="text-[10.5px] font-mono text-orange-700 pt-1 border-t border-orange-200">
                Population at risk: <strong>{activePlan.zone.evacueePopulation.toLocaleString()} residents</strong>
              </div>
            </div>

            {/* Target Refuge Assembly Shelter Card */}
            <div className="p-4 rounded-2xl bg-green-50/80 border border-green-300 text-green-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-green-600" />
                  {t.evacuationModal.shelterHeading}
                </span>
                <span className="text-xs font-mono font-bold text-green-900 bg-green-200/80 px-2 py-0.5 rounded-md">
                  +{activePlan.elevationGainMeters}m Elevation
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-green-900">{activePlan.nearestShelter.name}</h4>
              <p className="text-[11px] text-green-800 font-medium">{activePlan.nearestShelter.address}</p>
              <div className="flex items-center justify-between text-[10.5px] font-mono text-green-800 pt-1 border-t border-green-200">
                <span>Facilities: {(activePlan.nearestShelter.facilities || []).slice(0, 2).join(', ')}</span>
                <span className="font-bold flex items-center gap-1 text-green-900">
                  <PhoneCall className="w-3 h-3" />
                  {activePlan.nearestShelter.contactEmergency}
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Evacuation Guidance List */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>{t.evacuationModal.stepByStepHeading}</span>
            </h4>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between font-bold text-gray-900 text-xs">
                  <span className="text-blue-700">{t.evacuationModal.step1Title}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">Immediate</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Confirm vehicle clearance threshold ({vehicleProfile.maxSafeDepthCm}cm) against local zone depth ({activePlan.zone.waterDepthCm}cm).
                  {activePlan.zone.waterDepthCm > vehicleProfile.maxSafeDepthCm && (
                    <span className="text-orange-600 font-bold block mt-1">
                      Zone flood depth exceeds {vehicleProfile.name} clearance limit. Switching to foot/walking high-ground route is recommended!
                    </span>
                  )}
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between font-bold text-gray-900 text-xs">
                  <span className="text-blue-700">{t.evacuationModal.step2Title}</span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-mono">Avoid Subways</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Do not attempt to cross submerged railway underpasses or low elevation galli catchpits. Follow elevated flyover corridors toward Dadar / Sion / Guindy uplands.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-gray-900 text-xs">
                  <span className="text-blue-900">{t.evacuationModal.step3Title}</span>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                    {activeRoute.distanceKm} km • {activeRoute.durationMins} mins
                  </span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  Calculated Transit Path: Proceed via <strong>{activeRoute.name}</strong>. Max water depth along safe route: <strong>{activeRoute.maxWaterDepthCm} cm</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
                <div className="flex items-center justify-between font-bold text-gray-900 text-xs">
                  <span className="text-blue-700">{t.evacuationModal.step4Title}</span>
                  <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-mono font-bold">Refuge Check-In</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Upon arrival at <strong>{activePlan.nearestShelter.name}</strong>, check in at the Municipal Disaster Relief Counter to receive medical triage, potable drinking water, and emergency food rations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleDownloadText}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200 flex items-center space-x-1.5 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Plan Text</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs transition-all"
            >
              {t.evacuationModal.closeBtn}
            </button>
            <button
              onClick={handleDeployOnMap}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.evacuationModal.deployMapBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
