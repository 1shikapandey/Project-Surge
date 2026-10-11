'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CityId, CITIES, getCityDataset, DRAINAGE_PIPES, CitizenReport, NavigationRoute } from '@/lib/mock-data';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';

interface MapCanvasProps {
  selectedCityId: CityId;
  timeOffsetMins: number;
  personaMode: 'citizen' | 'authority';
  activeRoute: NavigationRoute | null;
  citizenReports: CitizenReport[];
  selectedFeatureId: string | null;
  setSelectedFeatureId: (id: string | null) => void;
}

// Controller to smoothly pan/zoom map when city changes
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  selectedCityId,
  timeOffsetMins,
  personaMode,
  activeRoute,
  citizenReports,
  selectedFeatureId,
  setSelectedFeatureId
}) => {
  const city = CITIES[selectedCityId];
  const snapshot = getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
  const { roads, nodes } = getCityDataset(selectedCityId);

  const getRoadColor = (depthCm: number) => {
    if (depthCm >= 40) return '#dc2626'; // Severe Red
    if (depthCm >= 20) return '#ea580c'; // Critical Orange
    if (depthCm >= 8)  return '#d97706'; // Warning Amber
    return '#0d9488'; // Safe Turquoise Green
  };

  const getRoadWeight = (depthCm: number) => {
    if (depthCm >= 40) return 8;
    if (depthCm >= 20) return 7;
    if (depthCm >= 8)  return 6;
    return 4;
  };

  const getNodeColor = (status: string) => {
    if (status === 'surcharging_backflow') return '#dc2626';
    if (status === 'capacity_warning') return '#d97706';
    return '#0d9488';
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
      <MapContainer
        center={city.center}
        zoom={city.zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapRecenter center={city.center} zoom={city.zoom} />

        {/* CartoDB Positron Light Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> DEM GIS Engine'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* 1. Road Network Flood Overlays */}
        {roads.map(road => {
          const state = snapshot.roadStates.find(r => r.roadId === road.id);
          const depthCm = state ? state.waterDepthCm : 0;
          const color = getRoadColor(depthCm);
          const isGalli = road.highwayCategory === 'Galli / Local Lane' || road.id.startsWith('galli-');
          const weight = isGalli ? Math.max(3, getRoadWeight(depthCm) - 2) : getRoadWeight(depthCm);

          return (
            <Polyline
              key={road.id}
              positions={road.coordinates}
              pathOptions={{
                color,
                weight,
                dashArray: isGalli ? '6, 6' : undefined,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              eventHandlers={{
                click: () => setSelectedFeatureId(road.id)
              }}
            >
              <Popup>
                <div className="p-2 space-y-1.5 min-w-[210px] text-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-800">{road.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                      {road.borough}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold">
                    Category: <span className="text-blue-700">{road.highwayCategory || (isGalli ? 'Galli / Local Lane' : 'Corridor')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200">
                    <div>
                      <span className="text-gray-500">DEM Height:</span>
                      <p className="font-semibold text-gray-700">{road.demElevationMeters}m</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Predicted Depth:</span>
                      <p className={`font-bold ${depthCm >= 20 ? 'text-orange-600' : 'text-orange-700'}`}>
                        {depthCm} cm
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 pt-1">
                    Drainage Node Ref: <span className="font-mono text-blue-700 font-bold">{road.drainNodeId}</span>
                  </p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 2. Manhole & Outfall Nodes */}
        {personaMode === 'authority' && nodes.map(node => {
          const state = snapshot.nodeStates.find(n => n.nodeId === node.id);
          const surchargePct = state ? state.surchargePct : 0;
          const status = state ? state.status : node.status;
          const color = getNodeColor(status);

          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={status === 'surcharging_backflow' ? 9 : 7}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.95,
                color: '#ffffff',
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2 space-y-1.5 min-w-[210px] text-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-800">{node.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold">
                      {node.type}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 border-t border-gray-200 pt-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacity Load:</span>
                      <span className={`font-mono font-bold ${surchargePct > 100 ? 'text-orange-600' : 'text-blue-700'}`}>
                        {surchargePct}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Invert Depth:</span>
                      <span className="font-mono text-gray-700">{node.invertDepthMeters}m</span>
                    </div>
                    {node.pumpActive && (
                      <p className="text-[11px] text-blue-700 font-bold pt-1">
                        High-Capacity Outfall Pump ACTIVE
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 3. Active Navigation Route Layer */}
        {activeRoute && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: activeRoute.isSafe ? '#0d9488' : '#dc2626',
              weight: 6,
              opacity: 0.95
            }}
          />
        )}

        {/* 4. Citizen Ground Truth Report Markers */}
        {citizenReports.map(report => (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={8}
            pathOptions={{
              fillColor: '#d97706',
              fillOpacity: 0.95,
              color: '#ffffff',
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs text-gray-800">
                <div className="flex items-center space-x-1 text-orange-700 font-bold">
                  <span>Ground Truth Report</span>
                </div>
                <p className="font-semibold text-gray-800">{report.locationName}</p>
                <p className="text-orange-800 font-mono font-bold">Depth: {report.waterDepthCm} cm</p>
                <p className="text-gray-600 italic text-[11px]">"{report.userNote}"</p>
                <p className="text-[10px] text-gray-500 pt-1">{report.timestamp} • Verified</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};
