// Asentio Human-AI Framework
// The directory is organized around how companies augment human capability
// through AI — not around a technology category. Everything begins with the human.

export type HAIDimensionKey =
  | 'human_activities'
  | 'human_capabilities'
  | 'ai_capabilities'
  | 'human_interface'
  | 'physical_platforms'
  | 'industry_focus'
  | 'ecosystem_roles';

export interface HAIDimension {
  key: HAIDimensionKey;
  label: string;
  question: string;
  blurb: string;
  values: string[];
}

export const HUMAN_ACTIVITIES = [
  'Inspection', 'Maintenance', 'Repair', 'Assembly', 'Picking', 'Inventory',
  'Monitoring', 'Decision Support', 'Knowledge Retrieval', 'Training',
  'Collaboration', 'Communication', 'Navigation', 'Translation',
  'Customer Service', 'Shopping', 'Healthcare', 'Content Creation',
  'Safety', 'Security',
];

export const HUMAN_CAPABILITIES = [
  'Seeing', 'Hearing', 'Speaking', 'Remembering', 'Learning', 'Thinking',
  'Deciding', 'Navigating', 'Moving', 'Manipulating', 'Collaborating',
  'Monitoring', 'Creating',
];

export const AI_CAPABILITIES = [
  'AI Agents', 'Large Language Models', 'Computer Vision', 'Voice AI',
  'Speech Recognition', 'Multimodal AI', 'Spatial AI', 'Robotics AI',
  'Knowledge AI (RAG)', 'Translation AI', 'Workflow Automation',
  'Predictive AI', 'Edge AI', 'Digital Twin', 'Reinforcement Learning',
  'Planning', 'Localization', 'Manipulation',
];

export const HUMAN_INTERFACES = [
  'AI Agent', 'Smart Glasses', 'Hearables', 'Mobile', 'Desktop', 'Smart Watch',
  'Smart Ring', 'Spatial Computing', 'Robotics', 'Humanoid Robot',
  'Industrial Robot', 'Autonomous Vehicle', 'Smart Home', 'Ambient Computing',
  'Brain Computer Interface',
];

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
    key: 'physical_platforms',
    label: 'Physical Platform',
    question: 'Where does the AI physically exist?',
    blurb: 'The body the intelligence lives in.',
    values: PHYSICAL_PLATFORMS,
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
