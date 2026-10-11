import { NextResponse } from 'next/server';
import { getCityDataset, CityId } from '@/lib/mock-data';
import { getHydraulicSnapshotAtTime } from '@/lib/hydraulic-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeOffset = parseInt(searchParams.get('time') || '0', 10);
  const city = (searchParams.get('city') as CityId) || 'mumbai';

  const snapshot = getHydraulicSnapshotAtTime(timeOffset, city);
  const { nodes } = getCityDataset(city);

  const nodeStateMap = new Map<string, { surchargePct: number; status: string }>();
  snapshot.nodeStates.forEach(n => nodeStateMap.set(n.nodeId, { surchargePct: n.surchargePct, status: n.status }));

  const liveNodes = nodes.map(node => {
    const liveState = nodeStateMap.get(node.id);
    return {
      ...node,
      currentSurchargePct: liveState ? liveState.surchargePct : node.surchargeTimelinePct[0],
      currentStatus: liveState ? liveState.status : node.status
    };
  });

  return NextResponse.json({
    success: true,
    city,
    timeOffsetMins: timeOffset,
    nodes: liveNodes,
    physicsManholes: snapshot.physicsManholes || [],
    overflowingManholesCount: snapshot.overflowingManholesCount || 0,
    totalManholeOverflowRateLps: snapshot.totalManholeOverflowRateLps || 0
  });
}
