'use client';

import React, { useState } from 'react';
import { CityId } from '@/lib/mock-data';
import { DEM_LEGEND } from '@/lib/dem-service';
import {
  Layers,
  Wind,
  Activity,
  Waves,
  Mountain,
  ShieldAlert,
  Navigation,
  AlertTriangle,
  Route,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface MapLayerVisibility {
  baseLayerType: 'osm' | 'topo' | 'hot' | 'satellite';
  showDemLayer: boolean;
  showWindCloudLayer: boolean;
  showRoadsLayer: boolean;
  showRouteLayer: boolean;
  showDrainageLayer: boolean;
  showManholesLayer: boolean;
  showEvacuationLayer: boolean;
  showReportsLayer: boolean;
  showHotspotsLayer: boolean;
  showDeluge2005Layer: boolean;
  showGroundwaterLayer: boolean;
  showSignalsLayer: boolean;
  showImperviousnessLayer: boolean;
}

export const DEFAULT_CITIZEN_LAYERS: MapLayerVisibility = {
  baseLayerType: 'osm',
  showDemLayer: false,
  showWindCloudLayer: false,
  showRoadsLayer: true,
  showRouteLayer: true,
  showDrainageLayer: false,
  showManholesLayer: false,
  showEvacuationLayer: false,
  showReportsLayer: false,
  showHotspotsLayer: false,
  showDeluge2005Layer: false,
  showGroundwaterLayer: false,
  showSignalsLayer: false,
  showImperviousnessLayer: false,
};

interface CitizenGisLayersWidgetProps {
  layerVisibility: MapLayerVisibility;
  setLayerVisibility: React.Dispatch<React.SetStateAction<MapLayerVisibility>>;
  selectedCityId: CityId;
  timeOffsetMins: number;
}

type LayerFlag = Exclude<keyof MapLayerVisibility, 'baseLayerType'>;

/** One row inside a layer's expandable legend. */
type LegendRow = { dot?: string; label: string; value?: string; strong?: boolean };

interface LayerDef {
  id: string;
  flag: LayerFlag;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Accent colour for the icon tile and the "on" outline. */
  tone: string;
  legend:
    | { kind: 'dots'; rows: LegendRow[]; footnote?: [string, string] }
    | { kind: 'rows'; rows: LegendRow[] }
    | { kind: 'dem' };
}

interface LayerGroup {
  title: string;
  layers: LayerDef[];
}

const SAFE = '#10b981';
const WARN = '#f59e0b';
const CRIT = '#f97316';
const SEVERE = '#dc2626';
const INFO = '#0ea5e9';

const LAYER_GROUPS: LayerGroup[] = [
  {
    title: 'Flooding & Roads',
    layers: [
      {
        id: 'roads',
        flag: 'showRoadsLayer',
        label: 'Road Flood Levels',
        description: 'Water depth on streets (cm)',
        icon: Route,
        tone: INFO,
        legend: {
          kind: 'dots',
          rows: [
            { dot: SAFE, label: '<8 cm (Safe)' },
            { dot: WARN, label: '8-20 cm (Warning)' },
            { dot: CRIT, label: '20-40 cm (Critical)' },
            { dot: SEVERE, label: '>40 cm (Blocked)' }
          ],
          footnote: ['Solid line: Main Roads', 'Dashed line: Local Streets']
        }
      },
      {
        id: 'route',
        flag: 'showRouteLayer',
        label: 'Safe Driving Route',
        description: 'Best path to avoid flooded roads',
        icon: Navigation,
        tone: '#2563eb',
        legend: {
          kind: 'dots',
          rows: [
            { dot: SAFE, label: 'Safe Detour Path' },
            { dot: SEVERE, label: 'Flooded Section' }
          ]
        }
      },
      {
        id: 'hotspots',
        flag: 'showHotspotsLayer',
        label: 'High Risk Flood Spots',
        description: 'Underpasses and areas prone to heavy flooding',
        icon: AlertTriangle,
        tone: SEVERE,
        legend: {
          kind: 'dots',
          rows: [
            { dot: SEVERE, label: 'Frequent Flooding Location' },
            { dot: INFO, label: 'Underpass / Low-Lying Subway' }
          ]
        }
      }
    ]
  },
  {
    title: 'Water & Drainage',
    layers: [
      {
        id: 'manholes',
        flag: 'showManholesLayer',
        label: 'Drainage Overflow Points',
        description: 'Manholes and drain overflow points',
        icon: Activity,
        tone: WARN,
        legend: {
          kind: 'dots',
          rows: [
            { dot: SAFE, label: 'Normal Flow' },
            { dot: WARN, label: 'Filling Up' },
            { dot: CRIT, label: 'Near Capacity' },
            { dot: SEVERE, label: 'Water Overflowing' }
          ]
        }
      },
      {
        id: 'drainage',
        flag: 'showDrainageLayer',
        label: 'Rivers & Canals',
        description: 'Rivers, streams and main drains',
        icon: Waves,
        tone: '#06b6d4',
        legend: {
          kind: 'rows',
          rows: [
            { label: 'Major River', value: 'Mithi / Yamuna / Adyar' },
            { label: 'Stormwater Drain', value: 'Active Flow' }
          ]
        }
      }
    ]
  },
  {
    title: 'Terrain & Weather',
    layers: [
      {
        id: 'dem',
        flag: 'showDemLayer',
        label: 'Ground Height & Elevation',
        description: 'High and low land elevation areas',
        icon: Mountain,
        tone: WARN,
        legend: { kind: 'dem' }
      },
      {
        id: 'wind_cloud',
        flag: 'showWindCloudLayer',
        label: 'Wind & Weather',
        description: 'Live wind speed and cloud updates',
        icon: Wind,
        tone: '#06b6d4',
        legend: {
          kind: 'dots',
          rows: [
            { dot: SAFE, label: '<15 km/h Calm' },
            { dot: INFO, label: '15-30 km/h Breezy' },
            { dot: WARN, label: '30-50 km/h Strong' },
            { dot: SEVERE, label: '>50 km/h Severe', strong: true }
          ]
        }
      }
    ]
  },
  {
    title: 'Safety & Community',
    layers: [
      {
        id: 'evac',
        flag: 'showEvacuationLayer',
        label: 'Emergency Rescue Shelters',
        description: 'Flood risk zones & nearby shelters',
        icon: ShieldAlert,
        tone: CRIT,
        legend: {
          kind: 'rows',
          rows: [
            { label: 'High Risk Flooded Area', value: 'Avoid Area' },
            { label: 'Safe Relief Shelter', value: 'Safe High Ground' }
          ]
        }
      },
      {
        id: 'reports',
        flag: 'showReportsLayer',
        label: 'Citizen Water Reports',
        description: 'Waterlogging reports from citizens',
        icon: AlertTriangle,
        tone: WARN,
        legend: {
          kind: 'rows',
          rows: [{ label: 'Verified Water Location', value: 'Confirmed by Team' }]
        }
      }
    ]
  }
];

const BASE_MAPS = [
  { type: 'osm', label: 'Standard' },
  { type: 'topo', label: 'Terrain' },
  { type: 'hot', label: 'Street' },
  { type: 'satellite', label: 'Satellite' }
] as const;

const LayerLegend: React.FC<{ legend: LayerDef['legend'] }> = ({ legend }) => {
  if (legend.kind === 'dem') {
    return (
      <div className="space-y-1.5">
        {DEM_LEGEND.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 text-2xs">
            <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="ui-mono" style={{ color: 'var(--text-tertiary)' }}>{item.description}</span>
          </div>
        ))}
      </div>
    );
  }

  if (legend.kind === 'rows') {
    return (
      <div className="space-y-1.5">
        {legend.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 text-2xs">
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
            <span className="ui-mono font-bold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {legend.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-2xs"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.dot }} />
            <span className={row.strong ? 'font-bold' : 'font-medium'} style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </span>
          </div>
        ))}
      </div>
      {legend.footnote && (
        <div className="flex justify-between text-2xs ui-mono" style={{ color: 'var(--text-tertiary)' }}>
          <span>{legend.footnote[0]}</span>
          <span>{legend.footnote[1]}</span>
        </div>
      )}
    </div>
  );
};

export const CitizenGisLayersWidget: React.FC<CitizenGisLayersWidgetProps> = ({
  layerVisibility,
  setLayerVisibility,
  selectedCityId,
  timeOffsetMins
}) => {
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('roads');

  const toggleAccordion = (key: string) => {
    setExpandedAccordion((prev) => (prev === key ? null : key));
  };

  const flagValues = Object.entries(layerVisibility).filter(([key]) => key !== 'baseLayerType');
  const activeCount = flagValues.filter(([, val]) => val === true).length;
  const totalCount = flagValues.length;

  const setSingleLayer = (key: LayerFlag, value: boolean) => {
    setLayerVisibility((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetToDefaults = () => {
    setLayerVisibility(DEFAULT_CITIZEN_LAYERS);
  };

  const handleEnableAll = () => {
    setLayerVisibility({
      baseLayerType: layerVisibility.baseLayerType,
      showDemLayer: true,
      showWindCloudLayer: true,
      showRoadsLayer: true,
      showRouteLayer: true,
      showDrainageLayer: true,
      showManholesLayer: true,
      showEvacuationLayer: true,
      showReportsLayer: true,
      showHotspotsLayer: true,
      showDeluge2005Layer: true,
      showGroundwaterLayer: true,
      showSignalsLayer: true,
      showImperviousnessLayer: true,
    });
  };

  return (
    <div className="ui-stack">
      {/* Panel header */}
      <section className="ui-card ui-head">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="ui-eyebrow">Live Inundation</p>
            <h2 className="ui-title mt-0.5">Map Layers & Controls</h2>
            <p className="ui-subtitle mt-1">Choose what to display on the map</p>
          </div>
          <span className="ui-chip ui-chip-info ui-mono shrink-0">{activeCount} / {totalCount} Active</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={handleResetToDefaults} className="ui-btn">
            <RotateCcw style={{ color: 'var(--color-selection-active)' }} />
            <span>Default View</span>
          </button>
          <button type="button" onClick={handleEnableAll} className="ui-btn">
            <Sparkles style={{ color: 'var(--color-selection-active)' }} />
            <span>Enable All</span>
          </button>
        </div>
      </section>

      {/* Base map */}
      <section className="ui-card space-y-2">
        <h3 className="ui-section-title">
          <Layers />
          <span>Map Type</span>
        </h3>
        <div className="ui-segment" role="tablist" aria-label="Base map type">
          {BASE_MAPS.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={layerVisibility.baseLayerType === type}
              onClick={() => setLayerVisibility((prev) => ({ ...prev, baseLayerType: type }))}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Grouped layers */}
      {LAYER_GROUPS.map((group) => (
        <section key={group.title} className="space-y-1.5">
          <h3 className="ui-eyebrow !text-[color:var(--text-tertiary)] px-1">{group.title}</h3>

          <div className="flex flex-col gap-1.5">
            {group.layers.map((layer) => {
              const Icon = layer.icon;
              const isOn = layerVisibility[layer.flag] as boolean;
              const isOpen = expandedAccordion === layer.id;

              return (
                <div
                  key={layer.id}
                  className="rounded-xl overflow-hidden transition-colors"
                  style={{
                    background: 'var(--surface-card)',
                    border: `1px solid ${isOn ? `color-mix(in srgb, ${layer.tone} 55%, transparent)` : 'var(--border)'}`
                  }}
                >
                  <div className="flex items-center gap-2.5 p-2.5">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${layer.tone} ${isOn ? 18 : 10}%, transparent)`,
                        color: layer.tone,
                        opacity: isOn ? 1 : 0.75
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleAccordion(layer.id)}
                      aria-expanded={isOpen}
                      className="flex-1 min-w-0 text-left"
                      title="Show legend"
                    >
                      <span className="block text-xs font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                        {layer.label}
                      </span>
                      <span className="block text-2xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {layer.description}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleAccordion(layer.id)}
                      aria-label={isOpen ? 'Hide legend' : 'Show legend'}
                      className="p-1 rounded-md transition-colors hover:bg-[var(--surface-elevated)]"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      aria-label={`Show ${layer.label}`}
                      onClick={() => setSingleLayer(layer.flag, !isOn)}
                      className="relative w-9 h-5 rounded-full shrink-0 transition-colors"
                      style={{ background: isOn ? 'var(--color-action-primary)' : 'var(--border)' }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                        style={{ transform: isOn ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-3 pt-2.5" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-elevated)' }}>
                      <LayerLegend legend={layer.legend} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
