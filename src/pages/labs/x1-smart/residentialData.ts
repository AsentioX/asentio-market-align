// X1 AiHome — residential data
export type ResPresence = 'home' | 'away' | 'approaching' | 'unknown';
export type ResRole = 'owner' | 'family' | 'guest' | 'vendor' | 'unknown';
export type ResHomeMode = 'home' | 'away' | 'night' | 'vacation';
export type ResSpaceState = 'active' | 'secure' | 'alert';
export type ResEventKind = 'identity' | 'security' | 'insight' | 'suggestion' | 'action' | 'anomaly';
export type ResEventPriority = 'critical' | 'high' | 'normal' | 'low';

export interface ResFeedEvent {
  id: string;
  kind: ResEventKind;
  priority: ResEventPriority;
  title: string;
  detail: string;
  spaceId?: string;
  personId?: string;
  timestamp: string;
  confidence?: number;
  reasoning?: string[];
  suggestedAction?: { label: string; impact: string };
  resolved?: boolean;
}

export interface ResPerson {
  id: string;
  name: string;
  role: ResRole;
  presence: ResPresence;
  initials: string;
  avatarColor: string;
  lastSeen: string;
  lastLocation: string;
  permissions: string[];
  accessWindow?: string; // for guests/vendors
  triggers: string[]; // automation triggers tied to this person
  recentActivity: { time: string; action: string }[];
  patterns: string[];
  devices: string[];
}

export interface ResSpace {
  id: string;
  name: string;
  type: 'primary' | 'vacation' | 'rental';
  state: ResSpaceState;
  mode: ResHomeMode;
  presentPeople: string[];
  alerts: number;
  rooms: { name: string; activity: 'active' | 'idle'; sensors: number }[];
  activeAutomations: string[];
  suggestedActions: string[];
}

export type ResRuleCategory = 'atmosphere' | 'security' | 'environment' | 'resident' | 'guest';

export interface ResRule {
  id: string;
  name: string;
  category: ResRuleCategory;
  ifClause: string;
  thenClause: string;
  active: boolean;
  suggested?: boolean;
  confidence?: number;
}

export const RES_PEOPLE: ResPerson[] = [
  {
    id: 'jon',
    name: 'Jon Cheng',
    role: 'owner',
    presence: 'home',
    initials: 'JC',
    avatarColor: 'from-indigo-500 via-blue-500 to-cyan-400',
    lastSeen: '2m ago',
    lastLocation: 'Living Room · Primary home',
    permissions: ['Full access', 'All spaces', 'Override autonomy'],
    triggers: [
      'Arrival → Lights to 60%, climate 71°, evening playlist',
      'Bedtime → Lock all doors, exterior lights off',
    ],
    recentActivity: [
      { time: '2m ago', action: 'Arrived home — face recognized at front door' },
      { time: '8m ago', action: 'Geofence entered (1.2 mi away)' },
      { time: '6h ago', action: 'Left for office' },
    ],
    patterns: ['Home by 6:45pm on weekdays', 'Locks doors at 10pm', 'Coffee scene at 7am'],
    devices: ['iPhone 17 Pro', 'Apple Watch Ultra', 'Tesla Model Y'],
  },
  {
    id: 'sarah',
    name: 'Sarah Cheng',
    role: 'family',
    presence: 'approaching',
    initials: 'SC',
    avatarColor: 'from-pink-500 via-rose-400 to-orange-400',
    lastSeen: 'Now',
    lastLocation: '0.4 mi away · ETA 2 min',
    permissions: ['Full access', 'All spaces'],
    triggers: ['Approaching → Garage door opens, hallway lights on'],
    recentActivity: [
      { time: '2m ago', action: 'Geofence approach — 0.4 mi from home' },
      { time: '2h ago', action: 'Left office in SF' },
    ],
    patterns: ['Returns ~6pm', 'Yoga scene Tue/Thu 7am'],
    devices: ['iPhone 16', 'Apple Watch S10'],
  },
  {
    id: 'maya',
    name: 'Maya Patel',
    role: 'guest',
    presence: 'away',
    initials: 'MP',
    avatarColor: 'from-violet-500 via-purple-500 to-fuchsia-400',
    lastSeen: 'Yesterday 9pm',
    lastLocation: 'Lake Tahoe rental',
    permissions: ['Tahoe rental only', 'No alarm override'],
    accessWindow: 'Fri 3pm → Sun 11am',
    triggers: ['Check-in → Welcome scene + WiFi handed off'],
    recentActivity: [
      { time: 'Yesterday', action: 'Checked into Tahoe rental — code #4471' },
      { time: '3d ago', action: 'Reservation confirmed — temp credentials issued' },
    ],
    patterns: ['First-time guest'],
    devices: ['Temporary code #4471'],
  },
  {
    id: 'fedex',
    name: 'FedEx Driver',
    role: 'vendor',
    presence: 'away',
    initials: 'FX',
    avatarColor: 'from-purple-500 via-violet-500 to-indigo-500',
    lastSeen: '34m ago',
    lastLocation: 'Front porch · Primary home',
    permissions: ['Front porch only', 'Daytime hours'],
    accessWindow: 'Mon–Fri 9am–6pm',
    triggers: ['Recognized → Door unlocks 30s, package shelf lit, auto-relock'],
    recentActivity: [
      { time: '34m ago', action: 'Package dropped — door auto-relocked' },
      { time: '35m ago', action: 'Uniform + truck recognized' },
    ],
    patterns: ['Recurring weekday deliveries'],
    devices: ['Vendor profile #DLV-FDX'],
  },
  {
    id: 'unknown',
    name: 'Unrecognized Person',
    role: 'unknown',
    presence: 'unknown',
    initials: '?',
    avatarColor: 'from-rose-500 via-red-500 to-orange-500',
    lastSeen: '3m ago',
    lastLocation: 'Back door · Primary home',
    permissions: ['No access'],
    triggers: ['Unknown face → Camera focus, alert owner, log clip'],
    recentActivity: [
      { time: '3m ago', action: 'Motion + face detected — no match in identity library' },
      { time: '3m ago', action: 'Lingered 47s near back door' },
    ],
    patterns: ['First sighting — flagged for review'],
    devices: ['No paired devices'],
  },
];

export const RES_SPACES: ResSpace[] = [
  {
    id: 'primary',
    name: 'Primary · Palo Alto',
    type: 'primary',
    state: 'active',
    mode: 'home',
    presentPeople: ['jon'],
    alerts: 1,
    rooms: [
      { name: 'Living Room', activity: 'active', sensors: 6 },
      { name: 'Kitchen', activity: 'idle', sensors: 4 },
      { name: 'Front Door', activity: 'idle', sensors: 3 },
      { name: 'Back Door', activity: 'active', sensors: 3 },
      { name: 'Garage', activity: 'idle', sensors: 2 },
      { name: 'Backyard', activity: 'idle', sensors: 4 },
    ],
    activeAutomations: ['Evening scene · 7:42pm', 'Sarah arrival prep · ETA 2min'],
    suggestedActions: ['Switch to Night mode at 10pm', 'Lock back door (open 4m)'],
  },
  {
    id: 'vacation',
    name: 'Vacation · Aspen',
    type: 'vacation',
    state: 'secure',
    mode: 'vacation',
    presentPeople: [],
    alerts: 0,
    rooms: [
      { name: 'Front Door', activity: 'idle', sensors: 3 },
      { name: 'Living Room', activity: 'idle', sensors: 4 },
      { name: 'Garage', activity: 'idle', sensors: 2 },
    ],
    activeAutomations: ['Lights randomized', 'Eco HVAC', 'Heightened alerts'],
    suggestedActions: ['Pre-arrival warm-up Sat 2pm'],
  },
  {
    id: 'rental',
    name: 'Rental · Lake Tahoe',
    type: 'rental',
    state: 'secure',
    mode: 'away',
    presentPeople: [],
    alerts: 0,
    rooms: [
      { name: 'Front Door', activity: 'idle', sensors: 3 },
      { name: 'Living Room', activity: 'idle', sensors: 4 },
      { name: 'Hot Tub', activity: 'idle', sensors: 2 },
    ],
    activeAutomations: ['Awaiting guest check-in Fri 3pm'],
    suggestedActions: ['Send Maya welcome code 1hr before arrival'],
  },
];

export const RES_RULES: ResRule[] = [
  {
    id: 'r1',
    name: 'Welcome Jon home',
    ifClause: 'IF Jon arrives at Primary home',
    thenClause: 'THEN unlock front door · evening lights · climate 71° · play playlist',
    active: true,
  },
  {
    id: 'r2',
    name: 'Stranger danger',
    ifClause: 'IF unrecognized person at any door > 30s',
    thenClause: 'THEN focus camera · push alert · lock all doors · save clip',
    active: true,
  },
  {
    id: 'r3',
    name: 'Last person leaves',
    ifClause: 'IF nobody present + everyone away > 10 min',
    thenClause: 'THEN switch to Away mode · arm system · set eco HVAC',
    active: true,
  },
  {
    id: 'r4',
    name: 'Guest check-in handoff',
    ifClause: 'IF Maya arrives at Tahoe rental during access window',
    thenClause: 'THEN issue WiFi · welcome scene · share house guide',
    active: true,
  },
  {
    id: 'r5',
    name: 'Auto-lock at 10pm',
    ifClause: 'IF time = 10:00pm AND someone home',
    thenClause: 'THEN lock all exterior doors',
    active: false,
    suggested: true,
    confidence: 0.88,
  },
  {
    id: 'r6',
    name: 'Multi-home handoff',
    ifClause: 'IF leaving Primary AND heading to Aspen',
    thenClause: 'THEN pre-warm Aspen + arm Primary',
    active: false,
    suggested: true,
    confidence: 0.81,
  },
];

export const RES_FEED: ResFeedEvent[] = [
  {
    id: 'r-e1',
    kind: 'identity',
    priority: 'normal',
    title: 'Welcome home, Jon',
    detail: 'Recognized at front door. Door unlocked, hallway lights → 60%, climate → 71°.',
    spaceId: 'primary',
    personId: 'jon',
    timestamp: '2 min ago',
    confidence: 0.99,
    resolved: true,
  },
  {
    id: 'r-e2',
    kind: 'security',
    priority: 'high',
    title: 'Unrecognized person near back door',
    detail: 'Lingered 47 seconds. No identity match. No knock or interaction with door.',
    spaceId: 'primary',
    personId: 'unknown',
    timestamp: '8 min ago',
    confidence: 0.78,
    reasoning: [
      'Face not in identity library',
      'Dwell time exceeded 30s threshold',
      'No expected delivery or appointment',
    ],
    suggestedAction: { label: 'Add to watchlist + save clip', impact: 'Future sightings auto-flagged' },
  },
  {
    id: 'r-e3',
    kind: 'identity',
    priority: 'normal',
    title: 'Sarah is approaching home',
    detail: 'Geofence entered 0.4 mi out — ETA 2 min. Garage door queued, hallway lights staged.',
    spaceId: 'primary',
    personId: 'sarah',
    timestamp: '3 min ago',
    confidence: 0.97,
  },
  {
    id: 'r-e4',
    kind: 'suggestion',
    priority: 'normal',
    title: 'Automate your 10pm lock routine?',
    detail: "You've manually locked the front door between 9:55–10:10pm on 23 of the last 30 nights.",
    spaceId: 'primary',
    timestamp: '12 min ago',
    confidence: 0.88,
    reasoning: [
      'Pattern detected over 30-day window',
      '23/30 nights between 9:55–10:10pm',
      'Always when you are home',
    ],
    suggestedAction: { label: 'Enable auto-lock at 10pm', impact: 'Runs nightly when you are home' },
  },
  {
    id: 'r-e5',
    kind: 'action',
    priority: 'low',
    title: 'Door unlocked for FedEx → relocked',
    detail: 'FedEx driver recognized. Front door unlocked for 47s, package placed, auto-relocked.',
    spaceId: 'primary',
    personId: 'fedex',
    timestamp: '34 min ago',
    confidence: 0.96,
    resolved: true,
  },
  {
    id: 'r-e6',
    kind: 'insight',
    priority: 'normal',
    title: 'Energy use down 18% this week',
    detail: 'Adaptive scenes reduced HVAC runtime by 4.2 hours vs last week. No comfort complaints.',
    spaceId: 'primary',
    timestamp: '1 hr ago',
    confidence: 0.82,
  },
  {
    id: 'r-e7',
    kind: 'suggestion',
    priority: 'high',
    title: 'Enable Vacation Mode for Tahoe rental?',
    detail: 'No presence detected for 6 days. Maya checks in Friday 3pm.',
    spaceId: 'rental',
    timestamp: '2 hr ago',
    confidence: 0.94,
    suggestedAction: { label: 'Enable vacation mode', impact: 'Lights randomized, alerts heightened, eco HVAC' },
  },
  {
    id: 'r-e8',
    kind: 'action',
    priority: 'normal',
    title: 'Aspen home pre-warmed for weekend trip',
    detail: 'Calendar shows Aspen trip Sat. Heat ramped to 68°, water on, lights staged.',
    spaceId: 'vacation',
    timestamp: '4 hr ago',
    confidence: 0.9,
    resolved: true,
  },
];
