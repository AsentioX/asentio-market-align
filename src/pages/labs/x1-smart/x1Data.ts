// Mock data for X1 Smart - AI-first intelligent space platform

export type EventPriority = 'critical' | 'high' | 'normal' | 'low';
export type EventKind = 'identity' | 'security' | 'insight' | 'suggestion' | 'action' | 'anomaly';
export type PresenceState = 'home' | 'away' | 'approaching' | 'unknown';
export type SpaceState = 'secure' | 'active' | 'idle' | 'alert';
export type AutonomyMode = 'manual' | 'assisted' | 'autonomous';

export interface FeedEvent {
  id: string;
  kind: EventKind;
  priority: EventPriority;
  title: string;
  detail: string;
  spaceId?: string;
  personId?: string;
  timestamp: string; // relative
  confidence?: number; // 0-1
  reasoning?: string[];
  suggestedAction?: { label: string; impact: string };
  resolved?: boolean;
}

export interface Person {
  id: string;
  name: string;
  role: 'owner' | 'family' | 'employee' | 'guest' | 'vendor' | 'unknown';
  presence: PresenceState;
  avatarColor: string;
  initials: string;
  lastSeen: string;
  recentActivity: { time: string; action: string; spaceId?: string }[];
  permissions: string[];
  patterns: string[];
  devices: string[];
}

export interface Space {
  id: string;
  name: string;
  type: 'home' | 'office' | 'rental' | 'warehouse';
  state: SpaceState;
  presentPeople: string[]; // person ids
  activeEvents: number;
  mode: 'home' | 'away' | 'night' | 'business';
  rooms: { name: string; activity: 'active' | 'idle'; sensors: number }[];
  suggestedActions: string[];
}

export const PEOPLE: Person[] = [
  {
    id: 'jon',
    name: 'Jon Cheng',
    role: 'owner',
    presence: 'home',
    avatarColor: 'from-blue-500 to-cyan-400',
    initials: 'JC',
    lastSeen: 'Now · Living Room',
    recentActivity: [
      { time: '2m ago', action: 'Arrived home — face recognized at front door', spaceId: 'home' },
      { time: '8m ago', action: 'Geofence entered (1.2 mi away)', spaceId: 'home' },
      { time: '6h ago', action: 'Left for office', spaceId: 'office' },
    ],
    permissions: ['Full access', 'All spaces', 'Override autonomy', 'Manage people'],
    patterns: ['Home by 6:45pm on weekdays', 'Locks doors at 10pm', 'Coffee scene at 7am'],
    devices: ['iPhone 17 Pro', 'Apple Watch Ultra', 'Tesla Model Y'],
  },
  {
    id: 'sarah',
    name: 'Sarah Cheng',
    role: 'family',
    presence: 'away',
    avatarColor: 'from-pink-500 to-rose-400',
    initials: 'SC',
    lastSeen: '2h ago · Office',
    recentActivity: [
      { time: '2h ago', action: 'Left home — geofence exit', spaceId: 'home' },
      { time: '2h ago', action: 'Garage door auto-closed', spaceId: 'home' },
    ],
    permissions: ['Full access', 'All spaces', 'Approve suggestions'],
    patterns: ['Returns ~6pm', 'Yoga scene Tue/Thu 7am'],
    devices: ['iPhone 16', 'Apple Watch S10'],
  },
  {
    id: 'maria',
    name: 'Maria Lopez',
    role: 'employee',
    presence: 'home',
    avatarColor: 'from-emerald-500 to-teal-400',
    initials: 'ML',
    lastSeen: 'Now · Warehouse B',
    recentActivity: [
      { time: '12m ago', action: 'Badge scan — entered Warehouse B', spaceId: 'warehouse-b' },
      { time: '1h ago', action: 'Entered Office HQ', spaceId: 'office' },
    ],
    permissions: ['Office HQ', 'Warehouse B', 'Business hours only'],
    patterns: ['On-site M–F 8am–5pm', 'Closes Warehouse B at 5pm'],
    devices: ['Badge #4471', 'Company iPhone'],
  },
  {
    id: 'unknown-1',
    name: 'Unrecognized Person',
    role: 'unknown',
    presence: 'approaching',
    avatarColor: 'from-cyan-500 to-blue-500',
    initials: '?',
    lastSeen: '3m ago · Back door',
    recentActivity: [
      { time: '3m ago', action: 'Motion + face detected — no match in identity library', spaceId: 'home' },
      { time: '3m ago', action: 'Lingered 47s near back door', spaceId: 'home' },
    ],
    permissions: ['No access'],
    patterns: ['First sighting — flagged for review'],
    devices: ['No paired devices'],
  },
  {
    id: 'delivery',
    name: 'FedEx Driver',
    role: 'vendor',
    presence: 'away',
    avatarColor: 'from-purple-500 to-violet-400',
    initials: 'FX',
    lastSeen: '34m ago · Front porch',
    recentActivity: [
      { time: '34m ago', action: 'Package dropped — door auto-relocked', spaceId: 'home' },
      { time: '35m ago', action: 'Uniform + truck recognized', spaceId: 'home' },
    ],
    permissions: ['Front porch only', 'Daytime'],
    patterns: ['Recurring weekday deliveries'],
    devices: ['Vendor profile #DLV-FDX'],
  },
];

export const SPACES: Space[] = [
  {
    id: 'home',
    name: 'Home · Palo Alto',
    type: 'home',
    state: 'active',
    presentPeople: ['jon'],
    activeEvents: 3,
    mode: 'home',
    rooms: [
      { name: 'Living Room', activity: 'active', sensors: 6 },
      { name: 'Kitchen', activity: 'idle', sensors: 4 },
      { name: 'Front Door', activity: 'idle', sensors: 3 },
      { name: 'Back Door', activity: 'active', sensors: 3 },
      { name: 'Garage', activity: 'idle', sensors: 2 },
      { name: 'Backyard', activity: 'idle', sensors: 4 },
    ],
    suggestedActions: ['Switch to Evening scene', 'Lock back door (open 4m)'],
  },
  {
    id: 'office',
    name: 'Office HQ · SF',
    type: 'office',
    state: 'active',
    presentPeople: ['sarah'],
    activeEvents: 1,
    mode: 'business',
    rooms: [
      { name: 'Reception', activity: 'active', sensors: 4 },
      { name: 'Open Floor', activity: 'active', sensors: 12 },
      { name: 'Server Room', activity: 'idle', sensors: 3 },
      { name: 'Conference A', activity: 'idle', sensors: 2 },
    ],
    suggestedActions: ['Auto-lock at 7pm (12 people on-site)'],
  },
  {
    id: 'warehouse-b',
    name: 'Warehouse B · Oakland',
    type: 'warehouse',
    state: 'alert',
    presentPeople: ['maria'],
    activeEvents: 2,
    mode: 'business',
    rooms: [
      { name: 'Loading Bay', activity: 'active', sensors: 5 },
      { name: 'Cold Storage', activity: 'idle', sensors: 3 },
      { name: 'Back Entry', activity: 'active', sensors: 2 },
    ],
    suggestedActions: ['Lock all doors + notify team', 'Review back-entry footage'],
  },
  {
    id: 'rental',
    name: 'Rental · Lake Tahoe',
    type: 'rental',
    state: 'secure',
    presentPeople: [],
    activeEvents: 0,
    mode: 'away',
    rooms: [
      { name: 'Front Door', activity: 'idle', sensors: 3 },
      { name: 'Living Room', activity: 'idle', sensors: 4 },
      { name: 'Garage', activity: 'idle', sensors: 2 },
    ],
    suggestedActions: ['Pre-arrival scene Fri 3pm (guest check-in)'],
  },
];

export const FEED_EVENTS: FeedEvent[] = [
  {
    id: 'e1',
    kind: 'anomaly',
    priority: 'critical',
    title: 'Unusual entry attempt at Warehouse B',
    detail: 'Back-entry door triggered after hours. No badge scan. Motion patterns inconsistent with staff.',
    spaceId: 'warehouse-b',
    timestamp: '2 min ago',
    confidence: 0.91,
    reasoning: [
      'Door opened at 6:47pm — outside business hours (8a–5p)',
      'No badge scan within 30s window',
      'Gait analysis does not match any known identity',
      'Cross-referenced with neighborhood incident reports — 2 nearby in past week',
    ],
    suggestedAction: { label: 'Lock all doors + notify team', impact: 'Locks 4 doors, alerts 3 people' },
  },
  {
    id: 'e2',
    kind: 'identity',
    priority: 'normal',
    title: 'Welcome home, Jon',
    detail: 'Recognized at front door. Door unlocked, hallway lights at 60%, thermostat → 71°.',
    spaceId: 'home',
    personId: 'jon',
    timestamp: '4 min ago',
    confidence: 0.99,
    resolved: true,
  },
  {
    id: 'e3',
    kind: 'suggestion',
    priority: 'normal',
    title: 'Automate your 10pm lock routine?',
    detail: 'You\'ve manually locked the front door between 9:55–10:10pm on 23 of the last 30 nights.',
    spaceId: 'home',
    timestamp: '12 min ago',
    confidence: 0.88,
    reasoning: [
      'Pattern detected over 30-day window',
      '23/30 nights between 9:55–10:10pm',
      'Always when you are home (presence verified)',
    ],
    suggestedAction: { label: 'Enable auto-lock at 10pm', impact: 'Runs nightly when you are home' },
  },
  {
    id: 'e4',
    kind: 'action',
    priority: 'low',
    title: 'Door unlocked for delivery → relocked',
    detail: 'FedEx driver recognized. Front door unlocked for 47s, package placed, auto-relocked.',
    spaceId: 'home',
    personId: 'delivery',
    timestamp: '34 min ago',
    confidence: 0.96,
    resolved: true,
  },
  {
    id: 'e5',
    kind: 'insight',
    priority: 'normal',
    title: 'Energy use down 18% this week',
    detail: 'Adaptive scenes reduced HVAC runtime by 4.2 hours vs last week. No comfort complaints.',
    spaceId: 'home',
    timestamp: '1 hr ago',
    confidence: 0.82,
  },
  {
    id: 'e6',
    kind: 'suggestion',
    priority: 'high',
    title: 'Enable Vacation Mode for Tahoe rental?',
    detail: 'No presence detected for 6 days. Next guest check-in Friday 3pm.',
    spaceId: 'rental',
    timestamp: '2 hr ago',
    confidence: 0.94,
    suggestedAction: { label: 'Enable vacation mode', impact: 'Lights randomized, alerts heightened, eco HVAC' },
  },
  {
    id: 'e7',
    kind: 'security',
    priority: 'high',
    title: 'Unrecognized person near back door',
    detail: 'Lingered 47 seconds. No identity match. No knock or interaction with door.',
    spaceId: 'home',
    personId: 'unknown-1',
    timestamp: '3 hr ago',
    confidence: 0.78,
    reasoning: [
      'Face not in identity library',
      'Dwell time exceeded 30s threshold',
      'No expected delivery or appointment',
    ],
    suggestedAction: { label: 'Add to watchlist + save clip', impact: 'Future sightings auto-flagged' },
  },
];

export const AUTONOMY_LEVELS: { value: AutonomyMode; label: string; description: string }[] = [
  { value: 'manual', label: 'Manual', description: 'System observes only. You make every decision.' },
  { value: 'assisted', label: 'Assisted', description: 'System suggests. You approve before any action.' },
  { value: 'autonomous', label: 'Autonomous', description: 'System acts on high-confidence decisions. You review after.' },
];
