'use client';

import React, { useState } from 'react';
import { useSimulationContext } from '@/context/SimulationContext';
import { ShieldAlert, CheckCircle, Clock, Truck, Filter, AlertTriangle, MapPin } from 'lucide-react';

interface SimulatedDispatchItem {
  id: string;
  location: string;
  category: string;
  reportedDepthCm: number;
  status: 'pending' | 'dispatched' | 'resolved';
  priority: 'critical' | 'high' | 'medium';
  timestampLabel: string;
  description: string;
}

export const SimHistoricalQueue: React.FC = () => {
  const { selectedEvent } = useSimulationContext();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Derive simulated dispatch queue from event's affected areas
  const initialItems: SimulatedDispatchItem[] = (selectedEvent?.affectedAreas || []).map((area, idx) => ({
    id: `disp-${idx + 1}`,
    location: area.hotspotName,
    category: area.recordedDepthRangeCm[1] >= 50 ? 'Submerged Underpass' : 'Severe Inundation',
    reportedDepthCm: area.recordedDepthRangeCm[1],
    status: idx === 0 ? 'dispatched' : idx === 1 ? 'pending' : 'pending',
    priority: area.recordedDepthRangeCm[1] >= 50 ? 'critical' : 'high',
    timestampLabel: `Historical Record (${area.boroughOrZone})`,
    description: area.impactDescription,
  }));

  const [items, setItems] = useState<SimulatedDispatchItem[]>(initialItems);

  const toggleDispatch = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'pending' ? 'dispatched' : item.status === 'dispatched' ? 'resolved' : 'pending';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-xl flex flex-col h-full max-h-[500px] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Historical Emergency Dispatch Queue
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
            {items.length}
          </span>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded text-xs px-2 py-1 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Queue items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-xs">
            <span>No dispatch records for this filter.</span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-200">
                      {item.location}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 pl-5">
                    Peak Water Depth: <span className="text-amber-400 font-bold">{item.reportedDepthCm} cm</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.priority === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 pl-5 mb-2 leading-relaxed">
                {item.description}
              </p>

              <div className="pl-5 flex items-center justify-between pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.timestampLabel}
                </span>

                <button
                  onClick={() => toggleDispatch(item.id)}
                  className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs ${
                    item.status === 'dispatched'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : item.status === 'resolved'
                      ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
                      : 'bg-orange-600 hover:bg-orange-500 text-white'
                  }`}
                >
                  {item.status === 'dispatched' ? (
                    <>
                      <Truck className="w-3.5 h-3.5" />
                      <span>NDRF Unit En Route</span>
                    </>
                  ) : item.status === 'resolved' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Dispatch Relief Unit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
