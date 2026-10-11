'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { Style, Stroke, Fill, Circle as CircleStyle, Text, Icon } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { createEmpty, extend } from 'ol/extent';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import { CityId, CITIES, CitizenReport, NavigationRoute, getCityDataset } from '@/lib/mock-data';
import { getDemSurfaceGrid, getDemContours, getElevationAtCoordinate, DEM_LEGEND } from '@/lib/dem-service';
import { getRealWaterwaysDataset } from '@/lib/real-waterways-service';
import { getPumpingStationsForCity } from '@/lib/pumping-station-service';
import { getPhysicsDerivedManholes, PhysicsManhole } from '@/lib/physics-manhole-engine';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';
import { getEvacuationZonesForCity, SAFE_ASSEMBLY_SHELTERS } from '@/lib/evacuation-service';
import { EnhancedNavigationRoute, RouteRiskSegment } from '@/lib/routing-engine';
import { getGroundwaterColor } from '@/lib/groundwater-service';
import { getCitizenSignals, CitizenSignal, ISSUE_TYPE_CONFIG } from '@/lib/citizen-signals-service';
import { fetchLiveWindCloudData, getWindBandColor, WindCloudData } from '@/lib/wind-cloud-service';
import { fetchLiveImperviousnessData, ImperviousnessTelemetry } from '@/lib/imperviousness-service';
import { PrecipitationSourceBadge, PrecipitationSourceInfo } from '@/components/PrecipitationSourceBadge';
import {
  Layers,
  Compass,
  Mountain,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Waves,
  Activity,
  Route,
  MapPin,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Home,
  Wind,
  Cloud,
  CloudRain,
  Sun
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface HistoricalImpactMarker {
  hotspotName: string;
  boroughOrZone: string;
  recordedDepthRangeCm: [number, number];
  impactDescription: string;
  lat: number;
  lng: number;
}

interface OpenLayersMapCanvasProps {
  selectedCityId: CityId;
  timeOffsetMins: number;
  personaMode: 'citizen' | 'authority';
  activeRoute: NavigationRoute | null;
  citizenReports: CitizenReport[];
  selectedFeatureId: string | null;
  setSelectedFeatureId: (id: string | null) => void;
  routePinMode?: 'none' | 'origin' | 'destination';
  setRoutePinMode?: (mode: 'none' | 'origin' | 'destination') => void;
  pinnedOrigin?: [number, number] | null;
  pinnedDestination?: [number, number] | null;
  onLocationPicked?: (mode: 'origin' | 'destination', coords: [number, number]) => void;
  historicalImpactMarkers?: HistoricalImpactMarker[];
  hydraulicSnapshotOverride?: import("@/lib/hydraulic-engine").NowcastTimeStep;
  activeTab?: string;
  layerVisibility?: import('@/components/CitizenGisLayersWidget').MapLayerVisibility;
  setLayerVisibility?: React.Dispatch<React.SetStateAction<import('@/components/CitizenGisLayersWidget').MapLayerVisibility>>;
}

export const OpenLayersMapCanvas: React.FC<OpenLayersMapCanvasProps> = ({
  selectedCityId,
  timeOffsetMins,
  personaMode,
  activeRoute,
  citizenReports,
  selectedFeatureId,
  setSelectedFeatureId,
  routePinMode = 'none',
  setRoutePinMode,
  pinnedOrigin,
  pinnedDestination,
  onLocationPicked,
  historicalImpactMarkers,
  hydraulicSnapshotOverride,
  activeTab = 'nowcast_gis',
  layerVisibility,
  setLayerVisibility
}) => {
  const { t } = useLanguage();
  const mapElementRef = useRef<HTMLDivElement>(null);
  const popupElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  const routePinModeRef = useRef(routePinMode);
  const onLocationPickedRef = useRef(onLocationPicked);
  const setRoutePinModeRef = useRef(setRoutePinMode);

  useEffect(() => {
    routePinModeRef.current = routePinMode;
  }, [routePinMode]);

  useEffect(() => {
    onLocationPickedRef.current = onLocationPicked;
  }, [onLocationPicked]);

  useEffect(() => {
    setRoutePinModeRef.current = setRoutePinMode;
  }, [setRoutePinMode]);

  // Internal Layer Toggle States fallback (when layerVisibility prop is not passed)
  const [internalBaseLayerType, setInternalBaseLayerType] = useState<'osm' | 'topo' | 'hot' | 'satellite'>('osm');
  const [internalShowDemLayer, setInternalShowDemLayer] = useState(personaMode !== 'citizen');
  const [internalShowWindCloudLayer, setInternalShowWindCloudLayer] = useState(personaMode !== 'citizen');
  const [internalShowRoadsLayer, setInternalShowRoadsLayer] = useState(true);
  const [internalShowRouteLayer, setInternalShowRouteLayer] = useState(true);
  const [internalShowDrainageLayer, setInternalShowDrainageLayer] = useState(false);
  const [internalShowManholesLayer, setInternalShowManholesLayer] = useState(personaMode !== 'citizen');
  const [internalShowEvacuationLayer, setInternalShowEvacuationLayer] = useState(false);
  const [internalShowReportsLayer, setInternalShowReportsLayer] = useState(personaMode !== 'citizen');
  const [internalShowHotspotsLayer, setInternalShowHotspotsLayer] = useState(personaMode !== 'citizen');
  const [internalShowDeluge2005Layer, setInternalShowDeluge2005Layer] = useState(false);
  const [internalShowGroundwaterLayer, setInternalShowGroundwaterLayer] = useState(false);
  const [internalShowSignalsLayer, setInternalShowSignalsLayer] = useState(personaMode !== 'citizen');
  const [internalShowImperviousnessLayer, setInternalShowImperviousnessLayer] = useState(false);

  // Controlled or Uncontrolled layer values
  const baseLayerType = layerVisibility ? layerVisibility.baseLayerType : internalBaseLayerType;
  const setBaseLayerType = (val: 'osm' | 'topo' | 'hot' | 'satellite') => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, baseLayerType: val }));
    else setInternalBaseLayerType(val);
  };

  const showDemLayer = layerVisibility ? layerVisibility.showDemLayer : internalShowDemLayer;
  const setShowDemLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showDemLayer: val }));
    else setInternalShowDemLayer(val);
  };

  const showWindCloudLayer = layerVisibility ? layerVisibility.showWindCloudLayer : internalShowWindCloudLayer;
  const setShowWindCloudLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showWindCloudLayer: val }));
    else setInternalShowWindCloudLayer(val);
  };

  const showRoadsLayer = layerVisibility ? layerVisibility.showRoadsLayer : internalShowRoadsLayer;
  const setShowRoadsLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showRoadsLayer: val }));
    else setInternalShowRoadsLayer(val);
  };

  const showRouteLayer = layerVisibility ? layerVisibility.showRouteLayer : internalShowRouteLayer;
  const setShowRouteLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showRouteLayer: val }));
    else setInternalShowRouteLayer(val);
  };

  const showDrainageLayer = layerVisibility ? layerVisibility.showDrainageLayer : internalShowDrainageLayer;
  const setShowDrainageLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showDrainageLayer: val }));
    else setInternalShowDrainageLayer(val);
  };

  const showManholesLayer = layerVisibility ? layerVisibility.showManholesLayer : internalShowManholesLayer;
  const setShowManholesLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showManholesLayer: val }));
    else setInternalShowManholesLayer(val);
  };

  const showEvacuationLayer = layerVisibility ? layerVisibility.showEvacuationLayer : internalShowEvacuationLayer;
  const setShowEvacuationLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showEvacuationLayer: val }));
    else setInternalShowEvacuationLayer(val);
  };

  const showReportsLayer = layerVisibility ? layerVisibility.showReportsLayer : internalShowReportsLayer;
  const setShowReportsLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showReportsLayer: val }));
    else setInternalShowReportsLayer(val);
  };

  const showHotspotsLayer = layerVisibility ? layerVisibility.showHotspotsLayer : internalShowHotspotsLayer;
  const setShowHotspotsLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showHotspotsLayer: val }));
    else setInternalShowHotspotsLayer(val);
  };

  const showDeluge2005Layer = layerVisibility ? layerVisibility.showDeluge2005Layer : internalShowDeluge2005Layer;
  const setShowDeluge2005Layer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showDeluge2005Layer: val }));
    else setInternalShowDeluge2005Layer(val);
  };

  const showGroundwaterLayer = layerVisibility ? layerVisibility.showGroundwaterLayer : internalShowGroundwaterLayer;
  const setShowGroundwaterLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showGroundwaterLayer: val }));
    else setInternalShowGroundwaterLayer(val);
  };

  const showSignalsLayer = layerVisibility ? layerVisibility.showSignalsLayer : internalShowSignalsLayer;
  const setShowSignalsLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showSignalsLayer: val }));
    else setInternalShowSignalsLayer(val);
  };

  const showImperviousnessLayer = layerVisibility ? layerVisibility.showImperviousnessLayer : internalShowImperviousnessLayer;
  const setShowImperviousnessLayer = (val: boolean) => {
    if (setLayerVisibility) setLayerVisibility(prev => ({ ...prev, showImperviousnessLayer: val }));
    else setInternalShowImperviousnessLayer(val);
  };

  const [imperviousnessData, setImperviousnessData] = useState<ImperviousnessTelemetry | null>(null);

  // Live Wind & Cloud Telemetry State
  const [windCloudData, setWindCloudData] = useState<WindCloudData | null>(null);

  // Precipitation Source Badge State
  const [precipSourceInfo, setPrecipSourceInfo] = useState<PrecipitationSourceInfo>({
    active: 'openmeteo_fallback',
    lastUpdated: null,
    confidence: null,
    radarFreshness: 'unavailable',
    radarStationCode: null,
  });
  const [currentZoom, setCurrentZoom] = useState(13);

  // Automatically enable route layer when user calculates a route or deploys evacuation path
  useEffect(() => {
    if (activeRoute) {
      setShowRouteLayer(true);
    }
  }, [activeRoute]);

  // Unified Drawer & Accordion State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('roads');

  // Popup Feature Inspection Data
  const [popupContent, setPopupContent] = useState<{
    title: string;
    subtitle: string;
    badge?: { text: string; color: string };
    details: { label: string; value: string; color?: string }[];
  } | null>(null);

  // Live Lat/Lng Cursor Telemetry
  const [cursorCoords, setCursorCoords] = useState<{ lat: string; lng: string; elev: number }>({
    lat: '0.0000',
    lng: '0.0000',
    elev: 0
  });

  const city = CITIES[selectedCityId];
  const snapshot = hydraulicSnapshotOverride || getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
  const evacZones = getEvacuationZonesForCity(selectedCityId, timeOffsetMins, snapshot);
  const activeEvacZones = evacZones.filter(z => z.active);

  // Derive Overall Risk Summary for the At-A-Glance Status Bar
  const overflowingCount = snapshot.overflowingManholesCount || 0;
  const severeRoads = snapshot.roadStates.filter(r => r.waterDepthCm >= 40);
  const criticalRoads = snapshot.roadStates.filter(r => r.waterDepthCm >= 20 && r.waterDepthCm < 40);
  const warningRoads = snapshot.roadStates.filter(r => r.waterDepthCm >= 8 && r.waterDepthCm < 20);
  const maxDepth = snapshot.maxWaterDepthCm;

  let overallRisk: 'severe' | 'critical' | 'warning' | 'normal' = 'normal';
  if (activeEvacZones.length > 0 || overflowingCount > 0 || severeRoads.length > 0) overallRisk = 'severe';
  else if (criticalRoads.length > 0) overallRisk = 'critical';
  else if (warningRoads.length > 0) overallRisk = 'warning';

  const activeLayersCount = [
    showDemLayer,
    showWindCloudLayer,
    showRoadsLayer,
    showDrainageLayer,
    showManholesLayer,
    showRouteLayer,
    showEvacuationLayer,
    showReportsLayer,
    showHotspotsLayer,
    showDeluge2005Layer,
    showGroundwaterLayer,
    showSignalsLayer
  ].filter(Boolean).length;

  // 100% Free Open-Access Base Tile Layers (Zero API Key Required)
  const osmStandardLayerRef = useRef<TileLayer<XYZ>>(
    new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles &copy; Esri World Street Map'
      }),
      visible: true
    })
  );

  const openTopoLayerRef = useRef<TileLayer<XYZ>>(
    new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attributions: '&copy; OpenTopoMap'
      }),
      visible: false
    })
  );

  const osmHotLayerRef = useRef<TileLayer<XYZ>>(
    new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attributions: '&copy; OSM France'
      }),
      visible: false
    })
  );

  const esriSatLayerRef = useRef<TileLayer<XYZ>>(
    new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles &copy; Esri World Imagery'
      }),
      visible: false
    })
  );

  // Transparent Reference Tile Layer for Location Names, Streets & Boundaries (Visible on Satellite & Topo)
  const labelsReferenceLayerRef = useRef<TileLayer<XYZ>>(
    new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Labels &copy; Esri'
      }),
      zIndex: 10,
      visible: true
    })
  );

  const placesReferenceLayerRef = useRef<TileLayer<XYZ>>(
    new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Places &copy; Esri'
      }),
      zIndex: 11,
      visible: true
    })
  );

  // Vector Sources
  const demVectorSourceRef = useRef(new VectorSource());
  const windVectorSourceRef = useRef(new VectorSource());
  const cloudVectorSourceRef = useRef(new VectorSource());
  const roadsVectorSourceRef = useRef(new VectorSource());
  const drainageVectorSourceRef = useRef(new VectorSource());
  const manholesVectorSourceRef = useRef(new VectorSource());
  const routeVectorSourceRef = useRef(new VectorSource());
  const evacuationVectorSourceRef = useRef(new VectorSource());
  const sheltersVectorSourceRef = useRef(new VectorSource());
  const reportsVectorSourceRef = useRef(new VectorSource());
  const hotspotsVectorSourceRef = useRef(new VectorSource());
  const deluge2005VectorSourceRef = useRef(new VectorSource());
  const groundwaterVectorSourceRef = useRef(new VectorSource());
  const signalsVectorSourceRef = useRef(new VectorSource());
  const imperviousnessVectorSourceRef = useRef(new VectorSource());
  const pinsVectorSourceRef = useRef(new VectorSource());

  const windVectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const cloudVectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // Cluster Sources for Manholes & Citizen Pins (Zoom-based clustering)
  const manholesClusterSourceRef = useRef(
    new Cluster({
      distance: 35,
      minDistance: 20,
      source: manholesVectorSourceRef.current
    })
  );

  const reportsClusterSourceRef = useRef(
    new Cluster({
      distance: 40,
      minDistance: 25,
      source: reportsVectorSourceRef.current
    })
  );

  // Initialize Map
  useEffect(() => {
    if (!mapElementRef.current) return;

    // Create Popup Overlay
    const overlay = new Overlay({
      element: popupElementRef.current!,
      autoPan: { animation: { duration: 250 } },
      positioning: 'bottom-center',
      offset: [0, -12]
    });
    overlayRef.current = overlay;

    const demVectorLayer = new VectorLayer({
      source: demVectorSourceRef.current,
      zIndex: 5,
      opacity: 0.55
    });

    const cloudVectorLayer = new VectorLayer({
      source: cloudVectorSourceRef.current,
      zIndex: 4,
      opacity: 0.85
    });
    cloudVectorLayerRef.current = cloudVectorLayer;

    const windVectorLayer = new VectorLayer({
      source: windVectorSourceRef.current,
      zIndex: 34
    });
    windVectorLayerRef.current = windVectorLayer;

    const drainageVectorLayer = new VectorLayer({
      source: drainageVectorSourceRef.current,
      zIndex: 15
    });

    const roadsVectorLayer = new VectorLayer({
      source: roadsVectorSourceRef.current,
      zIndex: 25,
      style: (feature) => {
        const props = feature.getProperties();
        const depthCm = props.waterDepthCm || 0;
        const isGalli = props.isGalli || ['residential', 'service', 'unclassified', 'living_street'].includes(props.highway);

        const zoom = mapRef.current ? mapRef.current.getView().getZoom() || 14 : 14;

        let strokeWidth = isGalli ? 2.5 : 4.2;
        if (zoom >= 16) strokeWidth = isGalli ? 4.5 : 7.0;
        else if (zoom >= 14) strokeWidth = isGalli ? 3.2 : 5.0;

        // 4 Distinct Severity Color Tiers
        let strokeColor = '#74fed2ff'; // Safe Emerald (<8cm)
        if (depthCm >= 40) {
          strokeColor = '#dc2626'; // Impassable Dark Red (>=40cm)
        } else if (depthCm >= 20) {
          strokeColor = '#ea580c'; // Critical Bright Orange (20-40cm)
        } else if (depthCm >= 8) {
          strokeColor = '#f59e0b'; // Warning Amber Gold (8-20cm)
        }

        return new Style({
          stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
            lineDash: isGalli ? [6, 4] : undefined,
            lineCap: 'round',
            lineJoin: 'round'
          })
        });
      }
    });

    // Manholes Cluster Layer with Dynamic Severity Styling
    const manholesVectorLayer = new VectorLayer({
      source: manholesClusterSourceRef.current,
      zIndex: 30,
      style: (clusterFeature) => {
        const features = clusterFeature.get('features') as Feature[];
        if (!features || features.length === 0) return [];

        // 1. Single Unclustered Feature (Zoomed In)
        if (features.length === 1) {
          const mh = features[0].getProperties();
          const isOverflowing = mh.surfaceOverflowDepthCm > 0;
          const isSurcharging = mh.hydraulicCapacityPct >= 100;
          const isWarning = mh.hydraulicCapacityPct >= 70;
          const isGalli = mh.isGalli;

          if (isOverflowing) {
            return [
              new Style({
                image: new CircleStyle({
                  radius: 13,
                  stroke: new Stroke({ color: 'rgba(220, 38, 38, 0.85)', width: 2, lineDash: [3, 3] }),
                  fill: new Fill({ color: 'rgba(239, 68, 68, 0.25)' })
                })
              }),
              new Style({
                image: new CircleStyle({
                  radius: 7,
                  fill: new Fill({ color: '#dc2626' }),
                  stroke: new Stroke({ color: '#ffffff', width: 2 })
                }),
                text: new Text({
                  text: `+${mh.surfaceOverflowDepthCm}cm`,
                  font: 'bold 9.5px sans-serif',
                  fill: new Fill({ color: '#991b1b' }),
                  stroke: new Stroke({ color: '#ffffff', width: 3 }),
                  offsetY: -15
                })
              })
            ];
          }

          let pinColor = isGalli ? '#0284c7' : '#059669'; // Galli blue vs main road green
          let pinRadius = isGalli ? 5 : 5.5;

          if (isSurcharging) {
            pinColor = '#ea580c'; // Critical Orange
            pinRadius = 7;
          } else if (isWarning) {
            pinColor = '#d97706'; // Warning Amber
            pinRadius = 6;
          }

          return [
            new Style({
              image: new CircleStyle({
                radius: pinRadius,
                fill: new Fill({ color: pinColor }),
                stroke: new Stroke({
                  color: isSurcharging ? '#fed7aa' : '#ffffff',
                  width: 2
                })
              })
            })
          ];
        }

        // 2. Clustered Features (> 1 Nodes)
        let worstStatus: 'overflow' | 'surcharge' | 'warning' | 'normal' = 'normal';
        let maxOverflow = 0;

        for (const f of features) {
          const props = f.getProperties();
          if (props.surfaceOverflowDepthCm > 0 || props.hydraulicCapacityPct >= 120) {
            worstStatus = 'overflow';
            maxOverflow = Math.max(maxOverflow, props.surfaceOverflowDepthCm);
            break;
          } else if (props.hydraulicCapacityPct >= 100) {
            worstStatus = 'surcharge';
          } else if (props.hydraulicCapacityPct >= 70) {
            if (worstStatus === 'normal') worstStatus = 'warning';
          }
        }

        let clusterColor = '#059669'; // Normal Emerald
        let strokeColor = '#34d399';
        let ringColor = 'rgba(5, 150, 105, 0.2)';

        if (worstStatus === 'overflow') {
          clusterColor = '#dc2626'; // Severe Red
          strokeColor = '#fca5a5';
          ringColor = 'rgba(220, 38, 38, 0.25)';
        } else if (worstStatus === 'surcharge') {
          clusterColor = '#ea580c'; // Critical Orange
          strokeColor = '#fed7aa';
          ringColor = 'rgba(234, 88, 12, 0.2)';
        } else if (worstStatus === 'warning') {
          clusterColor = '#d97706'; // Warning Amber
          strokeColor = '#fef08a';
          ringColor = 'rgba(217, 119, 6, 0.2)';
        }

        const radius = Math.min(22, 12 + Math.log2(features.length) * 2.8);

        return [
          new Style({
            image: new CircleStyle({
              radius: radius + 3.5,
              stroke: new Stroke({ color: strokeColor, width: 1.5 }),
              fill: new Fill({ color: ringColor })
            })
          }),
          new Style({
            image: new CircleStyle({
              radius,
              fill: new Fill({ color: clusterColor }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            }),
            text: new Text({
              text: features.length.toString(),
              font: 'bold 10.5px sans-serif',
              fill: new Fill({ color: '#ffffff' })
            })
          })
        ];
      }
    });

    const evacuationVectorLayer = new VectorLayer({
      source: evacuationVectorSourceRef.current,
      zIndex: 18,
      opacity: 0.85
    });

    const routeVectorLayer = new VectorLayer({
      source: routeVectorSourceRef.current,
      zIndex: 35
    });

    const sheltersVectorLayer = new VectorLayer({
      source: sheltersVectorSourceRef.current,
      zIndex: 40
    });

    // Citizen Reports Cluster Layer
    const reportsVectorLayer = new VectorLayer({
      source: reportsClusterSourceRef.current,
      zIndex: 45,
      style: (clusterFeature) => {
        const features = clusterFeature.get('features') as Feature[];
        if (!features || features.length === 0) return [];

        if (features.length === 1) {
          return [
            new Style({
              image: new Icon({
                src: 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24'><path d='M12 2L2 20h20L12 2z' fill='#d97706' stroke='#ffffff' stroke-width='2' stroke-linejoin='round'/><path d='M12 10v5' stroke='white' stroke-width='2' stroke-linecap='round'/><circle cx='12' cy='17' r='1' fill='white'/></svg>"),
                scale: 1.0
              })
            })
          ];
        }

        const radius = Math.min(20, 11 + Math.log2(features.length) * 2.5);
        return [
          new Style({
            image: new CircleStyle({
              radius,
              fill: new Fill({ color: '#d97706' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            }),
            text: new Text({
              text: features.length.toString(),
              font: 'bold 10.5px sans-serif',
              fill: new Fill({ color: '#ffffff' })
            })
          })
        ];
      }
    });

    const groundwaterVectorLayer = new VectorLayer({
      source: groundwaterVectorSourceRef.current,
      zIndex: 6,
      opacity: 0.65
    });

    const hotspotsVectorLayer = new VectorLayer({
      source: hotspotsVectorSourceRef.current,
      zIndex: 32
    });

    const deluge2005VectorLayer = new VectorLayer({
      source: deluge2005VectorSourceRef.current,
      zIndex: 33
    });

    const signalsVectorLayer = new VectorLayer({
      source: signalsVectorSourceRef.current,
      zIndex: 48
    });

    const pinsVectorLayer = new VectorLayer({
      source: pinsVectorSourceRef.current,
      zIndex: 50
    });

    const imperviousnessVectorLayer = new VectorLayer({
      source: imperviousnessVectorSourceRef.current,
      zIndex: 4,
      opacity: 0.60
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [
        osmStandardLayerRef.current,
        openTopoLayerRef.current,
        osmHotLayerRef.current,
        esriSatLayerRef.current,
        labelsReferenceLayerRef.current,
        placesReferenceLayerRef.current,
        cloudVectorLayer,
        imperviousnessVectorLayer,
        demVectorLayer,
        groundwaterVectorLayer,
        drainageVectorLayer,
        evacuationVectorLayer,
        roadsVectorLayer,
        manholesVectorLayer,
        windVectorLayer,
        hotspotsVectorLayer,
        deluge2005VectorLayer,
        signalsVectorLayer,
        routeVectorLayer,
        sheltersVectorLayer,
        reportsVectorLayer,
        pinsVectorLayer
      ],
      overlays: [overlay],
      view: new View({
        center: fromLonLat([city.center[1], city.center[0]]),
        zoom: city.zoom,
        maxZoom: 19
      })
    });

    mapRef.current = map;

    // View resolution change listener for zoom-throttled animation controls
    map.getView().on('change:resolution', () => {
      const zoom = map.getView().getZoom() || 13;
      setCurrentZoom(zoom);
    });

    // Pointer move listener for coordinates telemetry
    map.on('pointermove', (evt) => {
      const lonLat = toLonLat(evt.coordinate);
      const lat = lonLat[1];
      const lng = lonLat[0];
      const elev = getElevationAtCoordinate(lat, lng, selectedCityId);

      setCursorCoords({
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
        elev
      });
    });

    // Feature Single-Click Handler with Cluster Auto-Zoom and Map Pin Picker Intercept
    map.on('singleclick', (evt) => {
      if (routePinModeRef.current && routePinModeRef.current !== 'none') {
        const lonLat = toLonLat(evt.coordinate);
        const lat = lonLat[1];
        const lng = lonLat[0];

        if (onLocationPickedRef.current) {
          onLocationPickedRef.current(routePinModeRef.current, [lat, lng]);
        }
        if (setRoutePinModeRef.current) {
          setRoutePinModeRef.current('none');
        }

        overlay.setPosition(undefined);
        setPopupContent(null);
        return;
      }

      let featureFound = false;

      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        if (featureFound) return;

        // Check if clicked feature is a cluster from manholes or reports
        const clusterFeatures = feature.get('features') as Feature[] | undefined;

        if (clusterFeatures) {
          // If cluster has multiple items, smoothly zoom in to un-cluster!
          if (clusterFeatures.length > 1) {
            featureFound = true;
            const extent = createEmpty();
            clusterFeatures.forEach(f => extend(extent, f.getGeometry()!.getExtent()));
            map.getView().fit(extent, { duration: 450, maxZoom: 18, padding: [60, 60, 60, 60] });
            overlay.setPosition(undefined);
            setPopupContent(null);
            return;
          }

          // Single feature within cluster
          if (clusterFeatures.length === 1) {
            const singleFeature = clusterFeatures[0];
            const props = singleFeature.getProperties();

            if (props.type === 'physics_manhole') {
              featureFound = true;
              const isOverflowing = props.surfaceOverflowDepthCm > 0;
              const isWarning = props.hydraulicCapacityPct >= 70;
              let statusColor = 'text-green-700';
              if (isOverflowing) statusColor = 'text-orange-600 font-bold';
              else if (isWarning) statusColor = 'text-orange-600 font-bold';

              setPopupContent({
                title: props.name,
                subtitle: props.derivedLocationLabel,
                badge: {
                  text: props.isGalli ? 'Galli Catchpit' : 'Roadway Manhole',
                  color: props.isGalli ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-800'
                },
                details: [
                  { label: 'Road / Galli', value: props.roadName, color: 'text-gray-800 font-semibold' },
                  { label: 'Corridor Category', value: props.highwayCategory || (props.isGalli ? 'Galli / Local Lane' : 'Municipal Thoroughfare') },
                  { label: 'Rim Alt (z_rim)', value: `${props.rimElevationMeters} m MSL` },
                  { label: 'Invert Depth', value: `${props.invertDepthMeters} m` },
                  { label: 'Pipe Diameter', value: `Ø${props.pipeDiameterMm}mm (${props.pipeSlopePct}% slope)` },
                  { label: 'Hydraulic Capacity', value: `${props.capacityLps} L/s` },
                  { label: 'Inflow Runoff', value: `${props.inflowRunoffLps} L/s` },
                  { label: 'Hydraulic Load', value: `${props.hydraulicCapacityPct}%`, color: statusColor },
                  {
                    label: 'Surcharge Status',
                    value: isOverflowing ? `+${props.surfaceOverflowDepthCm} cm (STREET OVERFLOW)` : '0 cm (Contained)',
                    color: isOverflowing ? 'text-orange-600 font-bold' : 'text-green-700'
                  },
                  { label: 'Backpressure Coeff', value: `${Math.round(props.backpressureFactor * 100)}% resistance` }
                ]
              });
              overlay.setPosition(evt.coordinate);
              return;
            }

            if (props.type === 'report') {
              featureFound = true;
              setPopupContent({
                title: 'Citizen Ground-Truth Report',
                subtitle: props.locationName,
                badge: { text: 'Verified', color: 'bg-orange-100 text-orange-800' },
                details: [
                  { label: 'Observed Depth', value: `${props.waterDepthCm} cm`, color: 'text-orange-700 font-bold' },
                  { label: 'User Note', value: `"${props.userNote}"` }
                ]
              });
              overlay.setPosition(evt.coordinate);
              return;
            }
          }
        }

        const props = feature.getProperties();

        if (props.type === 'historical_impact_marker') {
          featureFound = true;
          setPopupContent({
            title: `Historical Record: ${props.hotspotName}`,
            subtitle: `Zone: ${props.boroughOrZone} • Post-Event Ground Truth`,
            badge: { text: 'HISTORICAL RECORD', color: 'bg-purple-600 text-white' },
            details: [
              { label: 'Recorded Inundation Range', value: `${props.recordedDepthRangeCm[0]}-${props.recordedDepthRangeCm[1]} cm`, color: 'text-purple-700 font-bold' },
              { label: 'Impact Log', value: props.impactDescription },
              { label: 'Record Provenance', value: 'IMD & Government Post-Disaster Audit' }
            ]
          });
          overlay.setPosition(evt.coordinate);
          return;
        }

        if (props.type === 'wind_vector') {
          featureFound = true;
          setPopupContent({
            title: 'Live Wind & Cloud Vector Point',
            subtitle: `${props.speedKmh} km/h ${props.directionCardinal} (${props.directionDeg}°)`,
            badge: {
              text: (props.windBand || 'Breezy').toUpperCase(),
              color: props.windBand === 'calm' ? 'bg-emerald-100 text-emerald-800' :
                     props.windBand === 'breezy' ? 'bg-sky-100 text-sky-800' :
                     props.windBand === 'strong' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
            },
            details: [
              { label: 'Wind Velocity', value: `${props.speedKmh} km/h`, color: 'text-gray-800 font-bold font-mono' },
              { label: 'Flow Direction', value: `${props.directionDeg}° (${props.directionCardinal})` },
              { label: 'Cloud Density', value: `${props.cloudCoverPct}%` },
              { label: 'Surge Setup Hook', value: `+${props.coastalSurgeSetupMeters || 0}m Coastal Setup`, color: 'text-cyan-700 font-bold font-mono' },
              { label: 'Data Feed', value: 'Windy API / Open-Meteo Nowcast' }
            ]
          });
          overlay.setPosition(evt.coordinate);
          return;
        }

        if (props.type === 'citizen_signal') {
          featureFound = true;
          const issueInfo = ISSUE_TYPE_CONFIG[props.issueType as keyof typeof ISSUE_TYPE_CONFIG] || { label: props.issueType };
          setPopupContent({
            title: props.title,
            subtitle: `Nearest Drain: ${props.nearestManholeId}`,
            badge: { text: props.status.toUpperCase(), color: 'bg-orange-100 text-orange-800' },
            details: [
              { label: 'Issue Category', value: issueInfo.label, color: 'text-orange-700 font-bold' },
              { label: 'Description', value: props.description },
              { label: 'Capacity Drag', value: `${Math.round((props.severityRatio || 0.5) * 100)}% degraded`, color: 'text-orange-600 font-bold' },
              { label: 'Community Upvotes', value: `${props.upvotes} validations` }
            ]
          });
          overlay.setPosition(evt.coordinate);
          return;
        }

        if (props.type === 'road') {
          featureFound = true;
          const isCritical = props.waterDepthCm >= 20;
          const isWarning = props.waterDepthCm >= 8;
          const isGalli = props.isGalli || props.highwayCategory === 'Galli / Local Lane';

          setPopupContent({
            title: props.name,
            subtitle: `Borough: ${props.borough} • Alt: ${props.demElevationMeters}m MSL`,
            badge: {
              text: isGalli ? 'Galli / Local Lane' : (props.highwayCategory || 'Arterial Corridor'),
              color: isGalli ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-800'
            },
            details: [
              {
                label: 'Water Depth',
                value: `${props.waterDepthCm} cm`,
                color: isCritical ? 'text-orange-600 font-bold' : isWarning ? 'text-orange-600 font-bold' : 'text-green-700'
              },
              {
                label: 'Severity Level',
                value: props.severity.toUpperCase(),
                color: isCritical ? 'text-orange-600 font-bold' : isWarning ? 'text-orange-600 font-bold' : 'text-green-700'
              },
              {
                label: 'Corridor Passability',
                value: props.waterDepthCm >= 35 ? 'IMPASSABLE / CLOSED' : props.waterDepthCm >= 15 ? 'HIGH-CLEARANCE ONLY' : 'OPEN TO TRAFFIC'
              },
              { label: 'Drainage Node Ref', value: props.drainNodeId || 'Trunk Connected' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'real_waterway') {
          featureFound = true;
          setPopupContent({
            title: props.name,
            subtitle: props.description,
            badge: { text: props.category.replace('_', ' ').toUpperCase(), color: 'bg-blue-100 text-blue-800' },
            details: [
              { label: 'Channel Width', value: `${props.widthMeters} meters` },
              { label: 'Discharge Flow', value: `${props.currentFlowLps} L/s` },
              { label: 'Capacity Load', value: `${props.surchargePct}%`, color: props.surchargePct >= 100 ? 'text-orange-600 font-bold' : 'text-green-700' },
              { label: 'Data Source', value: 'Authentic OpenStreetMap GIS Vectors' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'pumping_station') {
          featureFound = true;
          setPopupContent({
            title: props.name,
            subtitle: `Municipal Dewatering SCADA Station (${props.locationName})`,
            badge: { text: props.isOperational ? 'OPERATIONAL' : 'STANDBY', color: props.isOperational ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' },
            details: [
              { label: 'Pumping Capacity', value: `${props.capacityLps} L/s` },
              { label: 'Current Discharge', value: `${props.currentDischargeLps} L/s`, color: 'text-green-700 font-bold' },
              { label: 'Active Units', value: `${props.activePumpsCount} / ${props.totalPumpsCount}` },
              { label: 'Power Source', value: props.powerStatus === 'grid_active' ? 'Grid Power' : 'Diesel Generator' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'evacuation_zone') {
          featureFound = true;
          setPopupContent({
            title: props.name,
            subtitle: `Borough: ${props.borough} • Municipal Inundation Catchment`,
            badge: {
              text: props.severity === 'severe' ? 'CRITICAL EVACUATION' : 'ELEVATED ADVISORY',
              color: 'bg-orange-600 text-white'
            },
            details: [
              { label: 'Surface Water Depth', value: `${props.waterDepthCm} cm`, color: 'text-orange-600 font-bold' },
              { label: 'At-Risk Population', value: `${props.evacueePopulation?.toLocaleString()} residents` },
              { label: 'Overflowing Catchpits', value: `${props.overflowingManholesCount} active surcharge` },
              { label: 'Evacuation Protocol', value: 'High-Ground Foot Refuge', color: 'text-green-700 font-bold' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'safe_shelter') {
          featureFound = true;
          setPopupContent({
            title: props.name,
            subtitle: props.address,
            badge: { text: 'HIGH-GROUND REFUGE', color: 'bg-green-600 text-white' },
            details: [
              { label: 'Elevation Above MSL', value: `${props.elevationMeters} m`, color: 'text-green-700 font-bold' },
              { label: 'Refuge Capacity', value: `${props.capacityPersons?.toLocaleString()} persons` },
              { label: 'Relief Facilities', value: (props.facilities || []).slice(0, 2).join(', ') },
              { label: 'Emergency Helpline', value: props.contactEmergency }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'route_segment') {
          featureFound = true;
          setPopupContent({
            title: props.roadName,
            subtitle: `Corridor Category: ${props.highwayCategory}`,
            badge: {
              text: props.riskSeverity.toUpperCase(),
              color: props.riskSeverity === 'safe' ? 'bg-green-100 text-green-800' :
                     props.riskSeverity === 'warning' ? 'bg-orange-100 text-orange-800' : 'bg-orange-100 text-orange-800'
            },
            details: [
              { label: 'Segment Flood Depth', value: `${props.waterDepthCm} cm`, color: props.waterDepthCm >= 20 ? 'text-orange-600 font-bold' : 'text-green-700 font-bold' },
              { label: 'Wading Status', value: props.isPassable ? 'PASSABLE / CLEAR' : 'IMPASSABLE / BLOCKED' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'flood_hotspot') {
          featureFound = true;
          setPopupContent({
            title: props.name,
            subtitle: `Location: ${props.location || 'BMC Designated Spot'} • Ward ${props.ward || 'N/A'}`,
            badge: {
              text: (props.categoryLabel || 'Hotspot').toUpperCase(),
              color: props.category === 'chronic_spot' ? 'bg-orange-600 text-white' : props.category === 'subway' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'
            },
            details: [
              { label: 'Official Register', value: 'BMC Disaster Management Spot Directory' },
              { label: 'Spot Category', value: props.categoryLabel || 'Flood Hotspot' },
              { label: 'Location Details', value: props.location || 'Low-lying intersection' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'deluge_2005') {
          featureFound = true;
          setPopupContent({
            title: '26 July 2005 Extreme Deluge Benchmark',
            subtitle: props.name,
            badge: { text: '944mm HISTORIC HIGH WATER', color: 'bg-orange-600 text-white' },
            details: [
              { label: 'Recorded Depth', value: props.depthLabel || 'High Inundation', color: 'text-orange-800 font-bold' },
              { label: 'Historical Context', value: props.note || 'BMC 26 July 2005 Disaster Log' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'groundwater_ward') {
          featureFound = true;
          setPopupContent({
            title: 'Ward Groundwater Depth',
            subtitle: props.wardName,
            badge: { text: (props.category || 'Monitored').toUpperCase(), color: 'bg-green-100 text-green-800' },
            details: [
              { label: 'Interpolated Water Table', value: props.depthM != null ? `${props.depthM} m below ground level` : 'No Depth Data', color: 'text-green-700 font-bold' },
              { label: 'Methodology', value: 'Ward IDW Surface from CGWB Year Book Wells' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'groundwater_well') {
          featureFound = true;
          setPopupContent({
            title: 'CGWB Hydrograph Monitoring Well',
            subtitle: props.name,
            badge: { text: 'CGWB STATION', color: 'bg-gray-100 text-gray-800' },
            details: [
              { label: 'Depth to Water Table', value: `${props.depthMeters} m bgl`, color: 'text-gray-800 font-bold' },
              { label: 'Reading Period', value: props.readingDate || 'Recent Survey' },
              { label: 'Agency', value: 'Central Ground Water Board (CGWB) Maharashtra' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        } else if (props.type === 'route') {
          featureFound = true;
          setPopupContent({
            title: props.name,
            subtitle: 'Flood-Safe Evacuation Corridor',
            badge: { text: props.isSafe ? 'Clear Path' : 'Hazard Warning', color: props.isSafe ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800' },
            details: [
              { label: 'Max Water Depth', value: `${props.maxDepthCm || 0} cm` },
              { label: 'Clearance Status', value: props.isSafe ? 'Passable for Vehicle' : 'Avoid Route' }
            ]
          });
          overlay.setPosition(evt.coordinate);
        }
      });

      if (!featureFound) {
        overlay.setPosition(undefined);
        setPopupContent(null);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Update Map Center on City Change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.getView().animate({
        center: fromLonLat([city.center[1], city.center[0]]),
        zoom: city.zoom,
        duration: 1000
      });
    }
  }, [selectedCityId]);

  // Base Map Layer Control
  useEffect(() => {
    osmStandardLayerRef.current.setVisible(baseLayerType === 'osm');
    openTopoLayerRef.current.setVisible(baseLayerType === 'topo');
    osmHotLayerRef.current.setVisible(baseLayerType === 'hot');
    esriSatLayerRef.current.setVisible(baseLayerType === 'satellite');
  }, [baseLayerType]);

  // Fetch & Synchronize Live Wind Vectors and Semi-Transparent Cloud Overlay
  useEffect(() => {
    let isMounted = true;
    fetchLiveWindCloudData(selectedCityId)
      .then(data => {
        if (isMounted) {
          setWindCloudData(data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [selectedCityId, timeOffsetMins]);

  // Fetch Precipitation Source Status for the Data-Source Badge
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/nowcast?city=${selectedCityId}&time=${timeOffsetMins}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.precipitationSource) {
          setPrecipSourceInfo({
            active: data.precipitationSource.active || 'openmeteo_fallback',
            lastUpdated: data.precipitationSource.lastUpdated || null,
            confidence: data.precipitationSource.confidence ?? null,
            radarFreshness: data.precipitationSource.radarFreshness || 'unavailable',
            radarStationCode: data.precipitationSource.radarStationCode || null,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setPrecipSourceInfo(prev => ({
            ...prev,
            active: 'unavailable',
          }));
        }
      });
    return () => { isMounted = false; };
  }, [selectedCityId, timeOffsetMins]);

  // Update Wind Flow Vectors & Cloud Cover Vector Overlay Features
  useEffect(() => {
    const windSource = windVectorSourceRef.current;
    const cloudSource = cloudVectorSourceRef.current;
    windSource.clear();
    cloudSource.clear();

    if (!showWindCloudLayer || !windCloudData) return;

    // 1. Semi-transparent Cloud Cover Overlay Polygon over city extent
    const centerLat = city.center[0];
    const centerLng = city.center[1];
    const latSpan = 0.35;
    const lngSpan = 0.35;

    const minPt = fromLonLat([centerLng - lngSpan, centerLat - latSpan]);
    const maxPt = fromLonLat([centerLng + lngSpan, centerLat + latSpan]);

    const ring = [
      [minPt[0], minPt[1]],
      [maxPt[0], minPt[1]],
      [maxPt[0], maxPt[1]],
      [minPt[0], maxPt[1]],
      [minPt[0], minPt[1]]
    ];

    const cloudFeature = new Feature({
      geometry: new Polygon([ring]),
      type: 'cloud_cover_overlay',
      cloudCoverPct: windCloudData.cloudCoverPct
    });

    const opacity = Math.min(0.38, Math.max(0.04, (windCloudData.cloudCoverPct / 100) * 0.38));
    cloudFeature.setStyle(
      new Style({
        fill: new Fill({ color: `rgba(71, 85, 105, ${opacity})` }),
        stroke: new Stroke({ color: 'rgba(148, 163, 184, 0.25)', width: 1.2, lineDash: [8, 6] })
      })
    );
    cloudSource.addFeature(cloudFeature);

    // 2. Wind Flow Vector Arrows across Grid
    windCloudData.vectorGrid.forEach((pt) => {
      const coord = fromLonLat([pt.lng, pt.lat]);
      const rad = (pt.directionDeg * Math.PI) / 180;
      const bandColor = getWindBandColor(pt.speedKmh < 15 ? 'calm' : pt.speedKmh < 30 ? 'breezy' : pt.speedKmh < 50 ? 'strong' : 'severe');

      const arrowFeature = new Feature({
        geometry: new Point(coord),
        type: 'wind_vector',
        id: pt.id,
        speedKmh: pt.speedKmh,
        directionDeg: pt.directionDeg,
        directionCardinal: pt.directionCardinal,
        cloudCoverPct: windCloudData.cloudCoverPct,
        windBand: windCloudData.windBand,
        coastalSurgeSetupMeters: windCloudData.solverIntegrationHook.coastalSurgeSetupMeters
      });

      arrowFeature.setStyle([
        new Style({
          text: new Text({
            text: '➤',
            font: 'bold 17px sans-serif',
            fill: new Fill({ color: bandColor }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            rotation: rad,
            rotateWithView: true
          })
        }),
        new Style({
          text: new Text({
            text: `${pt.speedKmh} km/h ${pt.directionCardinal}`,
            font: 'bold 9px sans-serif',
            fill: new Fill({ color: '#0f172a' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            offsetY: 15
          })
        })
      ]);

      windSource.addFeature(arrowFeature);

      // Flow Polyline Segment for vector stream
      const endLng = pt.lng + (pt.uComponent / 100) * 0.04;
      const endLat = pt.lat + (pt.vComponent / 100) * 0.04;
      const lineCoords = [coord, fromLonLat([endLng, endLat])];

      const lineFeature = new Feature({
        geometry: new LineString(lineCoords),
        type: 'wind_stream_line'
      });

      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: bandColor,
            width: Math.max(1.8, Math.min(4.5, pt.speedKmh / 10)),
            lineDash: [5, 4]
          })
        })
      );

      windSource.addFeature(lineFeature);
    });
  }, [selectedCityId, timeOffsetMins, showWindCloudLayer, windCloudData]);

  // Zoom-Throttled Performance: Automatically disable wind particle animation layer at far zoom levels (<10.5)
  useEffect(() => {
    if (windVectorLayerRef.current) {
      const isVisible = showWindCloudLayer && currentZoom >= 10.5;
      windVectorLayerRef.current.setVisible(isVisible);
    }
    if (cloudVectorLayerRef.current) {
      cloudVectorLayerRef.current.setVisible(showWindCloudLayer);
    }
  }, [showWindCloudLayer, currentZoom]);

  // Update DEM Surface Model Layer Features
  useEffect(() => {
    const source = demVectorSourceRef.current;
    source.clear();

    if (!showDemLayer) return;

    const gridCells = getDemSurfaceGrid(selectedCityId);
    gridCells.forEach(cell => {
      const minCorner = fromLonLat([cell.bounds[0][1], cell.bounds[0][0]]);
      const maxCorner = fromLonLat([cell.bounds[1][1], cell.bounds[1][0]]);

      const ring = [
        [minCorner[0], minCorner[1]],
        [maxCorner[0], minCorner[1]],
        [maxCorner[0], maxCorner[1]],
        [minCorner[0], maxCorner[1]],
        [minCorner[0], minCorner[1]]
      ];

      const feature = new Feature({
        geometry: new Polygon([ring]),
        type: 'dem_cell',
        elevationMeters: cell.elevationMeters,
        category: cell.category
      });

      feature.setStyle(
        new Style({
          fill: new Fill({ color: cell.color }),
          stroke: new Stroke({ color: 'rgba(255,255,255,0.06)', width: 0.5 })
        })
      );

      source.addFeature(feature);
    });

    const contours = getDemContours(selectedCityId);
    contours.forEach(contour => {
      const coords = contour.coordinates.map(pt => fromLonLat([pt[1], pt[0]]));
      const feature = new Feature({
        geometry: new LineString(coords),
        type: 'dem_contour',
        label: contour.label,
        elevation: contour.elevationMeters
      });

      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#1e293b',
            width: 1.5,
            lineDash: [4, 4]
          }),
          text: new Text({
            text: `${contour.elevationMeters}m`,
            font: 'bold 10px sans-serif',
            fill: new Fill({ color: '#0f172a' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 }),
            placement: 'line'
          })
        })
      );

      source.addFeature(feature);
    });
  }, [selectedCityId, showDemLayer]);

  // Update ESA WorldCover 10m Concrete Imperviousness Heatmap Vector Layer Features
  useEffect(() => {
    const source = imperviousnessVectorSourceRef.current;
    source.clear();

    if (!showImperviousnessLayer) return;

    fetchLiveImperviousnessData(selectedCityId)
      .then(telemetry => {
        setImperviousnessData(telemetry);
        const gridCells = telemetry.gridCells || [];

        gridCells.forEach(cell => {
          const lat = cell.lat;
          const lng = cell.lng;
          const step = 0.015;

          const minPt = fromLonLat([lng - step, lat - step]);
          const maxPt = fromLonLat([lng + step, lat + step]);

          const ring = [
            [minPt[0], minPt[1]],
            [maxPt[0], minPt[1]],
            [maxPt[0], maxPt[1]],
            [minPt[0], maxPt[1]],
            [minPt[0], minPt[1]]
          ];

          const feature = new Feature({
            geometry: new Polygon([ring]),
            type: 'imperviousness_cell',
            imperviousnessFraction: cell.imperviousnessFraction,
            imperviousnessPct: Math.round(cell.imperviousnessFraction * 100)
          });

          // Distinct Violet-to-Amber Color Ramp (Completely distinct from Flood Depth Blues/Reds)
          let color = 'rgba(209, 250, 229, 0.15)'; // < 40% (light emerald)
          if (cell.imperviousnessFraction >= 0.85) {
            color = 'rgba(88, 28, 135, 0.55)'; // >=85% (deep dark violet / indigo)
          } else if (cell.imperviousnessFraction >= 0.70) {
            color = 'rgba(124, 58, 237, 0.40)'; // 70-85% (vivid purple)
          } else if (cell.imperviousnessFraction >= 0.40) {
            color = 'rgba(167, 139, 250, 0.25)'; // 40-70% (light violet)
          }

          feature.setStyle(
            new Style({
              fill: new Fill({ color }),
              stroke: new Stroke({ color: 'rgba(139, 92, 246, 0.2)', width: 0.8 })
            })
          );

          source.addFeature(feature);
        });
      })
      .catch(() => {});
  }, [selectedCityId, showImperviousnessLayer]);

  // Update Historical Impact Annotation Markers Layer Features
  useEffect(() => {
    const source = pinsVectorSourceRef.current;
    source.clear();

    if (!historicalImpactMarkers || historicalImpactMarkers.length === 0) return;

    historicalImpactMarkers.forEach(m => {
      const coord = fromLonLat([m.lng, m.lat]);
      const feature = new Feature({
        geometry: new Point(coord),
        type: 'historical_impact_marker',
        hotspotName: m.hotspotName,
        boroughOrZone: m.boroughOrZone,
        recordedDepthRangeCm: m.recordedDepthRangeCm,
        impactDescription: m.impactDescription,
      });

      // Distinct Purple/Gold Historical Annotation Pin Style
      feature.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: 'rgba(124, 58, 237, 0.25)' }),
            stroke: new Stroke({ color: '#f59e0b', width: 2, lineDash: [3, 3] })
          })
        }),
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: '#7c3aed' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: `HISTORICAL: ${m.recordedDepthRangeCm[0]}-${m.recordedDepthRangeCm[1]}cm`,
            font: 'bold 9.5px sans-serif',
            fill: new Fill({ color: '#581c87' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            offsetY: -16
          })
        })
      ]);

      source.addFeature(feature);
    });
  }, [historicalImpactMarkers]);

  // Update Authentic Real Waterways & Drainage Canals Vector Layer
  useEffect(() => {
    const source = drainageVectorSourceRef.current;
    source.clear();

    if (!showDrainageLayer) return;

    const dataset = getRealWaterwaysDataset(selectedCityId, timeOffsetMins);

    dataset.waterways.forEach(w => {
      const coords = w.coordinates.map(pt => fromLonLat([pt[1], pt[0]]));
      const waterwayFeature = new Feature({
        geometry: new LineString(coords),
        type: 'real_waterway',
        id: w.id,
        name: w.name,
        category: w.category,
        widthMeters: w.widthMeters,
        currentFlowLps: w.currentFlowLps,
        surchargePct: w.surchargePct,
        description: w.description
      });

      let strokeColor = '#0284c7';
      let strokeWidth = Math.max(3, Math.min(10, w.widthMeters / 6));

      if (w.category === 'river') {
        strokeColor = '#0369a1';
        strokeWidth = 9;
      } else if (w.surchargePct >= 100) {
        strokeColor = '#dc2626';
      } else if (w.surchargePct >= 70) {
        strokeColor = '#d97706';
      }

      waterwayFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: strokeColor,
            width: strokeWidth,
            lineCap: 'round',
            lineJoin: 'round'
          })
        })
      );

      source.addFeature(waterwayFeature);

      // Render Outfall Gate Pin at the endpoint of the waterway
      if (coords.length > 0) {
        const lastCoord = coords[coords.length - 1];
        const outfallFeature = new Feature({
          geometry: new Point(lastCoord),
          type: 'real_outfall',
          name: `${w.name} Outfall Gate`,
          capacityLps: w.capacityLps,
          surchargePct: w.surchargePct
        });

        outfallFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: '#312e81' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 })
            })
          })
        );

        source.addFeature(outfallFeature);
      }
    });

    // Render SCADA Dewatering Pumping Stations
    const pumpingStations = getPumpingStationsForCity(selectedCityId);
    pumpingStations.forEach(st => {
      const coord = fromLonLat([st.lng, st.lat]);
      const pumpFeature = new Feature({
        geometry: new Point(coord),
        type: 'pumping_station',
        name: st.name,
        locationName: st.locationName,
        capacityLps: st.capacityLps,
        currentDischargeLps: st.currentDischargeLps,
        activePumpsCount: st.activePumpsCount,
        totalPumpsCount: st.totalPumpsCount,
        powerStatus: st.powerStatus,
        scadaMode: st.scadaMode,
        isOperational: st.isOperational,
        description: st.description
      });

      pumpFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8.5,
            fill: new Fill({ color: st.isOperational ? '#059669' : '#64748b' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 })
          }),
          text: new Text({
            text: st.name.split(' ')[0],
            font: 'bold 9.5px sans-serif',
            fill: new Fill({ color: '#0f172a' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            offsetY: -14
          })
        })
      );

      source.addFeature(pumpFeature);
    });
  }, [selectedCityId, timeOffsetMins, showDrainageLayer]);

  // Update Authentic OSM Road Network Flood Overlay
  useEffect(() => {
    const source = roadsVectorSourceRef.current;
    source.clear();

    if (!showRoadsLayer) return;

    const snapshotData = hydraulicSnapshotOverride || getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);

    fetch(`/data/${selectedCityId}-osm-roads.geojson`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data || !data.features) return;

        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: mapRef.current?.getView().getProjection() || 'EPSG:3857'
        });

        features.forEach(f => {
          const props = f.getProperties();
          const roadName = props.name || 'Local Corridor';
          const isGalli = props.isGalli || ['residential', 'service', 'unclassified', 'living_street'].includes(props.highway);

          // Sample flood depth from simulation matching road name or near hydraulic manholes
          let waterDepthCm = 0;
          const { roads: cityRoads } = getCityDataset(selectedCityId);
          const matchedState = snapshotData.roadStates.find(r => r.roadId === String(props.osmid));

          if (matchedState) {
            waterDepthCm = matchedState.waterDepthCm;
          } else {
            const matchedRoad = cityRoads.find(r =>
              r.id === String(props.osmid) ||
              r.name.toLowerCase().includes(roadName.toLowerCase()) ||
              (roadName.length > 4 && roadName.toLowerCase().includes(r.name.toLowerCase()))
            );
            if (matchedRoad) {
              const state = snapshotData.roadStates.find(r => r.roadId === matchedRoad.id);
              if (state) waterDepthCm = state.waterDepthCm;
            }
          }

          if (waterDepthCm === 0) {
            // Check proximity to overflowing physics manholes
            const extent = f.getGeometry()?.getExtent();
            if (extent) {
              const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
              const lonLat = toLonLat(center);
              for (const mh of snapshotData.physicsManholes || []) {
                if (mh.surfaceOverflowDepthCm > 0) {
                  const d = Math.abs(mh.lat - lonLat[1]) + Math.abs(mh.lng - lonLat[0]);
                  if (d < 0.005) { // ~500m radius
                    waterDepthCm = Math.max(waterDepthCm, Math.round(mh.surfaceOverflowDepthCm * 0.7));
                  }
                }
              }
            }
          }

          let severity: 'safe' | 'warning' | 'critical' | 'severe' = 'safe';
          if (waterDepthCm >= 40) severity = 'severe';
          else if (waterDepthCm >= 20) severity = 'critical';
          else if (waterDepthCm >= 8) severity = 'warning';

          f.setProperties({
            type: 'road',
            id: String(props.osmid || Math.random()),
            name: roadName,
            borough: 'Municipal District',
            highwayCategory: props.highwayCategory || (isGalli ? 'Galli / Local Lane' : 'Municipal Thoroughfare'),
            isGalli,
            waterDepthCm,
            severity,
            demElevationMeters: 2.5
          });
        });

        source.addFeatures(features);
      })
      .catch(() => {});
  }, [selectedCityId, timeOffsetMins, showRoadsLayer, hydraulicSnapshotOverride]);

  // Update Physics-Derived Manholes Vector Layer
  useEffect(() => {
    const source = manholesVectorSourceRef.current;
    source.clear();

    if (!showManholesLayer) return;

    const manholes = hydraulicSnapshotOverride?.physicsManholes || getPhysicsDerivedManholes(selectedCityId, timeOffsetMins);

    manholes.forEach(mh => {
      const coord = fromLonLat([mh.lng, mh.lat]);

      const mhFeature = new Feature({
        geometry: new Point(coord),
        type: 'physics_manhole',
        id: mh.id,
        name: mh.name,
        roadId: mh.roadId,
        roadName: mh.roadName,
        highwayCategory: mh.highwayCategory,
        isGalli: mh.isGalli,
        derivedLocationLabel: mh.derivedLocationLabel,
        rimElevationMeters: mh.rimElevationMeters,
        invertDepthMeters: mh.invertDepthMeters,
        pipeDiameterMm: mh.pipeDiameterMm,
        pipeSlopePct: mh.pipeSlopePct,
        capacityLps: mh.capacityLps,
        inflowRunoffLps: mh.inflowRunoffLps,
        upstreamRunoffLps: mh.upstreamRunoffLps,
        hydraulicCapacityPct: mh.hydraulicCapacityPct,
        surchargeHeadMeters: mh.surchargeHeadMeters,
        surfaceOverflowDepthCm: mh.surfaceOverflowDepthCm,
        overflowRateLps: mh.overflowRateLps,
        backpressureFactor: mh.backpressureFactor,
        status: mh.status
      });

      source.addFeature(mhFeature);
    });
  }, [selectedCityId, timeOffsetMins, showManholesLayer, hydraulicSnapshotOverride]);

  // Update Evacuation Zones (Flood-Prone Catchments & Underpasses)
  useEffect(() => {
    const source = evacuationVectorSourceRef.current;
    source.clear();

    if (!showEvacuationLayer) return;

    const zones = getEvacuationZonesForCity(selectedCityId, timeOffsetMins, hydraulicSnapshotOverride);
    zones.forEach(zone => {
      // Show active zones or zones with notable depth
      if (!zone.active && zone.waterDepthCm < 15) return;

      const ring = zone.boundary.map(coord => fromLonLat([coord[1], coord[0]]));
      const zoneFeature = new Feature({
        geometry: new Polygon([ring]),
        type: 'evacuation_zone',
        id: zone.id,
        name: zone.name,
        borough: zone.borough,
        severity: zone.severity,
        waterDepthCm: zone.waterDepthCm,
        overflowingManholesCount: zone.overflowingManholesCount,
        evacueePopulation: zone.evacueePopulation,
        description: zone.description
      });

      const isExtreme = zone.severity === 'severe' || zone.waterDepthCm >= 40;

      zoneFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: isExtreme ? 'rgba(220, 38, 38, 0.9)' : 'rgba(234, 88, 12, 0.85)',
            width: 2.5,
            lineDash: [8, 5]
          }),
          fill: new Fill({
            color: isExtreme ? 'rgba(239, 68, 68, 0.18)' : 'rgba(249, 115, 22, 0.14)'
          }),
          text: new Text({
            text: `${zone.name}\nDepth: ${zone.waterDepthCm}cm • At-Risk: ${zone.evacueePopulation.toLocaleString()}`,
            font: 'bold 9.5px sans-serif',
            fill: new Fill({ color: isExtreme ? '#991b1b' : '#9a3412' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            overflow: true
          })
        })
      );

      source.addFeature(zoneFeature);
    });
  }, [selectedCityId, timeOffsetMins, showEvacuationLayer, hydraulicSnapshotOverride]);

  // Update Safe Assembly Shelters (High-Elevation Municipal Relief Centers)
  useEffect(() => {
    const source = sheltersVectorSourceRef.current;
    source.clear();

    if (!showEvacuationLayer) return;

    const shelters = SAFE_ASSEMBLY_SHELTERS[selectedCityId] || [];
    shelters.forEach(shelter => {
      const coord = fromLonLat([shelter.coordinates[1], shelter.coordinates[0]]);
      const shelterFeature = new Feature({
        geometry: new Point(coord),
        type: 'safe_shelter',
        id: shelter.id,
        name: shelter.name,
        address: shelter.address,
        elevationMeters: shelter.elevationMeters,
        capacityPersons: shelter.capacityPersons,
        facilities: shelter.facilities,
        contactEmergency: shelter.contactEmergency
      });

      shelterFeature.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 14,
            fill: new Fill({ color: 'rgba(16, 185, 129, 0.22)' }),
            stroke: new Stroke({ color: 'rgba(5, 150, 105, 0.6)', width: 1.5 })
          })
        }),
        new Style({
          image: new CircleStyle({
            radius: 7.5,
            fill: new Fill({ color: '#059669' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: `${shelter.name.split(' ')[0]} (+${shelter.elevationMeters}m)`,
            font: 'bold 9.5px sans-serif',
            fill: new Fill({ color: '#064e3b' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            offsetY: -15
          })
        })
      ]);

      source.addFeature(shelterFeature);
    });
  }, [selectedCityId, showEvacuationLayer]);

  // Update Chronic Flood Hotspots & Subways Vector Layer
  useEffect(() => {
    const source = hotspotsVectorSourceRef.current;
    source.clear();

    if (!showHotspotsLayer) return;

    fetch(`/data/${selectedCityId}-flood-hotspots.geojson`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data || !data.features) return;
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: mapRef.current?.getView().getProjection() || 'EPSG:3857'
        });

        features.forEach(f => {
          const props = f.getProperties();
          const category = props.category || 'flooding_spot';
          let color = '#ea580c'; // flooding_spot orange
          let label = 'Flooding Spot';

          if (category === 'chronic_spot') {
            color = '#dc2626'; // chronic orange
            label = 'Chronic Flood Spot';
          } else if (category === 'subway') {
            color = '#2563eb'; // subway blue
            label = 'Flood-Prone Subway';
          }

          f.setProperties({
            type: 'flood_hotspot',
            category,
            categoryLabel: props.category_label || label,
            name: props.name || label,
            ward: props.ward,
            location: props.location
          });

          f.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 7,
                fill: new Fill({ color }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              }),
              text: new Text({
                text: props.name || label,
                font: 'bold 9.5px sans-serif',
                fill: new Fill({ color: '#0f172a' }),
                stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
                offsetY: -14
              })
            })
          );
        });

        source.addFeatures(features);
      })
      .catch(() => {});
  }, [selectedCityId, showHotspotsLayer]);

  // Update Historic Deluge Benchmark Vector Layer (2005 / 2023 Extremes)
  useEffect(() => {
    const source = deluge2005VectorSourceRef.current;
    source.clear();

    if (!showDeluge2005Layer) return;

    const delugeFile =
      selectedCityId === 'delhi'
        ? '/geojson/delhi-flood-2023-hotspots.geojson'
        : selectedCityId === 'chennai'
        ? '/geojson/chennai-flood-2005-hotspots.geojson'
        : '/geojson/mumbai-flood-2005-hotspots.geojson';

    fetch(delugeFile)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data || !data.features) return;
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: mapRef.current?.getView().getProjection() || 'EPSG:3857'
        });

        features.forEach(f => {
          const props = f.getProperties();
          f.setProperties({
            type: 'deluge_2005',
            name: props.name || '2005 Deluge High Water Mark',
            depthLabel: props.depth_label,
            note: props.note
          });

          f.setStyle(
            new Style({
              image: new CircleStyle({
                radius: 8,
                fill: new Fill({ color: '#f59e0b' }),
                stroke: new Stroke({ color: '#78350f', width: 2 })
              }),
              text: new Text({
                text: `2005: ${props.depth_label || 'High Water'}`,
                font: 'bold 9.5px sans-serif',
                fill: new Fill({ color: '#78350f' }),
                stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
                offsetY: -15
              })
            })
          );
        });

        source.addFeatures(features);
      })
      .catch(() => {});
  }, [selectedCityId, showDeluge2005Layer]);

  // Update Ward Groundwater Depth IDW Vector Layer
  useEffect(() => {
    const source = groundwaterVectorSourceRef.current;
    source.clear();

    if (!showGroundwaterLayer) return;

    const wardFile = selectedCityId === 'mumbai' ? '/geojson/mumbai-wards-2023.geojson' : selectedCityId === 'delhi' ? '/geojson/delhi-districts.geojson' : '/geojson/chennai-wards-2022.geojson';

    Promise.all([
      fetch(wardFile).then(r => (r.ok ? r.json() : null)),
      fetch(`/api/groundwater?city=${selectedCityId}`).then(r => (r.ok ? r.json() : null))
    ]).then(([wardsGeoJson, gwApiData]) => {
      if (!wardsGeoJson || !wardsGeoJson.features) return;

      const format = new GeoJSON();
      const features = format.readFeatures(wardsGeoJson, {
        dataProjection: 'EPSG:4326',
        featureProjection: mapRef.current?.getView().getProjection() || 'EPSG:3857'
      });

      const wardMap: Record<number, any> = {};
      (gwApiData?.wards || []).forEach((w: any) => {
        wardMap[Number(w.wardNumber)] = w;
      });

      features.forEach(f => {
        const props = f.getProperties();
        const wardNo = Number(props.ward_no || props.ward_id || props.FID);
        const wardData = wardMap[wardNo];
        const depthM = wardData?.depthM ?? null;
        const fillColor = getGroundwaterColor(depthM);

        f.setProperties({
          type: 'groundwater_ward',
          wardNumber: wardNo,
          wardName: wardData?.wardName || props.ward_label || `Ward ${wardNo}`,
          depthM,
          category: wardData?.category || 'moderate'
        });

        f.setStyle(
          new Style({
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: '#334155', width: 1.2 })
          })
        );
      });

      source.addFeatures(features);

      // Render CGWB Station Pins
      const stations = gwApiData?.stations || [];
      stations.forEach((well: any) => {
        const reading = well.readings?.[well.readings.length - 1];
        if (!reading) return;
        const depth = Math.abs(reading.depth_m_bgl);
        const coord = fromLonLat([well.lng || well.lon, well.lat]);

        const wellFeature = new Feature({
          geometry: new Point(coord),
          type: 'groundwater_well',
          name: well.name,
          depthMeters: depth,
          readingDate: `${reading.month}/${reading.year}`
        });

        wellFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 5,
              fill: new Fill({ color: getGroundwaterColor(depth) }),
              stroke: new Stroke({ color: '#0f172a', width: 1.5, lineDash: [2, 2] })
            })
          })
        );

        source.addFeature(wellFeature);
      });
    }).catch(() => {});
  }, [selectedCityId, showGroundwaterLayer]);

  // Update Active Route Layer Features (Vehicle-Aware Segment Risk & Evacuation Styling)
  useEffect(() => {
    const source = routeVectorSourceRef.current;
    source.clear();

    if (!showRouteLayer || !activeRoute) return;

    const enhanced = activeRoute as EnhancedNavigationRoute;
    const isBlocked = enhanced.isBlocked;
    const isEvacuation =
      enhanced.name?.toLowerCase().includes('evacuation') ||
      enhanced.id?.includes('evac') ||
      enhanced.vehicleType === 'pedestrian';

    // 1. Render Segment-Level Risk Polylines if available
    if (enhanced.segments && enhanced.segments.length > 0) {
      enhanced.segments.forEach((seg) => {
        const coords = seg.coordinates.map(pt => fromLonLat([pt[1], pt[0]]));
        if (coords.length < 2) return;

        const segFeature = new Feature({
          geometry: new LineString(coords),
          type: 'route_segment',
          roadName: seg.roadName,
          highwayCategory: seg.highwayCategory,
          waterDepthCm: seg.waterDepthCm,
          riskSeverity: seg.riskSeverity,
          isPassable: seg.isPassable
        });

        let strokeColor = '#059669'; // Safe
        let strokeWidth = isEvacuation ? 7 : 6;
        let lineDash: number[] | undefined = undefined;

        if (seg.riskSeverity === 'severe' || !seg.isPassable) {
          strokeColor = '#dc2626'; // Impassable
          strokeWidth = 7.5;
          lineDash = [6, 4];
        } else if (seg.riskSeverity === 'critical') {
          strokeColor = '#ea580c'; // Critical
          strokeWidth = 7;
        } else if (seg.riskSeverity === 'warning') {
          strokeColor = '#d97706'; // Warning
          strokeWidth = 6.5;
        }

        segFeature.setStyle([
          ...(isEvacuation
            ? [
                new Style({
                  stroke: new Stroke({
                    color: strokeColor === '#dc2626' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                    width: strokeWidth + 6
                  })
                })
              ]
            : []),
          new Style({
            stroke: new Stroke({
              color: strokeColor,
              width: strokeWidth,
              lineDash,
              lineCap: 'round',
              lineJoin: 'round'
            })
          })
        ]);

        source.addFeature(segFeature);
      });
    } else {
      // Fallback single line
      const coordinates = activeRoute.coordinates.map(coord => fromLonLat([coord[1], coord[0]]));
      const routeFeature = new Feature({
        geometry: new LineString(coordinates),
        type: 'route',
        name: activeRoute.name,
        isSafe: activeRoute.isSafe,
        maxDepthCm: activeRoute.maxWaterDepthCm
      });

      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: isBlocked ? '#dc2626' : (activeRoute.isSafe ? '#059669' : '#dc2626'),
            width: 6,
            lineDash: isBlocked || !activeRoute.isSafe ? [8, 4] : undefined,
            lineCap: 'round',
            lineJoin: 'round'
          })
        })
      );

      source.addFeature(routeFeature);
    }

    // 2. Terminal Markers (Start Departure & Destination Refuge)
    if (activeRoute.coordinates && activeRoute.coordinates.length > 1) {
      const startCoord = fromLonLat([activeRoute.coordinates[0][1], activeRoute.coordinates[0][0]]);
      const startPoint = new Feature({
        geometry: new Point(startCoord),
        type: 'route_node'
      });
      startPoint.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 7.5,
            fill: new Fill({ color: '#10b981' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: 'START',
            font: 'bold 9px sans-serif',
            fill: new Fill({ color: '#064e3b' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            offsetY: -13
          })
        })
      );
      source.addFeature(startPoint);

      const lastIdx = activeRoute.coordinates.length - 1;
      const endCoord = fromLonLat([activeRoute.coordinates[lastIdx][1], activeRoute.coordinates[lastIdx][0]]);
      const endPoint = new Feature({
        geometry: new Point(endCoord),
        type: 'route_node'
      });
      endPoint.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8.5,
            fill: new Fill({ color: isEvacuation ? '#059669' : '#2563eb' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: isEvacuation ? 'REFUGE' : 'DEST',
            font: 'bold 9px sans-serif',
            fill: new Fill({ color: isEvacuation ? '#064e3b' : '#1e3a8a' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            offsetY: -14
          })
        })
      );
      source.addFeature(endPoint);
    }
  }, [activeRoute, showRouteLayer]);

  // Update Citizen Reports Features
  useEffect(() => {
    const source = reportsVectorSourceRef.current;
    source.clear();

    if (!showReportsLayer) return;

    citizenReports.forEach(report => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([report.lng, report.lat])),
        type: 'report',
        id: report.id,
        locationName: report.locationName,
        waterDepthCm: report.waterDepthCm,
        userNote: report.userNote
      });

      source.addFeature(feature);
    });
  }, [citizenReports, showReportsLayer]);

  // Update Citizen Signals & Traffic Desk Vector Layer Features
  useEffect(() => {
    const source = signalsVectorSourceRef.current;
    source.clear();

    if (!showSignalsLayer) return;

    const signals = getCitizenSignals(selectedCityId);

    signals.forEach(sig => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([sig.longitude, sig.latitude])),
        type: 'citizen_signal',
        id: sig.id,
        title: sig.title,
        description: sig.description,
        issueType: sig.issueType,
        status: sig.status,
        upvotes: sig.upvotes,
        nearestManholeId: sig.nearestManholeId,
        severityRatio: sig.severityRatio
      });

      let svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#ea580c' stroke='#ffffff' stroke-width='2'/><path d='M12 8v5M12 15.5v1' stroke='white' stroke-width='2.5' stroke-linecap='round'/></svg>";
      let pinColor = '#ea580c';
      if (sig.issueType === 'blocked_inlet') {
        pinColor = '#dc2626';
        svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#dc2626' stroke='#ffffff' stroke-width='2'/><path d='M6 6h12M6 9h12M6 12h12M6 15h12' stroke='white' stroke-width='1.5'/></svg>";
      }
      else if (sig.issueType === 'drain_overflow') {
        pinColor = '#991b1b';
        svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#991b1b' stroke='#ffffff' stroke-width='2'/><path d='M5 13c2-4 12-4 14 0M5 10c2-4 12-4 14 0' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/></svg>";
      }
      else if (sig.issueType === 'sewer_backflow') {
        pinColor = '#7e22ce';
        svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#7e22ce' stroke='#ffffff' stroke-width='2'/><path d='M12 5v14M8 9l4-4 4 4' stroke='white' stroke-width='2' stroke-linecap='round' fill='none'/></svg>";
      }

      const iconUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgCode);

      feature.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: 'rgba(239, 68, 68, 0.2)' }),
            stroke: new Stroke({ color: pinColor, width: 1.5, lineDash: [3, 3] })
          })
        }),
        new Style({
          image: new Icon({ src: iconUrl, scale: 0.85 }),
          text: new Text({
            text: sig.title.split(' ')[0],
            font: 'bold 9.5px sans-serif',
            fill: new Fill({ color: '#7f1d1d' }),
            stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
            offsetY: -14
          })
        })
      ]);

      source.addFeature(feature);
    });
  }, [selectedCityId, showSignalsLayer]);

  // Render Interactive Pinned Markers (Start Origin A & Destination Refuge B)
  useEffect(() => {
    const source = pinsVectorSourceRef.current;
    source.clear();

    if (pinnedOrigin) {
      const coord = fromLonLat([pinnedOrigin[1], pinnedOrigin[0]]);
      const originPoint = new Feature({
        geometry: new Point(coord),
        type: 'pinned_origin'
      });

      originPoint.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 16,
            fill: new Fill({ color: 'rgba(16, 185, 129, 0.25)' }),
            stroke: new Stroke({ color: 'rgba(16, 185, 129, 0.6)', width: 2 })
          })
        }),
        new Style({
          image: new Icon({
            src: 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='22' height='30' viewBox='0 0 22 30'><path d='M11 0C5 0 0 5 0 11c0 7.7 11 19 11 19S22 18.7 22 11C22 5 17 0 11 0z' fill='#16a34a' stroke='#fff' stroke-width='2'/><circle cx='11' cy='11' r='4.5' fill='white'/></svg>"),
            anchor: [0.5, 1.0],
            scale: 1.0
          }),
          text: new Text({
            text: 'START (A)',
            font: 'bold 10px sans-serif',
            fill: new Fill({ color: '#064e3b' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            offsetY: -35
          })
        })
      ]);

      source.addFeature(originPoint);
    }

    if (pinnedDestination) {
      const coord = fromLonLat([pinnedDestination[1], pinnedDestination[0]]);
      const destPoint = new Feature({
        geometry: new Point(coord),
        type: 'pinned_destination'
      });

      destPoint.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 16,
            fill: new Fill({ color: 'rgba(239, 68, 68, 0.25)' }),
            stroke: new Stroke({ color: 'rgba(239, 68, 68, 0.6)', width: 2 })
          })
        }),
        new Style({
          image: new Icon({
            src: 'data:image/svg+xml;utf8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='22' height='30' viewBox='0 0 22 30'><path d='M11 0C5 0 0 5 0 11c0 7.7 11 19 11 19S22 18.7 22 11C22 5 17 0 11 0z' fill='#ea580c' stroke='#fff' stroke-width='2'/><circle cx='11' cy='11' r='4.5' fill='white'/></svg>"),
            anchor: [0.5, 1.0],
            scale: 1.0
          }),
          text: new Text({
            text: 'DEST (B)',
            font: 'bold 10px sans-serif',
            fill: new Fill({ color: '#7f1d1d' }),
            stroke: new Stroke({ color: '#ffffff', width: 3 }),
            offsetY: -35
          })
        })
      ]);

      source.addFeature(destPoint);
    }
  }, [pinnedOrigin, pinnedDestination]);

  // Fly to Selected Feature (from AlertFeed or DrainageGraphPanel)
  useEffect(() => {
    if (!selectedFeatureId || !mapRef.current || !overlayRef.current) return;

    if (selectedFeatureId.startsWith('physics-mh-') || selectedFeatureId.startsWith('mh-')) {
      const manholes = hydraulicSnapshotOverride?.physicsManholes || getPhysicsDerivedManholes(selectedCityId, timeOffsetMins);
      const mh = manholes.find(m => m.id === selectedFeatureId);
      if (mh) {
        const coord = fromLonLat([mh.lng, mh.lat]);
        mapRef.current.getView().animate({ center: coord, zoom: 17, duration: 600 });
        const isOverflowing = mh.surfaceOverflowDepthCm > 0;
        const isWarning = mh.hydraulicCapacityPct >= 70;
        let statusColor = 'text-green-700';
        if (isOverflowing) statusColor = 'text-orange-600 font-bold';
        else if (isWarning) statusColor = 'text-orange-600 font-bold';

        setPopupContent({
          title: mh.name,
          subtitle: mh.derivedLocationLabel,
          badge: {
            text: mh.isGalli ? 'Galli Catchpit' : 'Roadway Manhole',
            color: mh.isGalli ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-800'
          },
          details: [
            { label: 'Road / Galli', value: mh.roadName, color: 'text-gray-800 font-semibold' },
            { label: 'Rim Alt (z_rim)', value: `${mh.rimElevationMeters} m MSL` },
            { label: 'Pipe Diameter', value: `Ø${mh.pipeDiameterMm}mm (${mh.pipeSlopePct}% slope)` },
            { label: 'Hydraulic Capacity', value: `${mh.capacityLps} L/s` },
            { label: 'Inflow Runoff', value: `${mh.inflowRunoffLps} L/s` },
            { label: 'Hydraulic Load', value: `${mh.hydraulicCapacityPct}%`, color: statusColor },
            {
              label: 'Surcharge Status',
              value: isOverflowing ? `+${mh.surfaceOverflowDepthCm} cm (STREET OVERFLOW)` : '0 cm (Contained)',
              color: isOverflowing ? 'text-orange-600 font-bold' : 'text-green-700'
            }
          ]
        });
        overlayRef.current.setPosition(coord);
      }
        } else if (selectedFeatureId.startsWith('sig-')) {
      const signals = getCitizenSignals(selectedCityId);
      const sig = signals.find(s => s.id === selectedFeatureId);
      if (sig) {
        const coord = fromLonLat([sig.longitude, sig.latitude]);
        mapRef.current.getView().animate({ center: coord, zoom: 18, duration: 600 });
        setPopupContent({
          title: sig.title,
          subtitle: `Severity: ${(sig.severityRatio * 100).toFixed(0)}%`,
          badge: { text: 'Citizen Signal', color: 'bg-red-100 text-red-800' },
          details: [
            { label: 'Issue', value: sig.issueType },
            { label: 'Description', value: sig.description },
            { label: 'Status', value: sig.status }
          ]
        });
        overlayRef.current.setPosition(coord);
      }
    } else if (selectedFeatureId.startsWith('lake-') || selectedFeatureId.startsWith('gate-') || selectedFeatureId.startsWith('tank-')) {
      const WATER_BODIES_COORDS: Record<string, [number, number]> = {
        'lake-powai': [19.1278, 72.9044],
        'lake-vihar': [19.1557, 72.9056],
        'lake-tulsi': [19.1866, 72.9126],
        'tank-chembur': [19.0531, 72.8988],
        'gate-worli': [19.0145, 72.8123],
        'gate-haji-ali': [18.9830, 72.8090],
        'gate-mahim': [19.0435, 72.8390],
        'gate-sion': [19.0390, 72.8620]
      };
      
      const loc = WATER_BODIES_COORDS[selectedFeatureId];
      if (loc) {
        const coord = fromLonLat([loc[1], loc[0]]);
        mapRef.current.getView().animate({ center: coord, zoom: 15, duration: 600 });
        setPopupContent({
          title: selectedFeatureId.replace(/-/g, ' ').toUpperCase(),
          subtitle: 'Water Atlas Asset',
          badge: { text: 'Infrastructure', color: 'bg-sky-100 text-sky-800' },
          details: [{ label: 'Coordinates', value: `${loc[0].toFixed(4)}, ${loc[1].toFixed(4)}` }]
        });
        overlayRef.current.setPosition(coord);
      }
    } else {
      const { roads } = getCityDataset(selectedCityId);
      const road = roads.find(r => r.id === selectedFeatureId);
      if (road && road.coordinates.length > 0) {
        const midIdx = Math.floor(road.coordinates.length / 2);
        const midCoord = road.coordinates[midIdx];
        const coord = fromLonLat([midCoord[1], midCoord[0]]);
        mapRef.current.getView().animate({ center: coord, zoom: 16, duration: 600 });
        const snapshotData = hydraulicSnapshotOverride || getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
        const roadState = snapshotData.roadStates.find(r => r.roadId === road.id);
        const depthCm = roadState ? roadState.waterDepthCm : 0;
        const severity = roadState ? roadState.severity : 'safe';
        const isCritical = depthCm >= 20;
        const isWarning = depthCm >= 8;
        const isGalli = road.highwayCategory === 'Galli / Local Lane' || road.id.startsWith('galli-');

        setPopupContent({
          title: road.name,
          subtitle: `Borough: ${road.borough} • DEM Alt: ${road.demElevationMeters}m MSL`,
          badge: {
            text: isGalli ? 'Galli / Local Lane' : (road.highwayCategory || 'Arterial Corridor'),
            color: isGalli ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-800'
          },
          details: [
            {
              label: 'Water Depth',
              value: `${depthCm} cm`,
              color: isCritical ? 'text-orange-600 font-bold' : isWarning ? 'text-orange-600 font-bold' : 'text-green-700'
            },
            {
              label: 'Severity Level',
              value: severity.toUpperCase(),
              color: isCritical ? 'text-orange-600 font-bold' : isWarning ? 'text-orange-600 font-bold' : 'text-green-700'
            },
            {
              label: 'Corridor Passability',
              value: depthCm >= 35 ? 'IMPASSABLE / CLOSED' : depthCm >= 15 ? 'HIGH-CLEARANCE ONLY' : 'OPEN TO TRAFFIC'
            }
          ]
        });
        overlayRef.current.setPosition(coord);
      }
    }
  }, [selectedFeatureId, selectedCityId, timeOffsetMins, hydraulicSnapshotOverride]);

  // Overall Status Bar Color Classes
  const statusStyles = {
    severe: {
      dot: 'bg-orange-500 animate-ping',
      border: 'border-orange-300 dark:border-orange-700 bg-orange-50/90 dark:bg-gray-900/90 text-orange-900 dark:text-orange-300',
      badge: 'bg-orange-600 text-white',
      label: 'SEVERE FLOOD EMERGENCY'
    },
    critical: {
      dot: 'bg-orange-500 animate-pulse',
      border: 'border-orange-300 dark:border-orange-700 bg-orange-50/90 dark:bg-gray-900/90 text-orange-950 dark:text-orange-300',
      badge: 'bg-orange-600 text-white',
      label: 'CRITICAL INUNDATION WATCH'
    },
    warning: {
      dot: 'bg-orange-500',
      border: 'border-orange-300 dark:border-orange-700 bg-orange-50/90 dark:bg-gray-900/90 text-orange-950 dark:text-orange-300',
      badge: 'bg-orange-500 text-white',
      label: 'ELEVATED FLOOD ADVISORY'
    },
    normal: {
      dot: 'bg-green-500',
      border: 'border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-200',
      badge: 'bg-green-600 text-white',
      label: 'FLOOD RISK NORMAL'
    }
  }[overallRisk];

  const toggleAccordion = (key: string) => {
    setExpandedAccordion(prev => (prev === key ? null : key));
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-gray-200 shadow-xs select-none">
      {/* 1. OpenLayers Map Canvas Element */}
      <div ref={mapElementRef} className="w-full h-full z-0 bg-gray-100" />

      {/* Active Pin Picker Mode Notification Banner */}
      {routePinMode !== 'none' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-blue-500/50 flex items-center space-x-3 animate-pulse">
          <MapPin className={`w-5 h-5 ${routePinMode === 'origin' ? 'text-green-400' : 'text-orange-400'}`} />
          <span className="text-xs font-bold">
            Click anywhere on the map to set{' '}
            <span
              className={
                routePinMode === 'origin'
                  ? 'text-green-400 font-mono font-extrabold underline'
                  : 'text-orange-400 font-mono font-extrabold underline'
              }
            >
              {routePinMode === 'origin' ? 'Start Origin (A)' : 'Destination Refuge (B)'}
            </span>
          </span>
          <button
            onClick={() => setRoutePinMode && setRoutePinMode('none')}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all ml-1"
            title="Cancel Pin Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Primary At-a-Glance Flood Risk Status Bar (Top Center) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[94vw] pointer-events-auto">
        <div className={`flex items-center gap-2 md:gap-3 px-3.5 py-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all whitespace-nowrap overflow-hidden ${statusStyles.border}`}>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyles.dot}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${overallRisk === 'severe' ? 'bg-orange-600' : overallRisk === 'critical' ? 'bg-orange-600' : overallRisk === 'warning' ? 'bg-orange-500' : 'bg-green-600'}`} />
            </span>
            <span className="font-extrabold text-xs tracking-tight text-gray-800 dark:text-gray-100">
              {city.name}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusStyles.badge}`}>
              {statusStyles.label}
            </span>
            {activeEvacZones.length > 0 && (
              <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-orange-700 text-white text-[9.5px] font-extrabold uppercase tracking-wider animate-pulse shadow-sm">
                <span>{activeEvacZones.length} EVACUATION {activeEvacZones.length === 1 ? 'ZONE' : 'ZONES'}</span>
              </span>
            )}
          </div>

          {/* Quick Glancing Metrics */}
          <div className="hidden sm:flex items-center space-x-2 border-l border-gray-300/60 dark:border-gray-700 pl-2.5 text-[11px] font-mono shrink-0 whitespace-nowrap">
            <span className="text-gray-600 dark:text-gray-300">{snapshot.rainfallRateMmHr} mm/h</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className={overflowingCount > 0 ? 'text-orange-600 font-bold' : 'text-gray-600 dark:text-gray-300'}>
              {overflowingCount} Overflow
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            {activeEvacZones.length > 0 ? (
              <span className="text-orange-700 dark:text-orange-500 font-bold truncate max-w-[140px]">
                {activeEvacZones[0].name.split(' ')[0]} Evac
              </span>
            ) : (
              <span className={maxDepth >= 20 ? 'text-orange-600 dark:text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'}>
                Max: {maxDepth}cm
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Collapsible Side Drawer Trigger Button (Disabled - layers managed via sidebar GIS Map tab) */}
      {false && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="absolute top-3 right-3 z-20 flex items-center space-x-2 px-3 py-2 rounded-2xl bg-surface-card/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
          title="Open GIS Layers & Legend Manager"
        >
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Layers</span>
          <span className="px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30 font-mono text-[10px] font-bold">
            {activeLayersCount}/11
          </span>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* 4. Unified Slide-Out Sidebar Drawer (Disabled - layers managed via sidebar GIS Map tab) */}
      {false && (
        <div className="absolute top-3 right-3 z-30 w-80 md:w-84 max-h-[calc(100%-24px)] flex flex-col bg-surface-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-right-3 duration-200">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-surface-elevated shrink-0">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Layers</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 font-bold rounded-full border border-sky-300 dark:border-sky-500/30">
                {activeLayersCount}/11 Active
              </span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-lg transition-all"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="p-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
            {/* Base Map Selector (Segmented Control) */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block">
                Base Map Source
              </span>
              <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setBaseLayerType('osm')}
                  className={`py-1 px-1.5 rounded-lg font-bold text-[10.5px] transition-all ${
                    baseLayerType === 'osm'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  OSM
                </button>
                <button
                  onClick={() => setBaseLayerType('topo')}
                  className={`py-1 px-1.5 rounded-lg font-bold text-[10.5px] transition-all ${
                    baseLayerType === 'topo'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Topo
                </button>
                <button
                  onClick={() => setBaseLayerType('hot')}
                  className={`py-1 px-1.5 rounded-lg font-bold text-[10.5px] transition-all ${
                    baseLayerType === 'hot'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  HOT
                </button>
                <button
                  onClick={() => setBaseLayerType('satellite')}
                  className={`py-1 px-1.5 rounded-lg font-bold text-[10.5px] transition-all ${
                    baseLayerType === 'satellite'
                      ? 'bg-white text-blue-800 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Satellite
                </button>
              </div>
            </div>

            {/* Unified Layer Rows with Inline Accordion Legends */}
            <div className="space-y-2 pt-1">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider block">
                Map Layers & Legends
              </span>

              {/* 0a. Wind & Cloud Cover Layer */}
              <div className="border border-cyan-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center justify-between p-2.5 hover:bg-cyan-50/50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-cyan-600" />
                    <span className="font-semibold text-gray-800 text-[11.5px]">Wind & Weather</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showWindCloudLayer}
                      onChange={(e) => setShowWindCloudLayer(e.target.checked)}
                      className="accent-cyan-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('wind_cloud')}
                      className="text-gray-400 hover:text-gray-700 p-0.5"
                    >
                      {expandedAccordion === 'wind_cloud' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'wind_cloud' && (
                  <div className="px-3 pb-3 pt-1.5 border-t border-cyan-100 bg-cyan-50/30 space-y-2 text-[10.5px]">
                    {/* Live Telemetry Summary */}
                    {windCloudData && (
                      <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-cyan-200 shadow-2xs">
                        <div className="flex items-center space-x-1.5">
                          <Wind className="w-3.5 h-3.5 text-cyan-700" />
                          <span className="font-mono font-bold text-cyan-950">
                            {windCloudData?.windSpeedKmh} km/h {windCloudData?.windDirectionCardinal} ({windCloudData?.windDirectionDeg}°)
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-700 font-mono font-bold">
                          <Cloud className="w-3.5 h-3.5 text-slate-500" />
                          <span>{windCloudData?.cloudCoverPct}% Cloud</span>
                        </div>
                      </div>
                    )}

                    {/* Wind Speed Bands Key */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Wind Speed Bands</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                          <span className="text-gray-600">&lt;15 km/h Calm</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                          <span className="text-gray-600">15-30 km/h Breezy</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="text-gray-600">30-50 km/h Strong</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                          <span className="text-red-700 font-bold">&gt;50 km/h Severe</span>
                        </div>
                      </div>
                    </div>

                    {/* Cloud Cover Bands Key */}
                    <div className="space-y-1 pt-1 border-t border-cyan-200/60">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Cloud Cover Bands</span>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="flex items-center space-x-1 text-[10px] text-gray-600">
                          <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Clear (&lt;20%)</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-gray-600">
                          <Cloud className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>Partly (20-70%)</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-gray-600">
                          <CloudRain className="w-3 h-3 text-slate-600 shrink-0" />
                          <span>Overcast (&gt;70%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Feed Status Badge */}
                    <div className="pt-1.5 border-t border-cyan-200/60 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-gray-600">API Source:</span>
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] ${
                          windCloudData?.dataSourceStatus === 'live_windy' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          windCloudData?.dataSourceStatus === 'fallback_openmeteo' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                          windCloudData?.dataSourceStatus === 'offline_demo' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {windCloudData?.dataSourceStatus === 'live_windy' ? 'WINDY API (ACTIVE)' :
                           windCloudData?.dataSourceStatus === 'fallback_openmeteo' ? 'OPEN-METEO FALLBACK' :
                           windCloudData?.dataSourceStatus === 'offline_demo' ? 'WEATHER DATA BACKUP' : 'DATA UNAVAILABLE'}
                        </span>
                      </div>

                      {/* Solver Integration Hook Info */}
                      {windCloudData?.solverIntegrationHook && (
                        <div className="text-[9.5px] font-mono text-cyan-900 bg-white/90 p-1.5 rounded border border-cyan-200 space-y-0.5">
                          <div className="font-bold text-cyan-800">2D Hydraulic Solver Hook:</div>
                          <div>Wind-Driven Rain: x{windCloudData?.solverIntegrationHook?.windDrivenRainMultiplier}</div>
                          <div>Storm Surge Setup: +{windCloudData?.solverIntegrationHook?.coastalSurgeSetupMeters}m MSL</div>
                        </div>
                      )}
                      <div className="text-[9.5px] text-gray-400 font-mono italic">
                        Particle animation throttled at zoom &lt; 10.5 for 60 FPS performance.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 0b. BMC Chronic Flood Hotspots & Subways */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">High Risk Flood Spots</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showHotspotsLayer}
                      onChange={(e) => setShowHotspotsLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('hotspots')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'hotspots' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'hotspots' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-2 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-critical shrink-0" />
                        <span className="text-txt-secondary">Frequent Flooding Location</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                        <span className="text-txt-secondary">Underpass / Low Subway</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 0b. 26 July 2005 Extreme Deluge Benchmark */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">2005 Deluge Benchmark</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showDeluge2005Layer}
                      onChange={(e) => setShowDeluge2005Layer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('deluge2005')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'deluge2005' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'deluge2005' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-2 text-[10.5px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-status-severe border border-red-800 shrink-0" />
                      <span className="text-status-severe font-bold">26 July 2005 Historic High Water Marks</span>
                    </div>
                    <div className="text-[10px] text-txt-tertiary pt-1 border-t border-slate-800 font-mono">
                      944mm single-day extreme cloudburst benchmark data
                    </div>
                  </div>
                )}
              </div>

              {/* 0c. CGWB Groundwater Wards & Wells */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <Mountain className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Groundwater Depth & Wells</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showGroundwaterLayer}
                      onChange={(e) => setShowGroundwaterLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('groundwater')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'groundwater' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'groundwater' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-2 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-status-safe shrink-0" />
                        <span className="text-txt-secondary">0-3m Healthy</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-lime-500 shrink-0" />
                        <span className="text-txt-secondary">3-6m Moderate</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 shrink-0" />
                        <span className="text-txt-secondary">6-10m Declining</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-status-warning shrink-0" />
                        <span className="text-txt-secondary">10-15m Stressed</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-status-critical shrink-0" />
                        <span className="text-txt-secondary">15-25m Critical</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-status-severe shrink-0" />
                        <span className="text-txt-secondary">&gt;25m Crisis</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 1. Road Inundation Layer */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <Route className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Road Flood Levels</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showRoadsLayer}
                      onChange={(e) => setShowRoadsLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('roads')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'roads' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'roads' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-2 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-status-safe shrink-0" />
                        <span className="text-txt-secondary">&lt;8cm Safe</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-status-warning shrink-0" />
                        <span className="text-status-warning font-medium">8-20cm Warning</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-status-critical shrink-0" />
                        <span className="text-status-critical font-semibold">20-40cm Critical</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-status-severe shrink-0" />
                        <span className="text-status-severe font-bold">&gt;40cm Impassable</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Physics Manhole & Galli Graph Layer */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Drainage Overflow Points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showManholesLayer}
                      onChange={(e) => setShowManholesLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('manholes')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'manholes' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'manholes' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-2 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-safe shrink-0" />
                        <span className="text-txt-secondary">Normal Flow</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-warning shrink-0" />
                        <span className="text-txt-secondary">Filling Up</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-critical shrink-0" />
                        <span className="text-txt-secondary">Near Capacity</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-severe shrink-0 border border-red-300" />
                        <span className="text-status-severe font-bold">Water Overflowing</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Real Rivers & Drainage Canals Layer */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Rivers & Canals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showDrainageLayer}
                      onChange={(e) => setShowDrainageLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('drainage')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'drainage' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'drainage' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-1.5 text-[10.5px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-2 bg-sky-700 rounded-full" />
                        <span className="font-semibold text-txt-secondary">Major River</span>
                      </div>
                      <span className="text-txt-tertiary font-mono text-[10px]">Mithi / Yamuna / Adyar</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-1.5 bg-blue-600 rounded-full" />
                        <span className="font-semibold text-txt-secondary">Stormwater Drain</span>
                      </div>
                      <span className="text-status-safe font-mono text-[10px]">Normal Flow</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. CartoDEM v3 Elevation Layer */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <Mountain className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Ground Elevation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showDemLayer}
                      onChange={(e) => setShowDemLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('dem')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'dem' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'dem' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-1 text-[10.5px]">
                    {DEM_LEGEND.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-xs border border-black/10 shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-txt-secondary">{item.label}</span>
                        </div>
                        <span className="text-txt-tertiary font-mono text-[9.5px]">{item.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4b. Concrete Imperviousness (ESA WorldCover 10m) Layer */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-purple-300 shrink-0" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Concrete Imperviousness</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showImperviousnessLayer}
                      onChange={(e) => setShowImperviousnessLayer(e.target.checked)}
                      className="accent-purple-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('imperviousness')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'imperviousness' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'imperviousness' && (
                  <div className="px-3 pb-3 pt-1.5 border-t border-slate-800 bg-surface-card space-y-2 text-[10.5px]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-purple-400">ESA WorldCover 10m (v200)</span>
                      <span className="text-txt-tertiary font-mono text-[9px]">
                        Refreshed: {imperviousnessData?.lastRefreshedAt ? new Date(imperviousnessData?.lastRefreshedAt ?? 0).toLocaleDateString() : 'Live STAC'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9.5px] text-txt-secondary font-mono">
                        <span>Pervious / Green (0%)</span>
                        <span>Dense Built-Up (100%)</span>
                      </div>
                      <div className="h-2.5 rounded-full w-full bg-gradient-to-r from-emerald-300 via-purple-400 to-indigo-900 border border-slate-700" />
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[9.5px] pt-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-indigo-950 border border-purple-400 shrink-0" />
                        <span className="text-txt-secondary">&ge;85% Dense Built-up</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-purple-600 shrink-0" />
                        <span className="text-txt-secondary">70-85% High Paved</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-purple-300 shrink-0" />
                        <span className="text-txt-secondary">40-70% Moderate</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 shrink-0" />
                        <span className="text-txt-secondary">&lt;40% Green/Park</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Evacuation Zones & Safe Shelters Layer */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-surface-elevated">
                <div className="flex items-center justify-between p-2.5 hover:bg-surface-overlay transition-colors">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-txt-primary text-[11.5px]">Evacuation Zones & Shelters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showEvacuationLayer}
                      onChange={(e) => setShowEvacuationLayer(e.target.checked)}
                      className="accent-[var(--color-selection-active)] w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('evac')}
                      className="text-txt-tertiary hover:text-txt-primary p-0.5"
                    >
                      {expandedAccordion === 'evac' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'evac' && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-surface-card space-y-1.5 text-[10.5px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-2 border border-dashed border-status-critical bg-orange-200/60 rounded-xs" />
                        <span className="font-semibold text-txt-secondary">Evacuation Basin Polygon</span>
                      </div>
                      <span className="text-status-critical font-mono text-[10px] font-bold">&gt;25-40cm Sump</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-status-safe border border-green-300" />
                        <span className="font-semibold text-txt-secondary">Safe Assembly Shelter</span>
                      </div>
                      <span className="text-status-safe font-mono text-[10px] font-bold">&gt;6m MSL Refuge</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-1.5 bg-green-500 rounded-full" />
                        <span className="font-semibold text-gray-700">Foot Evacuation Galli Corridor</span>
                      </div>
                      <span className="text-gray-500 font-mono text-[10px]">Zero Stalling</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Vehicle Flood-Safe Routing & Segment Risk Layer */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center justify-between p-2.5 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-800 text-[11.5px]">Vehicle Navigation Route</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showRouteLayer}
                      onChange={(e) => setShowRouteLayer(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('route')}
                      className="text-gray-400 hover:text-gray-700 p-0.5"
                    >
                      {expandedAccordion === 'route' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'route' && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-1.5 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-green-600 shrink-0" />
                        <span className="text-gray-700 font-medium">Safe Corridor</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span className="text-gray-700 font-medium">Warning (8-20cm)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span className="text-gray-700 font-medium">Critical (20-40cm)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-1.5 rounded-full bg-orange-600 shrink-0 border border-orange-300" />
                        <span className="text-orange-600 font-bold">Impassable / Block</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-200/60 flex items-center justify-between">
                      <span>Start Departure</span>
                      <span>High-Elevation Refuge</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Citizen Ground-Truth Reports Layer */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center justify-between p-2.5 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-gray-800 text-[11.5px]">Citizen Ground-Truth</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showReportsLayer}
                      onChange={(e) => setShowReportsLayer(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('reports')}
                      className="text-gray-400 hover:text-gray-700 p-0.5"
                    >
                      {expandedAccordion === 'reports' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'reports' && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-1 text-[10.5px]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white shrink-0" />
                      <span className="text-gray-700">Crowdsourced waterlogged depth pin</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Citizen Signals & Traffic Desk Layer */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="flex items-center justify-between p-2.5 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-gray-800 text-[11.5px]">Citizen Signals & Traffic</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showSignalsLayer}
                      onChange={(e) => setShowSignalsLayer(e.target.checked)}
                      className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                    />
                    <button
                      onClick={() => toggleAccordion('signals')}
                      className="text-gray-400 hover:text-gray-700 p-0.5"
                    >
                      {expandedAccordion === 'signals' ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedAccordion === 'signals' && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-1.5 text-[10.5px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                        <span className="text-gray-700">Choked Catchpit</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-700 shrink-0" />
                        <span className="text-gray-700">Sewer Backflow</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
                        <span className="text-gray-700">Waterlogging</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-800 shrink-0" />
                        <span className="text-gray-700">Overbank Spill</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Minimal Coordinate & Elevation Floating Glass Chip (Bottom Left) */}
      <div className="hidden sm:flex absolute bottom-3 left-3 z-10 bg-gray-900/85 backdrop-blur-md border border-gray-700/60 px-3 py-1.5 rounded-full text-[11px] font-mono text-gray-200 shadow-xl items-center space-x-2.5">
        <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>{cursorCoords.lat}° N, {cursorCoords.lng}° E</span>
        <span className="w-1 h-1 rounded-full bg-gray-500" />
        <span className="font-bold text-blue-300">
          {cursorCoords.elev} m MSL
        </span>
      </div>

      {/* 5b. Precipitation Source Badge (Bottom Right) — Always Visible */}
      {/* Lifted above the floating chatbot launcher (fixed bottom-right) so the two never overlap */}
      <div className="absolute bottom-[88px] right-2 sm:bottom-24 sm:right-3 z-10">
        <PrecipitationSourceBadge sourceInfo={precipSourceInfo} align="right" />
      </div>

      {/* 6. Feature Inspection Popup Card */}
      <div ref={popupElementRef} className="ol-popup-card">
        {popupContent && (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-blue-700 dark:text-blue-400 text-xs leading-tight">{popupContent.title}</h4>
              {popupContent.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 whitespace-nowrap ${popupContent.badge.color}`}>
                  {popupContent.badge.text}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{popupContent.subtitle}</p>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 space-y-1">
              {popupContent.details.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <span className="text-[10.5px] text-gray-500 dark:text-gray-400 shrink-0">{d.label}:</span>
                  <span className={`font-bold font-mono text-[10.5px] text-right ${d.color || 'text-gray-800 dark:text-gray-200'}`}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
