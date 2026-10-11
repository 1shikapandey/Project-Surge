import { NextResponse } from 'next/server';
import { calculateFloodSafeRoutes, VehicleType } from '@/lib/routing-engine';
import { generateEvacuationPlanForZone, getEvacuationZonesForCity } from '@/lib/evacuation-service';
import { CityId } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') as CityId) || 'mumbai';
  const mode = searchParams.get('mode') || 'standard';
  const origin = searchParams.get('origin') || 'Parel South';
  const destination = searchParams.get('destination') || 'Sion North';
  const vehicle = (searchParams.get('vehicle') as VehicleType) || 'ambulance';
  const timeOffset = parseInt(searchParams.get('time') || '0', 10);
  const zoneId = searchParams.get('zoneId');

  if (mode === 'evacuation') {
    const zones = getEvacuationZonesForCity(city, timeOffset);
    const targetZoneId = zoneId || zones[0]?.id || 'zone-mum-hindmata';
    const plan = generateEvacuationPlanForZone(targetZoneId, city, timeOffset);

    return NextResponse.json({
      success: true,
      mode: 'evacuation',
      city,
      timeOffsetMins: timeOffset,
      activeZones: zones,
      evacuationPlan: plan
    });
  }

  const { standardRoute, safeRoute } = calculateFloodSafeRoutes(origin, destination, vehicle, timeOffset, city);

  return NextResponse.json({
    success: true,
    mode: 'standard',
    query: { origin, destination, vehicle, timeOffsetMins: timeOffset, city },
    routes: {
      standardRoute,
      safeRoute
    }
  });
}
