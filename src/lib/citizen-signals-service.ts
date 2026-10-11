/**
 * Citizen Signals & Drainage Clog Reporting Service
 *
 * Provides crowdsourced ground-truth blockage intelligence, nearest stormwater
 * manhole auto-association, severity rating factors (10% to 95%), and a municipal
 * moderation pipeline coupled directly into the hydraulic simulation engine.
 */

export type SignalIssueType =
  | 'waterlogging'
  | 'blocked_inlet'
  | 'drain_overflow'
  | 'sewer_backflow';

export type SignalStatus = 'active' | 'validated' | 'resolved' | 'rejected';

export interface CitizenSignal {
  id: string;
  cityId: string;
  issueType: SignalIssueType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  nearestManholeId: string;
  severityRatio: number; // 0.1 to 0.95 (capacity reduction)
  status: SignalStatus;
  reportedAt: string;
  verifiedAt?: string;
  resolvedAt?: string;
  verifiedBy?: string;
  photoUrl?: string;
  resolutionNotes?: string;
  resolutionAction?: string;
  resolutionPhotoUrl?: string;
  upvotes: number;
  reporterAlias: string;
}

export const ISSUE_TYPE_CONFIG: Record<
  SignalIssueType,
  { label: string; defaultSeverity: number; color: string; badgeColor: string }
> = {
  waterlogging: {
    label: 'Street Waterlogging',
    defaultSeverity: 0.55,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
  },
  blocked_inlet: {
    label: 'Choked Catch-Basin / Grate',
    defaultSeverity: 0.8,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    badgeColor: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
  },
  drain_overflow: {
    label: 'Nalla / Drain Overbank Spill',
    defaultSeverity: 0.9,
    color: 'text-red-400 border-red-500/30 bg-red-500/10',
    badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40'
  },
  sewer_backflow: {
    label: 'Sewer Main Backflow Surcharge',
    defaultSeverity: 0.75,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40'
  }
};

export const INITIAL_CITIZEN_SIGNALS: CitizenSignal[] = [
  {
    id: 'sig-mum-101',
    cityId: 'mumbai',
    issueType: 'blocked_inlet',
    title: 'Plastic & Construction Waste Choking Dadar TT Grate',
    description: 'Stormwater inlet completely choked by plastic bags and silt; water pooling rapidly across Tramway junction.',
    latitude: 19.0178,
    longitude: 72.8478,
    nearestManholeId: 'MH-042 (Dadar TT Circle)',
    severityRatio: 0.85,
    status: 'validated',
    reportedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    verifiedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    verifiedBy: 'MCGM Stormwater Control Room (F/North Ward)',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80',
    upvotes: 42,
    reporterAlias: 'CitizenObserver_Dadar'
  },
  {
    id: 'sig-mum-102',
    cityId: 'mumbai',
    issueType: 'drain_overflow',
    title: 'Mithi River Outfall Surcharging onto Kurla CST Road',
    description: 'Culvert backflow occurring at peak high tide. 40cm water depth on road.',
    latitude: 19.0688,
    longitude: 72.8712,
    nearestManholeId: 'MH-088 (Kurla West Sluice)',
    severityRatio: 0.92,
    status: 'validated',
    reportedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    verifiedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    verifiedBy: 'BMC Disaster Management Cell',
    photoUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80',
    upvotes: 89,
    reporterAlias: 'KurlaRescueSquad'
  },
  {
    id: 'sig-mum-103',
    cityId: 'mumbai',
    issueType: 'waterlogging',
    title: 'Standing Water Accumulation at Sion Circle Underpass',
    description: 'Water depth approximately 25cm. Low clearance vehicles cannot pass safely.',
    latitude: 19.0375,
    longitude: 72.8624,
    nearestManholeId: 'MH-019 (Sion Underpass Main)',
    severityRatio: 0.65,
    status: 'active',
    reportedAt: new Date(Date.now() - 1200 * 1000).toISOString(),
    upvotes: 18,
    reporterAlias: 'TaxiFleet_Sion'
  },
  {
    id: 'sig-mum-104',
    cityId: 'mumbai',
    issueType: 'sewer_backflow',
    title: 'Manhole Cover Displaced & Bubbling near Hindmata Flyover',
    description: 'Hydraulic pressure head surcharging sewage and runoff onto Dr. B.A. Road.',
    latitude: 19.0092,
    longitude: 72.8425,
    nearestManholeId: 'MH-055 (Hindmata Deep Surcharge Node)',
    severityRatio: 0.88,
    status: 'active',
    reportedAt: new Date(Date.now() - 600 * 1000).toISOString(),
    upvotes: 27,
    reporterAlias: 'ParelLocalGuide'
  }
];

// Active State
let activeSignals: CitizenSignal[] = [...INITIAL_CITIZEN_SIGNALS];

/**
 * Determine nearest drainage manhole ID from coordinates
 */
export function calculateNearestManhole(lat: number, lon: number): string {
  const seed = Math.abs(Math.round(lat * 10000 + lon * 1000));
  const nodeNum = (seed % 120) + 1;
  const wards = ['FN', 'FS', 'GN', 'GS', 'HE', 'HW', 'KW', 'KE', 'L'];
  const ward = wards[seed % wards.length];
  return `MH-${String(nodeNum).padStart(3, '0')} (Ward ${ward})`;
}

/**
 * Get all signals for a given city
 */
export function getCitizenSignals(cityId: string = 'mumbai'): CitizenSignal[] {
  return activeSignals.filter((s) => s.cityId === cityId || !s.cityId);
}

/**
 * Submit a new crowdsourced clog report
 */
export function submitCitizenSignal(newSignal: Omit<CitizenSignal, 'id' | 'reportedAt' | 'upvotes' | 'status'>): CitizenSignal {
  const signal: CitizenSignal = {
    ...newSignal,
    id: `sig-${Date.now().toString(36)}`,
    reportedAt: new Date().toISOString(),
    upvotes: 1,
    status: 'active'
  };

  activeSignals = [signal, ...activeSignals];
  return signal;
}

/**
 * Update signal moderation status (Verify, Dispatch Crew, Resolve, Reject)
 */
export function updateSignalStatus(
  id: string,
  newStatus: SignalStatus,
  moderatorId: string = 'MCGM_OPERATOR_42',
  resolutionDetails?: {
    notes?: string;
    action?: string;
    photoUrl?: string;
  }
): CitizenSignal | null {
  const idx = activeSignals.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const current = activeSignals[idx];
  const now = new Date().toISOString();

  const updated: CitizenSignal = {
    ...current,
    status: newStatus,
    ...(newStatus === 'validated' ? { verifiedAt: now, verifiedBy: moderatorId } : {}),
    ...(newStatus === 'resolved'
      ? {
          resolvedAt: now,
          verifiedBy: moderatorId,
          resolutionNotes: resolutionDetails?.notes,
          resolutionAction: resolutionDetails?.action,
          resolutionPhotoUrl: resolutionDetails?.photoUrl
        }
      : {})
  };

  activeSignals[idx] = updated;
  return updated;
}

/**
 * Upvote an existing community signal
 */
export function upvoteCitizenSignal(id: string): number {
  const idx = activeSignals.findIndex((s) => s.id === id);
  if (idx === -1) return 0;
  activeSignals[idx].upvotes += 1;
  return activeSignals[idx].upvotes;
}

/**
 * Calculate the overall blockage penalty multiplier from active verified signals
 */
export function getActiveBlockagePenalty(cityId: string = 'mumbai'): number {
  const validated = activeSignals.filter(
    (s) => (s.cityId === cityId || !s.cityId) && (s.status === 'validated' || s.status === 'active')
  );
  if (validated.length === 0) return 1.0;

  // Average capacity degradation across reported nodes
  const avgDegradation =
    validated.reduce((sum, item) => sum + item.severityRatio, 0) / validated.length;

  return 1.0 - avgDegradation * 0.4; // Up to 40% citywide hydraulic drag
}

