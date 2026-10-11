import { NextRequest, NextResponse } from 'next/server';
import { CityId, CITIES } from '@/lib/mock-data';
import { getPumpingStationsForCity, getTotalCityPumpingCapacityLps } from '@/lib/pumping-station-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = (searchParams.get('cityId') as CityId) || 'mumbai';

  if (!CITIES[cityId]) {
    return NextResponse.json({ error: 'Invalid cityId parameter' }, { status: 400 });
  }

  const stations = getPumpingStationsForCity(cityId);
  const totalActiveDischargeLps = getTotalCityPumpingCapacityLps(cityId, true);
  const totalMaxCapacityLps = getTotalCityPumpingCapacityLps(cityId, false);

  return NextResponse.json({
    cityId,
    totalStations: stations.length,
    totalActiveDischargeLps,
    totalMaxCapacityLps,
    operationalPct: Math.round((totalActiveDischargeLps / totalMaxCapacityLps) * 100),
    pumpingStations: stations
  });
}
