import { NextRequest, NextResponse } from 'next/server';
import { CityId, CITIES } from '@/lib/mock-data';
import { getCityTideData } from '@/lib/tide-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = (searchParams.get('cityId') as CityId) || 'mumbai';
  const timeOffsetMins = parseInt(searchParams.get('timeOffsetMins') || '0', 10);
  const rainRateMmHr = parseFloat(searchParams.get('rainRateMmHr') || '25');

  if (!CITIES[cityId]) {
    return NextResponse.json({ error: 'Invalid cityId parameter' }, { status: 400 });
  }

  const tideData = getCityTideData(cityId, timeOffsetMins, rainRateMmHr);
  return NextResponse.json(tideData);
}
