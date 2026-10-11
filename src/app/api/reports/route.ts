import { NextResponse } from 'next/server';
import { INITIAL_CITIZEN_REPORTS, CitizenReport, CityId } from '@/lib/mock-data';

let reportsStore: CitizenReport[] = [...INITIAL_CITIZEN_REPORTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    reportsCount: reportsStore.length,
    reports: reportsStore
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      cityId: (body.cityId as CityId) || 'mumbai',
      timestamp: 'Just now',
      lat: body.lat || 19.0176,
      lng: body.lng || 72.8479,
      locationName: body.locationName || 'Submitted Location',
      waterDepthCm: Number(body.waterDepthCm) || 10,
      userNote: body.userNote || 'Ground truth reported by citizen',
      verified: true,
      upvotes: 1
    };

    reportsStore.unshift(newReport);

    return NextResponse.json({
      success: true,
      message: 'Citizen ground truth report logged successfully!',
      report: newReport
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
