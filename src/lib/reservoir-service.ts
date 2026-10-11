import { CityId } from './mock-data';

export interface ReservoirSource {
  sourceCode: string;
  displayName: string;
  type: 'reservoir';
  fullCapacityMcft: number;
  currentStorageMcft: number;
  storagePct: number;
  latitude: number;
  longitude: number;
  displayOrder: number;
  isPrimaryDrinkingSource: boolean;
  hasPublicFeed: boolean;
}

export interface ReservoirStatusResponse {
  cityId: CityId;
  timestamp: string;
  totalCapacityMcft: number;
  totalStorageMcft: number;
  overallStoragePct: number;
  dailyDrawMld: number;
  daysLeftRunway: number;
  sources: ReservoirSource[];
  heroNote: string;
  sourceAttribution: string;
}

export const MUMBAI_RESERVOIR_SOURCES: ReservoirSource[] = [
  {
    sourceCode: 'bhatsa',
    displayName: 'Bhatsa Dam',
    type: 'reservoir',
    fullCapacityMcft: 25321.9,
    currentStorageMcft: 21523.6,
    storagePct: 85.0,
    latitude: 19.534,
    longitude: 73.439,
    displayOrder: 1,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: true
  },
  {
    sourceCode: 'upper_vaitarna',
    displayName: 'Upper Vaitarna',
    type: 'reservoir',
    fullCapacityMcft: 8018.1,
    currentStorageMcft: 6815.4,
    storagePct: 85.0,
    latitude: 19.829,
    longitude: 73.514,
    displayOrder: 2,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: true
  },
  {
    sourceCode: 'middle_vaitarna',
    displayName: 'Middle Vaitarna',
    type: 'reservoir',
    fullCapacityMcft: 6834.4,
    currentStorageMcft: 5809.2,
    storagePct: 85.0,
    latitude: 19.706,
    longitude: 73.433,
    displayOrder: 3,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: true
  },
  {
    sourceCode: 'modak_sagar',
    displayName: 'Modak Sagar',
    type: 'reservoir',
    fullCapacityMcft: 4552.9,
    currentStorageMcft: 4188.7,
    storagePct: 92.0,
    latitude: 19.677,
    longitude: 73.318,
    displayOrder: 4,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: true
  },
  {
    sourceCode: 'tansa',
    displayName: 'Tansa Lake',
    type: 'reservoir',
    fullCapacityMcft: 5123.5,
    currentStorageMcft: 4867.3,
    storagePct: 95.0,
    latitude: 19.569,
    longitude: 73.266,
    displayOrder: 5,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: true
  },
  {
    sourceCode: 'tulsi',
    displayName: 'Tulsi Lake',
    type: 'reservoir',
    fullCapacityMcft: 284.1,
    currentStorageMcft: 284.1,
    storagePct: 100.0,
    latitude: 19.191,
    longitude: 72.918,
    displayOrder: 6,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: false
  },
  {
    sourceCode: 'vihar',
    displayName: 'Vihar Lake',
    type: 'reservoir',
    fullCapacityMcft: 978.2,
    currentStorageMcft: 978.2,
    storagePct: 100.0,
    latitude: 19.154,
    longitude: 72.911,
    displayOrder: 7,
    isPrimaryDrinkingSource: true,
    hasPublicFeed: false
  }
];

export function getMumbaiReservoirStatus(): ReservoirStatusResponse {
  const sources = MUMBAI_RESERVOIR_SOURCES;
  const totalCapacityMcft = sources.reduce((acc, s) => acc + s.fullCapacityMcft, 0);
  const totalStorageMcft = sources.reduce((acc, s) => acc + s.currentStorageMcft, 0);
  const overallStoragePct = Math.round((totalStorageMcft / totalCapacityMcft) * 100);

  // BMC hydraulic engineer daily draw: 3,850 MLD
  const dailyDrawMld = 3850;
  // 1 Mcft = 28.3168 million liters
  const totalLiveMld = totalStorageMcft * 28.3168;
  const daysLeftRunway = Math.round(totalLiveMld / dailyDrawMld);

  return {
    cityId: 'mumbai',
    timestamp: new Date().toISOString(),
    totalCapacityMcft,
    totalStorageMcft: Math.round(totalStorageMcft * 10) / 10,
    overallStoragePct,
    dailyDrawMld,
    daysLeftRunway,
    sources,
    heroNote: 'Upper-bound estimate based on live WRD Pravah bulletins across BMC 7 impounded supply lakes.',
    sourceAttribution: 'Maharashtra WRD Pravah portal (mwrdpravah.in) & BMC Hydraulic Engineer Department'
  };
}
