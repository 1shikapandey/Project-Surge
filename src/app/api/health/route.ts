import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'healthy',
    ok: true,
    service: 'SURGE Flood Warning System',
    timestamp: new Date().toISOString()
  });
}
