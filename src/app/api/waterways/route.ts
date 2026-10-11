import { NextRequest, NextResponse } from 'next/server';
import { CityId, CITIES } from '@/lib/mock-data';
import { getRealWaterwaysDataset } from '@/lib/real-waterways-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = (searchParams.get('cityId') as CityId) || 'mumbai';
  const timeOffsetMins = parseInt(searchParams.get('timeOffsetMins') || '0', 10);

  if (!CITIES[cityId]) {
    return NextResponse.json({ error: 'Invalid cityId parameter' }, { status: 400 });
  }

  const dataset = getRealWaterwaysDataset(cityId, timeOffsetMins);
  return NextResponse.json(dataset);
}
