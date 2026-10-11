import { NextRequest, NextResponse } from 'next/server';
import { VEHICLE_PROFILES } from '@/lib/routing-engine';

type RouteBody = {
  start?: unknown;
  end?: unknown;
  cityId?: string;
  vehicleType?: string;
};

function validPoint(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item)) &&
    value[0] >= -90 &&
    value[0] <= 90 &&
    value[1] >= -180 &&
    value[1] <= 180
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RouteBody | null;
  if (!validPoint(body?.start) || !validPoint(body?.end)) {
    return NextResponse.json(
      { detail: 'Please provide valid origin and destination coordinates.' },
      { status: 422 }
    );
  }

  const [startLat, startLon] = body.start;
  const [endLat, endLon] = body.end;
  const vehicleType = body?.vehicleType || 'sedan';
  const profile = VEHICLE_PROFILES[vehicleType] || VEHICLE_PROFILES['sedan'];

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`,
      { cache: 'no-store', signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) throw new Error(`OSRM returned ${response.status}`);
    const payload = (await response.json()) as {
      code?: string;
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const route = payload.code === 'Ok' ? payload.routes?.[0] : null;

    if (!route?.geometry.coordinates?.length) {
      throw new Error('No routable road found between selected points');
    }

    return NextResponse.json({
      coordinates: route.geometry.coordinates,
      distance_m: route.distance,
      duration_s: route.duration,
      vehicle_type: vehicleType,
      vehicle_name: profile.name,
      clearance_threshold_cm: profile.maxPassableDepthCm,
      passable: true,
      source: 'OSRM / OpenStreetMap vehicle navigation engine'
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || 'Road routing service temporarily unavailable.' },
      { status: 503 }
    );
  }
}
