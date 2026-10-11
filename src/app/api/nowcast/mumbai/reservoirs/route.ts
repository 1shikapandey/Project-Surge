import { NextResponse } from 'next/server';
import { getMumbaiReservoirStatus } from '@/lib/reservoir-service';

export async function GET() {
  try {
    const data = getMumbaiReservoirStatus();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reservoir telemetry', details: String(error) },
      { status: 500 }
    );
  }
}
