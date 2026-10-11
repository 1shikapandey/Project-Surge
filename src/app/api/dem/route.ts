import { NextRequest, NextResponse } from 'next/server';
import { CityId, CITIES } from '@/lib/mock-data';
import { getDemSurfaceGrid, getDemContours, DEM_LEGEND } from '@/lib/dem-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityId = (searchParams.get('cityId') as CityId) || 'mumbai';

  if (!CITIES[cityId]) {
    return NextResponse.json({ error: 'Invalid cityId parameter' }, { status: 400 });
  }

  const grid = getDemSurfaceGrid(cityId);
  const contours = getDemContours(cityId);

  return NextResponse.json({
    cityId,
    dataset: 'CartoDEM v3 / ISRO Bhoonidhi (High-Resolution 2D Surface Model)',
    gridCellCount: grid.length,
    contourCount: contours.length,
    legend: DEM_LEGEND,
    grid,
    contours
  });
}
