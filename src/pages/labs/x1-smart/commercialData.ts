// X1 AiSpaces — commercial data
export type ComRole = 'employee' | 'contractor' | 'vendor' | 'visitor';
export type ComPresence = 'on-site' | 'off-site' | 'approaching' | 'unauthorized';
export type ComRisk = 'low' | 'medium' | 'high';
export type ComSpaceMode = 'open' | 'closed' | 'after-hours' | 'maintenance' | 'emergency';
export type ComSpaceState = 'active' | 'secure' | 'alert';

export interface ComPerson {
  id: string;
  name: string;
  role: ComRole;
  title: string;
  presence: ComPresence;
  initials: string;
  avatarColor: string;
  accessLevel: 'full' | 'standard' | 'limited' | 'escorted';
  zones: string[];
  schedule: string;
  realTimeLocation: string;
  risk: ComRisk;
  recentEvents: { time: string; action: string; zone?: string }[];
  badge?: string;
  expiresAt?: string;
}

export interface ComSpace {
  id: string;
  name: string;
  type: 'office' | 'warehouse' | 'retail';
  state: ComSpaceState;
  mode: ComSpaceMode;
  occupancy: number;
  capacity: number;
  issues: number;
  zones: { name: string; activity: 'active' | 'idle' | 'restricted'; people: number }[];
  activePolicies: string[];
  liveActivity: { time: string; action: string }[];
  suggestedActions: string[];
}

export interface ComRule {
  id: string;
  name: string;
  ifClause: string;
  thenClause: string;
  active: boolean;
  suggested?: boolean;
  confidence?: number;
}

export const COM_PEOPLE: ComPerson[] = [
  {
    id: 'maria',
    name: 'Maria Lopez',
    role: 'employee',
    title: 'Operations Lead',
    presence: 'on-site',
    initials: 'ML',
    avatarColor: 'from-emerald-500 via-teal-400 to-cyan-400',
    accessLevel: 'full',
    zones: ['Office HQ', 'Warehouse', 'Retail'],
    schedule: 'Mon–Fri · 8a–6p',
    realTimeLocation: 'Warehouse · Loading Bay',
    risk: 'low',
    badge: '#4471',
    recentEvents: [
      { time: '12m ago', action: 'Badge scan — entered Warehouse', zone: 'Warehouse' },
      { time: '1h ago', action: 'Entered Office HQ', zone: 'Office HQ' },
      { time: '8:02a', action: 'Clocked in', zone: 'Office HQ' },
    ],
  },
  {
    id: 'james',
    name: 'James Okafor',
    role: 'employee',
    title: 'Retail Associate',
    presence: 'on-site',
    initials: 'JO',
    avatarColor: 'from-indigo-500 via-blue-500 to-cyan-400',
    accessLevel: 'standard',
    zones: ['Retail floor', 'Stockroom'],
    schedule: 'Tue–Sat · 10a–7p',
    realTimeLocation: 'Retail · Floor',
    risk: 'low',
    badge: '#3120',
    recentEvents: [
      { time: '2h ago', action: 'Opened retail location', zone: 'Retail' },
      { time: '9:58a', action: 'Disarmed alarm', zone: 'Retail' },
    ],
  },
  {
    id: 'cleaning',
    name: 'BrightCo Cleaning',
    role: 'contractor',
    title: 'Nightly cleaning crew (3 people)',
    presence: 'off-site',
    initials: 'BC',
    avatarColor: 'from-violet-500 via-purple-500 to-fuchsia-400',
    accessLevel: 'limited',
    zones: ['Office HQ · Common areas'],
    schedule: 'Mon/Wed/Fri · 8p–11p',
    realTimeLocation: 'Off-site',
    risk: 'low',
    badge: 'Vendor #BC-09',
    expiresAt: 'Dec 31, 2025',
    recentEvents: [
      { time: 'Yesterday 10:42p', action: 'Exited Office HQ', zone: 'Office HQ' },
      { time: 'Yesterday 8:01p', action: 'Entered Office HQ via vendor entry', zone: 'Office HQ' },
    ],
  },
  {
    id: 'hvac',
    name: 'Marcus Reed',
    role: 'vendor',
    title: 'HVAC technician · CoolFlow',
    presence: 'approaching',
    initials: 'MR',
    avatarColor: 'from-amber-500 via-orange-400 to-rose-500',
    accessLevel: 'escorted',
    zones: ['Warehouse · Mechanical room'],
    schedule: 'Today only · 2p–4p',
    realTimeLocation: '0.6 mi away · ETA 4 min',
    risk: 'medium',
    badge: 'One-time #VND-882',
    expiresAt: 'Today 4:00pm',
    recentEvents: [
      { time: '3m ago', action: 'Approaching Warehouse — appointment matches' },
      { time: '2 days ago', action: 'Background check verified' },
    ],
  },
  {
    id: 'visitor',
    name: 'Priya Shah',
    role: 'visitor',
    title: 'Investor meeting · Hosted by Maria',
    presence: 'on-site',
    initials: 'PS',
    avatarColor: 'from-pink-500 via-rose-400 to-orange-400',
    accessLevel: 'escorted',
    zones: ['Office HQ · Reception, Conf A'],
    schedule: 'Today · 11a–12:30p',
    realTimeLocation: 'Office HQ · Conference A',
    risk: 'low',
    badge: 'Visitor #V-228',
    expiresAt: 'Today 12:30pm',
    recentEvents: [
      { time: '20m ago', action: 'Checked in at reception' },
      { time: '21m ago', action: 'Pre-registered by Maria Lopez' },
    ],
  },
  {
    id: 'unauthorized',
    name: 'Unidentified individual',
    role: 'visitor',
    title: 'No badge · No appointment',
    presence: 'unauthorized',
    initials: '?',
    avatarColor: 'from-rose-500 via-red-500 to-orange-500',
    accessLevel: 'limited',
    zones: ['—'],
    schedule: '—',
    realTimeLocation: 'Warehouse · Back entry',
    risk: 'high',
    recentEvents: [
      { time: '2m ago', action: 'Door triggered after hours · no badge scan' },
      { time: '3m ago', action: 'Loitered near back entry 47s' },
    ],
  },
];

export const COM_SPACES: ComSpace[] = [
  {
    id: 'office',
    name: 'Office HQ · San Francisco',
    type: 'office',
    state: 'active',
    mode: 'open',
    occupancy: 12,
    capacity: 60,
    issues: 0,
    zones: [
      { name: 'Reception', activity: 'active', people: 2 },
      { name: 'Open Floor', activity: 'active', people: 8 },
      { name: 'Conference A', activity: 'active', people: 2 },
      { name: 'Server Room', activity: 'restricted', people: 0 },
    ],
    activePolicies: ['Open 8a–7p', 'Visitor escort required', 'Auto-lock at 7pm'],
    liveActivity: [
      { time: '20m ago', action: 'Visitor Priya Shah checked in' },
      { time: '1h ago', action: 'Maria Lopez entered' },
    ],
    suggestedActions: ['Switch to Closed at 7pm (12 on-site)'],
  },
  {
    id: 'warehouse',
    name: 'Warehouse · Oakland',
    type: 'warehouse',
    state: 'alert',
    mode: 'open',
    occupancy: 1,
    capacity: 25,
    issues: 1,
    zones: [
      { name: 'Loading Bay', activity: 'active', people: 1 },
      { name: 'Cold Storage', activity: 'restricted', people: 0 },
      { name: 'Back Entry', activity: 'active', people: 0 },
    ],
    activePolicies: ['Open 7a–5p', 'Badge required all zones', 'After-hours = Alert'],
    liveActivity: [
      { time: '2m ago', action: '⚠ Back entry triggered — no badge match' },
      { time: '12m ago', action: 'Maria Lopez badge scan' },
    ],
    suggestedActions: ['Lock all doors + notify security', 'Review back-entry footage'],
  },
  {
    id: 'retail',
    name: 'Retail · Mission Store',
    type: 'retail',
    state: 'active',
    mode: 'open',
    occupancy: 4,
    capacity: 30,
    issues: 0,
    zones: [
      { name: 'Floor', activity: 'active', people: 3 },
      { name: 'Stockroom', activity: 'active', people: 1 },
      { name: 'Cash Office', activity: 'restricted', people: 0 },
    ],
    activePolicies: ['Open 10a–8p', 'Stockroom = staff only', 'Alarm arms 8:15pm'],
    liveActivity: [
      { time: '2h ago', action: 'James Okafor opened location' },
      { time: '2h ago', action: 'Alarm disarmed' },
    ],
    suggestedActions: ['Stage closing routine 7:50pm'],
  },
];

export const COM_RULES: ComRule[] = [
  {
    id: 'c1',
    name: 'Employee badge access',
    ifClause: 'IF employee badge scanned during scheduled hours',
    thenClause: 'THEN unlock zone · log entry · update occupancy',
    active: true,
  },
  {
    id: 'c2',
    name: 'After-hours intrusion',
    ifClause: 'IF motion detected after-hours AND no badge scan',
    thenClause: 'THEN alert security · lock perimeter · save 60s clip',
    active: true,
  },
  {
    id: 'c3',
    name: 'Vendor access window',
    ifClause: 'IF vendor arrives within scheduled window AND zones match',
    thenClause: 'THEN grant time-bound access · auto-expire · notify host',
    active: true,
  },
  {
    id: 'c4',
    name: 'Visitor escort',
    ifClause: 'IF visitor leaves authorized zone unescorted',
    thenClause: 'THEN alert host · log event · request return to escort',
    active: true,
  },
  {
    id: 'c5',
    name: 'All-sites secure at 8pm',
    ifClause: 'IF time = 8:00pm AND any site still open',
    thenClause: 'THEN switch to Closed · arm alarms · lock all doors',
    active: false,
    suggested: true,
    confidence: 0.93,
  },
  {
    id: 'c6',
    name: 'Occupancy-aware HVAC',
    ifClause: 'IF zone occupancy < 25% for 30 min',
    thenClause: 'THEN reduce HVAC + lighting in that zone',
    active: false,
    suggested: true,
    confidence: 0.86,
  },
];
