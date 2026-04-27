// X1 AiSpaces — commercial data
export type ComRole = 'employee' | 'contractor' | 'vendor' | 'visitor';
export type ComPresence = 'on-site' | 'off-site' | 'approaching' | 'unauthorized';
export type ComRisk = 'low' | 'medium' | 'high';
export type ComSpaceMode = 'open' | 'closed' | 'after-hours' | 'maintenance' | 'emergency';
export type ComSpaceState = 'active' | 'secure' | 'alert';
export type ComEventKind = 'identity' | 'security' | 'insight' | 'suggestion' | 'action' | 'anomaly';
export type ComEventPriority = 'critical' | 'high' | 'normal' | 'low';
export type ComActor = 'ai' | 'user' | 'system';
export type ComTrust = 'trusted' | 'familiar' | 'unknown' | 'suspicious';
export type ComAdaptiveState =
  | 'business-hours' | 'after-hours-secure' | 'closing-routine'
  | 'vendor-window' | 'maintenance' | 'incident-response';

export interface ComFeedEvent {
  id: string;
  kind: ComEventKind;
  priority: ComEventPriority;
  title: string;
  detail: string;
  spaceId?: string;
  personId?: string;
  timestamp: string;
  confidence?: number;
  reasoning?: string[];
  suggestedAction?: { label: string; impact: string };
  resolved?: boolean;
  // Decision-Engine extensions
  actor?: ComActor;
  whyItMatters?: string;
  pendingAction?: { label: string; countdownSec: number };
  quickActions?: { label: string; intent: 'view' | 'lock' | 'ignore' | 'approve' }[];
}

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
  // Trust + Intent extensions
  trust: ComTrust;
  intent?: string;
  intentConfidence?: number;
  visitFrequency?: string;
  typicalTimes?: string;
  anomalies?: string[];
  whyXiActed?: { time: string; action: string; reason: string }[];
  linkedAutomations?: { id: string; label: string }[];
}

export interface ComAdaptiveStateMeta {
  current: ComAdaptiveState;
  label: string;
  confidence: number;
  enteredAt: string;
  reason: string;
  next?: { state: string; etaMin: number; reason: string };
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
  adaptiveState?: ComAdaptiveStateMeta;
  stateTimeline?: { state: string; from: string; to: string }[];
}

// Outcome-based goals (commercial)
export interface ComGoal {
  id: string;
  title: string;
  description: string;
  icon: 'shield' | 'sun' | 'leaf' | 'sparkles';
  basedOn: string;
  generatedRules: {
    label: string;
    confidence: number;
    reasoning: string;
    impact: ('security' | 'energy' | 'convenience')[];
    enabled: boolean;
  }[];
}

export interface ComInsight {
  id: string;
  headline: string;
  detail: string;
  trend: 'up' | 'down' | 'flat';
  metric: string;
}

export type ComRuleCategory = 'security' | 'environment';

export interface ComRule {
  id: string;
  name: string;
  category: ComRuleCategory;
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
  // ── SECURITY ────────────────────────────────────────────
  {
    id: 'c-sec-1',
    name: 'Employee badge access',
    category: 'security',
    ifClause: 'IF employee badge scanned during scheduled hours',
    thenClause: 'THEN unlock zone · log entry · update occupancy',
    active: true,
  },
  {
    id: 'c-sec-2',
    name: 'After-hours intrusion',
    category: 'security',
    ifClause: 'IF motion detected after-hours AND no badge scan',
    thenClause: 'THEN alert security · lock perimeter · save 60s clip',
    active: true,
  },
  {
    id: 'c-sec-3',
    name: 'Vendor access window',
    category: 'security',
    ifClause: 'IF vendor arrives within scheduled window AND zones match',
    thenClause: 'THEN grant time-bound access · auto-expire · notify host',
    active: true,
  },
  {
    id: 'c-sec-4',
    name: 'Visitor escort',
    category: 'security',
    ifClause: 'IF visitor leaves authorized zone unescorted',
    thenClause: 'THEN alert host · log event · request return to escort',
    active: true,
  },
  {
    id: 'c-sec-5',
    name: 'All-sites secure at 8pm',
    category: 'security',
    ifClause: 'IF time = 8:00pm AND any site still open',
    thenClause: 'THEN switch to Closed · arm alarms · lock all doors',
    active: false,
    suggested: true,
    confidence: 0.93,
  },

  // ── ENVIRONMENT (HVAC, lighting) ────────────────────────
  {
    id: 'c-env-1',
    name: 'Open-hours HVAC ramp',
    category: 'environment',
    ifClause: 'IF site mode = Open AND occupancy > 10%',
    thenClause: 'THEN ramp HVAC to comfort setpoint · raise lighting to 80%',
    active: true,
  },
  {
    id: 'c-env-2',
    name: 'Zone lighting on entry',
    category: 'environment',
    ifClause: 'IF first person enters a zone',
    thenClause: 'THEN raise zone lighting to task level · log presence',
    active: true,
  },
  {
    id: 'c-env-3',
    name: 'Occupancy-aware HVAC',
    category: 'environment',
    ifClause: 'IF zone occupancy < 25% for 30 min',
    thenClause: 'THEN reduce HVAC + lighting in that zone',
    active: false,
    suggested: true,
    confidence: 0.86,
  },
  {
    id: 'c-env-4',
    name: 'Conf room idle shutoff',
    category: 'environment',
    ifClause: 'IF conference room booked but unoccupied > 15 min',
    thenClause: 'THEN release booking · cut HVAC + lighting in zone',
    active: false,
    suggested: true,
    confidence: 0.82,
  },
];

export const COM_FEED: ComFeedEvent[] = [
  {
    id: 'c-e1',
    kind: 'anomaly',
    priority: 'critical',
    title: 'Unusual entry attempt at Warehouse',
    detail: 'Back-entry door triggered after hours. No badge scan. Gait does not match staff.',
    spaceId: 'warehouse',
    personId: 'unauthorized',
    timestamp: '2 min ago',
    confidence: 0.91,
    reasoning: [
      'Door opened at 6:47pm — outside business hours (7a–5p)',
      'No badge scan within 30s window',
      'Gait analysis does not match any known identity',
      '2 nearby incident reports in past week',
    ],
    suggestedAction: { label: 'Lock all doors + notify security', impact: 'Locks 4 doors, alerts 3 people' },
  },
  {
    id: 'c-e2',
    kind: 'identity',
    priority: 'normal',
    title: 'Visitor Priya Shah checked in',
    detail: 'Pre-registered by Maria Lopez. Escorted to Conference A. Badge expires 12:30pm.',
    spaceId: 'office',
    personId: 'visitor',
    timestamp: '20 min ago',
    confidence: 0.99,
    resolved: true,
  },
  {
    id: 'c-e3',
    kind: 'identity',
    priority: 'normal',
    title: 'HVAC vendor approaching Warehouse',
    detail: 'Marcus Reed · CoolFlow. Appointment matches 2–4pm window. ETA 4 min.',
    spaceId: 'warehouse',
    personId: 'hvac',
    timestamp: '3 min ago',
    confidence: 0.96,
    suggestedAction: { label: 'Pre-stage escorted access', impact: 'Unlock mechanical room on arrival' },
  },
  {
    id: 'c-e4',
    kind: 'suggestion',
    priority: 'high',
    title: 'Auto-secure all sites at 8pm?',
    detail: 'Last 30 nights: every site closed within 8 min of 8pm — sometimes manually.',
    timestamp: '15 min ago',
    confidence: 0.93,
    reasoning: [
      'Office HQ closes 7:55–8:05pm consistently',
      'Warehouse closes by 5pm — already secured',
      'Retail closes 8:10–8:20pm with 5 min variance',
    ],
    suggestedAction: { label: 'Enable 8pm secure-all policy', impact: 'Locks 3 sites · arms alarms · logs sweep' },
  },
  {
    id: 'c-e5',
    kind: 'action',
    priority: 'low',
    title: 'BrightCo cleaning crew exited Office HQ',
    detail: '3-person crew exited 10:42pm. All zones swept. Vendor badge auto-expired for night.',
    spaceId: 'office',
    personId: 'cleaning',
    timestamp: '12 hr ago',
    confidence: 0.98,
    resolved: true,
  },
  {
    id: 'c-e6',
    kind: 'insight',
    priority: 'normal',
    title: 'Conference A under-utilized',
    detail: 'Booked 18 hrs this week, occupied only 6 hrs. HVAC and lighting ran the full 18.',
    spaceId: 'office',
    timestamp: '1 hr ago',
    confidence: 0.84,
    suggestedAction: { label: 'Tie HVAC to occupancy sensor', impact: 'Est. ~12 hrs/week saved' },
  },
  {
    id: 'c-e7',
    kind: 'security',
    priority: 'high',
    title: 'Visitor left authorized zone unescorted',
    detail: 'Priya Shah moved from Conference A toward Open Floor without escort.',
    spaceId: 'office',
    personId: 'visitor',
    timestamp: '6 min ago',
    confidence: 0.86,
    suggestedAction: { label: 'Notify host (Maria) + log event', impact: 'Maria pinged · audit entry written' },
  },
  {
    id: 'c-e8',
    kind: 'action',
    priority: 'low',
    title: 'Retail floor opened by James Okafor',
    detail: 'Alarm disarmed at 9:58a. Lighting + HVAC ramped to Open mode.',
    spaceId: 'retail',
    personId: 'james',
    timestamp: '2 hr ago',
    confidence: 0.99,
    resolved: true,
  },
];
