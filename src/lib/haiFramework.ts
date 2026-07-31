// Asentio Human-AI Framework
// The directory is organized around how companies augment human capability
// through AI — not around a technology category. Everything begins with the human.

export type HAIDimensionKey =
  | 'hai_category'
  | 'human_activities'
  | 'human_capabilities'
  | 'ai_capabilities'
  | 'human_interface'
  | 'industry_focus'
  | 'ecosystem_roles';

/** Top-level Category — a rollup of interfaces / AI capabilities. */
export interface HAICategory {
  value: string;
  label: string;
  human_interface: string[];
  ai_capabilities?: string[];
}

export const HAI_CATEGORIES: HAICategory[] = [
  {
    value: 'AI Intelligence',
    label: 'AI Intelligence (AI Assistant, Voice AI, Vision AI, Knowledge AI)',
    human_interface: ['Conversational'],
    ai_capabilities: ['Reason', 'Perceive', 'Communicate', 'Plan', 'Automate'],
  },
  {
    value: 'Personal Devices',
    label: 'Personal Devices (Glasses, Headphones, Watches, Rings, Pendants, Mobile)',
    human_interface: ['Personal Devices'],
  },
  {
    value: 'Embodied AI',
    label: 'Embodied AI (Robots, Autonomous Mobility, Drones)',
    human_interface: ['Embodied'],
  },
  {
    value: 'Environment',
    label: 'Environment (Smart Home, Sensors, Displays)',
    human_interface: ['Environment'],
  },
];

export const HAI_CATEGORY_VALUES = HAI_CATEGORIES.map((c) => c.value);

export const haiCategoryLabel = (value: string) =>
  HAI_CATEGORIES.find((c) => c.value === value)?.label || value;


export interface HAIDimension {
  key: HAIDimensionKey;
  label: string;
  question: string;
  blurb: string;
  values: string[];
}

export const HUMAN_ACTIVITIES = [
  'Observe',
  'Operate',
  'Think',
  'Collaborate',
  'Serve',
  'Create',
  'Protect',
  'Learn',
  'Navigate',
];

/** Display labels for Human Activities values (short value → descriptive label). */
export const HUMAN_ACTIVITY_LABELS: Record<string, string> = {
  Observe: 'Observe (Quality Assurance, Diagnostics, Situational Awareness)',
  Operate: 'Operate (Material Handling, Installation, Manufacturing, Cleaning)',
  Think: 'Think (Planning, Forecasting, Recommendations, Scheduling)',
  Collaborate: 'Collaborate (Remote Assistance, Meetings, Coaching)',
  Serve: 'Serve (Hospitality, Sales, Education)',
  Create: 'Create (Design, Coding, Video Creation, Image Generation)',
  Protect: 'Protect (Compliance, Emergency Response, Risk Assessment)',
  Learn: 'Learn (Training, Remote Assist)',
  Navigate: 'Navigate (Way Finding)',
};

export const haiActivityLabel = (value: string): string =>
  HUMAN_ACTIVITY_LABELS[value] || value;

/**
 * Resolve the display label for any framework dimension value.
 * Dimensions with rich labels (Category, Human Activities) expand to their
 * descriptive label; all other dimensions return the value unchanged.
 */
export const haiValueLabel = (key: HAIDimensionKey, value: string): string => {
  if (key === 'hai_category') return haiCategoryLabel(value);
  if (key === 'human_activities') return haiActivityLabel(value);
  if (key === 'human_capabilities') return haiCapabilityLabel(value);
  if (key === 'ai_capabilities') return haiAICapabilityLabel(value);
  if (key === 'human_interface') return haiInterfaceLabel(value);
  return value;
};

export const HUMAN_CAPABILITIES = [
  'Perceive', 'Think', 'Communicate', 'Act', 'Navigate', 'Supervise', 'Create',
];

/** Display labels for Human Capabilities values. */
export const HUMAN_CAPABILITY_LABELS: Record<string, string> = {
  Perceive: 'Perceive (Seeing, Hearing, Reading, Recognizing)',
  Think: 'Think (Remembering, Learning, Planning, Deciding, Problem Solving)',
  Communicate: 'Communicate (Speaking, Translating, Negotiating, Teaching, Presenting)',
  Act: 'Act (Assembling, Repairing, Controlling, Operating)',
  Navigate: 'Navigate (Localizing, Wayfinding, Path Planning)',
  Supervise: 'Supervise (Inspecting, Auditing, Quality Assurance, Compliance)',
  Create: 'Create (Writing, Designing, Coding, Generating Images / Video)',
};

export const haiCapabilityLabel = (value: string): string =>
  HUMAN_CAPABILITY_LABELS[value] || value;

export const AI_CAPABILITIES = [
  'Reason', 'Perceive', 'Communicate', 'Plan', 'Automate', 'Embody', 'Spatial', 'Deploy',
];

/** Display labels for AI Capabilities values. */
export const AI_CAPABILITY_LABELS: Record<string, string> = {
  Reason: 'Reason (AI Agents, Knowledge, Reasoning, Decision)',
  Perceive: 'Perceive (Vision, Audio, Speech, Text, Emotions)',
  Communicate: 'Communicate (Conversation, Translation, Collaboration)',
  Plan: 'Plan (Planning, Optimization, Forecasting)',
  Automate: 'Automate (Workflow, Orchestration, Automation)',
  Embody: 'Embody (Robotics, Localization, Autonomous Navigation)',
  Spatial: 'Spatial (Digital Twin, Scene Understanding, SLAM, World Models)',
  Deploy: 'Deploy (Edge AI, Federated Learning, Distributed AI)',
};

export const haiAICapabilityLabel = (value: string): string =>
  AI_CAPABILITY_LABELS[value] || value;

export const HUMAN_INTERFACES = [
  'Conversational', 'Personal Devices', 'Embodied', 'Environment',
];

/** Display labels for Human Interface values. */
export const HUMAN_INTERFACE_LABELS: Record<string, string> = {
  Conversational: 'Conversational (AI Agent, Voice Assistant, Avatar)',
  'Personal Devices': 'Personal Devices (Mobile, Glasses, Hearables, Watch, Ring, Pendant)',
  Embodied: 'Embodied (Humanoid Robot, Industrial Robot, Autonomous Mobile Robot)',
  Environment: 'Environment (Smart Devices, Smart Lights, IoT)',
};

export const haiInterfaceLabel = (value: string): string =>
  HUMAN_INTERFACE_LABELS[value] || value;

export const PHYSICAL_PLATFORMS = [
  'Software', 'Wearable', 'Mobile Device', 'Camera', 'Drone', 'Humanoid Robot',
  'Industrial Robot', 'Mobile Robot (AMR)', 'Autonomous Vehicle',
  'Medical Device', 'Smart Home Device', 'Factory Equipment', 'Sensor Platform',
];

export const INDUSTRY_FOCUS = [
  'Enterprise', 'Consumer', 'Healthcare', 'Manufacturing', 'Construction',
  'Logistics', 'Retail', 'Automotive', 'Agriculture', 'Energy', 'Education',
  'Government', 'Defense', 'Hospitality', 'Sports', 'Media',
];

export const ECOSYSTEM_ROLES = [
  'AI Platform', 'AI Service', 'Device Manufacturer', 'Robot Manufacturer',
  'Enterprise Software', 'Semiconductor', 'Components', 'Sensors',
  'Display Technology', 'Systems Integrator', 'Cloud Platform',
  'Developer Platform', 'Research', 'Venture Capital', 'Distributor',
  'Consultant',
];

export const HAI_DIMENSIONS: HAIDimension[] = [
  {
    key: 'hai_category',
    label: 'Category',
    question: 'What kind of Human-AI offering is this?',
    blurb: 'The top-level shape of the offering.',
    values: HAI_CATEGORY_VALUES,
  },
  {
    key: 'human_activities',
    label: 'Human Activities',
    question: 'What is the human trying to accomplish?',
    blurb: 'The work, task or goal a person is pursuing.',
    values: HUMAN_ACTIVITIES,
  },
  {
    key: 'human_capabilities',
    label: 'Human Capabilities',
    question: 'Which human abilities are augmented?',
    blurb: 'Human abilities — not technologies.',
    values: HUMAN_CAPABILITIES,
  },
  {
    key: 'ai_capabilities',
    label: 'AI Capabilities',
    question: 'What intelligence does the company provide?',
    blurb: 'The intelligence layer behind the augmentation.',
    values: AI_CAPABILITIES,
  },
  {
    key: 'human_interface',
    label: 'Human Interface',
    question: 'How do humans interact with the AI?',
    blurb: 'The surface where people meet intelligence.',
    values: HUMAN_INTERFACES,
  },
  {
    key: 'industry_focus',
    label: 'Industry Focus',
    question: 'Which industries benefit?',
    blurb: 'Where the value lands.',
    values: INDUSTRY_FOCUS,
  },
  {
    key: 'ecosystem_roles',
    label: 'Ecosystem Role',
    question: 'How does this company participate?',
    blurb: 'Position in the Human-AI value chain.',
    values: ECOSYSTEM_ROLES,
  },
];

export const dimensionByKey = (key: HAIDimensionKey): HAIDimension =>
  HAI_DIMENSIONS.find((d) => d.key === key)!;

/** Ordered layers used by the Solution Explorer stack. */
export const SOLUTION_STEPS: HAIDimensionKey[] = [
  'human_activities',
  'human_capabilities',
  'ai_capabilities',
  'human_interface',
  'industry_focus',
];

/** Ecosystem roles grouped into the layers of a deliverable solution stack. */
export const SOLUTION_LAYERS: { label: string; description: string; roles: string[] }[] = [
  {
    label: 'Interface & Devices',
    description: 'What the human wears, holds or works alongside.',
    roles: ['Device Manufacturer', 'Robot Manufacturer'],
  },
  {
    label: 'Intelligence',
    description: 'The models and perception that make it work.',
    roles: ['AI Platform', 'AI Service'],
  },
  {
    label: 'Silicon & Sensing',
    description: 'Compute, optics and sensors underneath.',
    roles: ['Semiconductor', 'Components', 'Sensors', 'Display Technology'],
  },
  {
    label: 'Software & Workflow',
    description: 'Where the output becomes an operational process.',
    roles: ['Enterprise Software', 'Cloud Platform', 'Developer Platform'],
  },
  {
    label: 'Delivery & Capital',
    description: 'Who integrates, distributes and funds it.',
    roles: ['Systems Integrator', 'Consultant', 'Distributor', 'Venture Capital', 'Research'],
  },
];
