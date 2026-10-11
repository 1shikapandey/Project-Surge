import { CityId } from './mock-data';

export interface CGWBWellStation {
  name: string;
  lat: number;
  lng: number;
  district: string;
  readings: { year: number; month: number; depth_m_bgl: number }[];
  quality?: { ec: number; chloride: number; nitrate: number; fluoride: number };
}

export interface WardGroundwaterDepth {
  wardNumber: number;
  wardName: string;
  depthM: number | null;
  category: 'healthy' | 'moderate' | 'declining' | 'stressed' | 'critical' | 'crisis';
  stationCount: number;
}

export interface GroundwaterDataset {
  cityId: CityId;
  totalStations: number;
  averageDepthM: number;
  wards: WardGroundwaterDepth[];
  stations: CGWBWellStation[];
}

export function getGroundwaterColor(depthM: number | null): string {
  if (depthM === null) return '#94a3b8'; // slate-400
  if (depthM <= 3) return '#22c55e'; // green-500 (Healthy 0-3m)
  if (depthM <= 6) return '#84cc16'; // lime-500 (Moderate 3-6m)
  if (depthM <= 10) return '#eab308'; // yellow-500 (Declining 6-10m)
  if (depthM <= 15) return '#f97316'; // orange-500 (Stressed 10-15m)
  if (depthM <= 25) return '#ef4444'; // red-500 (Critical 15-25m)
  return '#7f1d1d'; // red-900 (Crisis >25m)
}

export function getGroundwaterCategory(depthM: number | null): WardGroundwaterDepth['category'] {
  if (depthM === null || depthM <= 3) return 'healthy';
  if (depthM <= 6) return 'moderate';
  if (depthM <= 10) return 'declining';
  if (depthM <= 15) return 'stressed';
  if (depthM <= 25) return 'critical';
  return 'crisis';
}

// BMC 24 Wards static metadata for IDW groundwater surface mapping
const MUMBAI_WARDS_METADATA = [
  { no: 1, name: 'A Ward (Colaba/Fort)', lat: 18.9220, lng: 72.8320, fallbackDepth: 3.2 },
  { no: 2, name: 'B Ward (Sandhurst Road)', lat: 18.9560, lng: 72.8370, fallbackDepth: 2.9 },
  { no: 3, name: 'C Ward (Marine Lines)', lat: 18.9500, lng: 72.8250, fallbackDepth: 3.1 },
  { no: 4, name: 'D Ward (Grant Road)', lat: 18.9630, lng: 72.8120, fallbackDepth: 4.2 },
  { no: 5, name: 'E Ward (Byculla)', lat: 18.9760, lng: 72.8330, fallbackDepth: 3.8 },
  { no: 6, name: 'F/North Ward (Matunga/Sion)', lat: 19.0300, lng: 72.8550, fallbackDepth: 4.5 },
  { no: 7, name: 'F/South Ward (Parel/Wadala)', lat: 19.0020, lng: 72.8420, fallbackDepth: 3.6 },
  { no: 8, name: 'G/North Ward (Dadar/Dharavi)', lat: 19.0350, lng: 72.8420, fallbackDepth: 4.1 },
  { no: 9, name: 'G/South Ward (Worli)', lat: 19.0080, lng: 72.8180, fallbackDepth: 2.8 },
  { no: 10, name: 'H/East Ward (Bandra E/Santa Cruz E)', lat: 19.0620, lng: 72.8510, fallbackDepth: 5.4 },
  { no: 11, name: 'H/West Ward (Bandra W/Khar)', lat: 19.0580, lng: 72.8300, fallbackDepth: 4.8 },
  { no: 12, name: 'K/East Ward (Andheri East)', lat: 19.1150, lng: 72.8680, fallbackDepth: 6.2 },
  { no: 13, name: 'K/West Ward (Andheri West/Juhu)', lat: 19.1200, lng: 72.8320, fallbackDepth: 4.0 },
  { no: 14, name: 'L Ward (Kurla)', lat: 19.0720, lng: 72.8800, fallbackDepth: 5.1 },
  { no: 15, name: 'M/East Ward (Govandi/Mankhurd)', lat: 19.0500, lng: 72.9300, fallbackDepth: 3.5 },
  { no: 16, name: 'M/West Ward (Chembur)', lat: 19.0600, lng: 72.8980, fallbackDepth: 4.9 },
  { no: 17, name: 'N Ward (Ghatkopar)', lat: 19.0860, lng: 72.9080, fallbackDepth: 5.8 },
  { no: 18, name: 'P/North Ward (Malad)', lat: 19.1850, lng: 72.8480, fallbackDepth: 6.5 },
  { no: 19, name: 'P/South Ward (Goregaon)', lat: 19.1620, lng: 72.8450, fallbackDepth: 5.9 },
  { no: 20, name: 'R/Central Ward (Borivali)', lat: 19.2300, lng: 72.8550, fallbackDepth: 7.2 },
  { no: 21, name: 'R/North Ward (Dahisar)', lat: 19.2500, lng: 72.8600, fallbackDepth: 6.8 },
  { no: 22, name: 'R/South Ward (Kandivali)', lat: 19.2050, lng: 72.8500, fallbackDepth: 6.1 },
  { no: 23, name: 'S Ward (Bhandup/Powai)', lat: 19.1450, lng: 72.9350, fallbackDepth: 5.0 },
  { no: 24, name: 'T Ward (Mulund)', lat: 19.1750, lng: 72.9550, fallbackDepth: 5.6 },
];

// Delhi NCT 11 Districts static metadata for IDW groundwater surface mapping
const DELHI_WARDS_METADATA = [
  { no: 1, name: 'Central Delhi (Connaught Place/Daryaganj)', lat: 28.6350, lng: 77.2250, fallbackDepth: 12.5 },
  { no: 2, name: 'New Delhi (Lutyens/Chanakyapuri)', lat: 28.6100, lng: 77.2050, fallbackDepth: 14.8 },
  { no: 3, name: 'South Delhi (Hauz Khas/Saket)', lat: 28.5400, lng: 77.2000, fallbackDepth: 22.1 },
  { no: 4, name: 'South East Delhi (Lajpat Nagar/Okhla)', lat: 28.5600, lng: 77.2600, fallbackDepth: 16.4 },
  { no: 5, name: 'South West Delhi (Vasant Kunj/Dwarka)', lat: 28.5800, lng: 77.0600, fallbackDepth: 24.5 },
  { no: 6, name: 'East Delhi (Preet Vihar/Laxmi Nagar)', lat: 28.6300, lng: 77.2800, fallbackDepth: 6.8 },
  { no: 7, name: 'North East Delhi (Seelampur/Shahdara)', lat: 28.6800, lng: 77.2600, fallbackDepth: 5.2 },
  { no: 8, name: 'North Delhi (Civil Lines/Sadar Bazaar)', lat: 28.6700, lng: 77.2100, fallbackDepth: 8.9 },
  { no: 9, name: 'North West Delhi (Rohini/Pitampura)', lat: 28.7100, lng: 77.1200, fallbackDepth: 11.4 },
  { no: 10, name: 'West Delhi (Rajouri Garden/Janakpuri)', lat: 28.6400, lng: 77.1100, fallbackDepth: 15.2 },
  { no: 11, name: 'Shahdara District (Vivek Vihar)', lat: 28.6600, lng: 77.3000, fallbackDepth: 7.1 }
];

// Greater Chennai 15 Zones static metadata for IDW groundwater surface mapping
const CHENNAI_WARDS_METADATA = [
  { no: 1, name: 'Zone 1 (Tiruvottiyur)', lat: 13.1600, lng: 80.3000, fallbackDepth: 3.5 },
  { no: 2, name: 'Zone 2 (Manali)', lat: 13.1700, lng: 80.2600, fallbackDepth: 4.1 },
  { no: 3, name: 'Zone 3 (Madhavaram)', lat: 13.1400, lng: 80.2300, fallbackDepth: 4.8 },
  { no: 4, name: 'Zone 4 (Tondiarpet)', lat: 13.1200, lng: 80.2800, fallbackDepth: 3.2 },
  { no: 5, name: 'Zone 5 (Royapuram)', lat: 13.1000, lng: 80.2900, fallbackDepth: 2.8 },
  { no: 6, name: 'Zone 6 (Thiru-Vi-Ka Nagar)', lat: 13.1100, lng: 80.2400, fallbackDepth: 3.9 },
  { no: 7, name: 'Zone 7 (Ambattur)', lat: 13.1100, lng: 80.1500, fallbackDepth: 7.2 },
  { no: 8, name: 'Zone 8 (Anna Nagar)', lat: 13.0850, lng: 80.2100, fallbackDepth: 5.4 },
  { no: 9, name: 'Zone 9 (Teynampet/Mylapore)', lat: 13.0450, lng: 80.2500, fallbackDepth: 3.1 },
  { no: 10, name: 'Zone 10 (Kodambakkam/T. Nagar)', lat: 13.0400, lng: 80.2200, fallbackDepth: 4.2 },
  { no: 11, name: 'Zone 11 (Valasaravakkam)', lat: 13.0400, lng: 80.1700, fallbackDepth: 6.1 },
  { no: 12, name: 'Zone 12 (Alandur/Guindy)', lat: 13.0000, lng: 80.2000, fallbackDepth: 5.0 },
  { no: 13, name: 'Zone 13 (Adyar/Velachery)', lat: 12.9800, lng: 80.2300, fallbackDepth: 2.5 },
  { no: 14, name: 'Zone 14 (Perungudi/OMR)', lat: 12.9600, lng: 80.2400, fallbackDepth: 3.0 },
  { no: 15, name: 'Zone 15 (Sholinganallur)', lat: 12.9000, lng: 80.2300, fallbackDepth: 3.8 }
];

export const DELHI_CGWB_STATIONS: CGWBWellStation[] = [
  { name: 'CGWB Well - Connaught Place (Outer Circle)', lat: 28.6330, lng: 77.2200, district: 'Central Delhi', readings: [{ year: 2024, month: 5, depth_m_bgl: 12.8 }] },
  { name: 'CGWB Well - Hauz Khas Village', lat: 28.5480, lng: 77.2020, district: 'South Delhi', readings: [{ year: 2024, month: 5, depth_m_bgl: 22.4 }] },
  { name: 'CGWB Well - Yamuna Bank Metro Depot', lat: 28.6250, lng: 77.2650, district: 'East Delhi', readings: [{ year: 2024, month: 5, depth_m_bgl: 4.8 }] },
  { name: 'CGWB Well - Lajpat Nagar Central Market', lat: 28.5680, lng: 77.2410, district: 'South East Delhi', readings: [{ year: 2024, month: 5, depth_m_bgl: 15.2 }] },
  { name: 'CGWB Well - Rohini Sector 11', lat: 28.7200, lng: 77.1150, district: 'North West Delhi', readings: [{ year: 2024, month: 5, depth_m_bgl: 10.9 }] },
  { name: 'CGWB Well - Dwarka Sector 10', lat: 28.5820, lng: 77.0550, district: 'South West Delhi', readings: [{ year: 2024, month: 5, depth_m_bgl: 24.1 }] }
];

export const CHENNAI_CGWB_STATIONS: CGWBWellStation[] = [
  { name: 'CGWB Well - Velachery Main Road', lat: 12.9780, lng: 80.2180, district: 'Velachery', readings: [{ year: 2024, month: 5, depth_m_bgl: 2.4 }] },
  { name: 'CGWB Well - T. Nagar Panagal Park', lat: 13.0410, lng: 80.2310, district: 'T. Nagar', readings: [{ year: 2024, month: 5, depth_m_bgl: 4.1 }] },
  { name: 'CGWB Well - Anna University Guindy', lat: 13.0080, lng: 80.2350, district: 'Guindy', readings: [{ year: 2024, month: 5, depth_m_bgl: 5.2 }] },
  { name: 'CGWB Well - Royapuram Coastal Outfall', lat: 13.1050, lng: 80.2920, district: 'Royapuram', readings: [{ year: 2024, month: 5, depth_m_bgl: 2.8 }] },
  { name: 'CGWB Well - Ambattur Industrial Estate', lat: 13.1120, lng: 80.1550, district: 'Ambattur', readings: [{ year: 2024, month: 5, depth_m_bgl: 7.4 }] }
];

/**
 * Perform Inverse Distance Weighting (IDW) interpolation for ward groundwater depths
 */
export function calculateIDWGroundwaterDepths(cityId: CityId, stations: CGWBWellStation[]): WardGroundwaterDepth[] {
  const wardsMeta = cityId === 'delhi' ? DELHI_WARDS_METADATA : cityId === 'chennai' ? CHENNAI_WARDS_METADATA : MUMBAI_WARDS_METADATA;
  const activeStations = stations.length > 0 ? stations : (cityId === 'delhi' ? DELHI_CGWB_STATIONS : cityId === 'chennai' ? CHENNAI_CGWB_STATIONS : []);

  if (activeStations.length === 0) {
    return wardsMeta.map(w => ({
      wardNumber: w.no,
      wardName: w.name,
      depthM: w.fallbackDepth,
      category: getGroundwaterCategory(w.fallbackDepth),
      stationCount: 1
    }));
  }

  return wardsMeta.map(w => {
    let weightSum = 0;
    let weightedDepthSum = 0;

    activeStations.forEach(st => {
      const latestReading = st.readings[st.readings.length - 1];
      if (!latestReading) return;

      const distKm = Math.hypot((w.lat - st.lat) * 111, (w.lng - st.lng) * 111 * Math.cos(w.lat * (Math.PI / 180)));
      const weight = 1 / Math.pow(Math.max(distKm, 0.5), 2);

      weightSum += weight;
      weightedDepthSum += Math.abs(latestReading.depth_m_bgl) * weight;
    });

    const interpolatedDepth = weightSum > 0 ? Number((weightedDepthSum / weightSum).toFixed(2)) : w.fallbackDepth;

    return {
      wardNumber: w.no,
      wardName: w.name,
      depthM: interpolatedDepth,
      category: getGroundwaterCategory(interpolatedDepth),
      stationCount: activeStations.length
    };
  });
}
