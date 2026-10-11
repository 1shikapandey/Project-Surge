export interface EmergencyServiceItem {
  id: string;
  number: string;
  telUri: string;
  category: 'disaster' | 'national' | 'municipal' | 'medical' | 'rescue' | 'police' | 'coastal';
  titleKey: string;
  descKey: string;
  badgeText: string;
  badgeColor: string;
  is24x7: boolean;
}

export const INDIAN_EMERGENCY_SERVICES: EmergencyServiceItem[] = [
  {
    id: 'ndrf-flood-helpline',
    number: '1078',
    telUri: 'tel:1078',
    category: 'disaster',
    titleKey: 'ndrfTitle',
    descKey: 'ndrfDesc',
    badgeText: 'NDRF Disaster Response',
    badgeColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
    is24x7: true
  },
  {
    id: 'national-emergency-112',
    number: '112',
    telUri: 'tel:112',
    category: 'national',
    titleKey: 'national112Title',
    descKey: 'national112Desc',
    badgeText: 'All-India Unified Emergency',
    badgeColor: 'bg-[#1a73e8]/10 text-[#1a73e8] border-[#1a73e8]/20',
    is24x7: true
  },
  {
    id: 'municipal-disaster-1916',
    number: '1916',
    telUri: 'tel:1916',
    category: 'municipal',
    titleKey: 'municipal1916Title',
    descKey: 'municipal1916Desc',
    badgeText: 'City Disaster Control Desk',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    is24x7: true
  },
  {
    id: 'ambulance-triage-108',
    number: '108',
    telUri: 'tel:108',
    category: 'medical',
    titleKey: 'ambulance108Title',
    descKey: 'ambulance108Desc',
    badgeText: 'Emergency Medical Triage',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    is24x7: true
  },
  {
    id: 'fire-rescue-101',
    number: '101',
    telUri: 'tel:101',
    category: 'rescue',
    titleKey: 'fire101Title',
    descKey: 'fire101Desc',
    badgeText: 'Fire & Flood Water Rescue',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
    is24x7: true
  },
  {
    id: 'police-control-100',
    number: '100',
    telUri: 'tel:100',
    category: 'police',
    titleKey: 'police100Title',
    descKey: 'police100Desc',
    badgeText: 'Police Control & Traffic Diversion',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
    is24x7: true
  },
  {
    id: 'coastal-security-1093',
    number: '1093',
    telUri: 'tel:1093',
    category: 'coastal',
    titleKey: 'coastal1093Title',
    descKey: 'coastal1093Desc',
    badgeText: 'Coastal Guard & High Water Patrol',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
    is24x7: true
  }
];
