import { NextResponse } from 'next/server';
import { CityId } from '@/lib/mock-data';
import { calculateIDWGroundwaterDepths } from '@/lib/groundwater-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get('city') || 'mumbai') as CityId;

  try {
    // Read CGWB stations JSON asset if available
    let stations = [];
    try {
      const jsonFile = city === 'delhi' ? '/data/delhi-cgwb-stations.json' : city === 'mumbai' ? '/data/mumbai-cgwb-stations.json' : null;
      if (jsonFile) {
        const res = await fetch(new URL(jsonFile, request.url));
        if (res.ok) {
          const raw = await res.json();
          stations = raw.stations || raw.wells || [];
        }
      }
    } catch {
      // Fallback to static IDW if file read fails during serverless execution
    }

    const wards = calculateIDWGroundwaterDepths(city, stations);

    return NextResponse.json({
      cityId: city,
      timestamp: new Date().toISOString(),
      stationCount: stations.length,
      wards,
      stations
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch groundwater dataset', details: String(error) },
      { status: 500 }
    );
  }
}
