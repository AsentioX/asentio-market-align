// Care Kits + Problem categories — rules-based content for the MVP.
// Kits are defined in code (no DB yet); each maps to product category slugs.

export interface KitDef {
  slug: string;
  title: string;
  short: string;
  who: string;
  problems: string[];       // problem slugs solved
  categories: string[];     // ck_categories.slug driving product pull
  estInitial: number;       // typical starter cost estimate
  estMonthly: number;
  installMinutes: number;
  installDifficulty: 'easy' | 'moderate' | 'professional';
  featured?: boolean;
}

export const KITS: KitDef[] = [
  {
    slug: 'starter',
    title: 'Starter Care Kit',
    short: 'The essentials every aging-in-place home should have.',
    who: 'A parent living independently who has no major concerns yet.',
    problems: ['living-alone', 'emergency-response'],
    categories: ['medical-alert', 'voice-display', 'leak-sensor'],
    estInitial: 220, estMonthly: 20, installMinutes: 25, installDifficulty: 'easy',
    featured: true,
  },
  {
    slug: 'living-alone',
    title: 'Living Alone Kit',
    short: 'Gentle daily visibility for a parent who lives on their own.',
    who: 'A parent who lives alone and wants to stay independent.',
    problems: ['living-alone', 'daily-wellness', 'caregiver-peace-of-mind'],
    categories: ['wifi-presence', 'voice-display', 'medical-alert', 'med-reminder'],
    estInitial: 285, estMonthly: 20, installMinutes: 20, installDifficulty: 'easy',
    featured: true,
  },
  {
    slug: 'memory-support',
    title: 'Memory Support Kit',
    short: 'For families navigating early cognitive changes.',
    who: 'A parent with mild forgetfulness or a dementia diagnosis.',
    problems: ['memory-support', 'medication-management', 'home-security'],
    categories: ['gps-tracker', 'door-sensor', 'pill-dispenser', 'voice-display'],
    estInitial: 495, estMonthly: 35, installMinutes: 45, installDifficulty: 'moderate',
    featured: true,
  },
  {
    slug: 'fall-prevention',
    title: 'Fall Prevention Kit',
    short: 'Passive and wearable protection for higher fall risk.',
    who: 'A parent who has fallen recently or uses a mobility aid.',
    problems: ['fall-prevention', 'emergency-response'],
    categories: ['medical-alert', 'fall-wearable', 'radar-fall'],
    estInitial: 420, estMonthly: 45, installMinutes: 30, installDifficulty: 'easy',
    featured: true,
  },
  {
    slug: 'recovery-after-surgery',
    title: 'Recovery After Surgery Kit',
    short: 'Temporary support after a hospital stay or procedure.',
    who: 'A parent recovering at home for 6–12 weeks.',
    problems: ['medication-management', 'daily-wellness', 'emergency-response'],
    categories: ['medical-alert', 'med-reminder', 'voice-display', 'wifi-presence'],
    estInitial: 260, estMonthly: 25, installMinutes: 25, installDifficulty: 'easy',
  },
  {
    slug: 'budget-friendly',
    title: 'Budget Friendly Kit',
    short: 'Meaningful protection for under $200 upfront.',
    who: 'Families getting started on a tight budget.',
    problems: ['medication-management', 'emergency-response'],
    categories: ['med-reminder', 'medical-alert'],
    estInitial: 165, estMonthly: 15, installMinutes: 15, installDifficulty: 'easy',
  },
  {
    slug: 'premium-smart-home',
    title: 'Premium Smart Home Kit',
    short: 'A fully connected home for maximum peace of mind.',
    who: 'Families who want comprehensive coverage and are comfortable with tech.',
    problems: ['caregiver-peace-of-mind', 'home-security', 'daily-wellness', 'fall-prevention'],
    categories: ['smartwatch', 'senior-tablet', 'smart-lock', 'voice-display', 'radar-fall', 'pill-dispenser'],
    estInitial: 1250, estMonthly: 55, installMinutes: 120, installDifficulty: 'professional',
    featured: true,
  },
];

export const getKit = (slug: string) => KITS.find(k => k.slug === slug);

export interface ProblemDef {
  slug: string;
  title: string;
  short: string;
  long: string;
  categories: string[]; // ck_categories.slug
  relatedKits: string[]; // kit slugs
  icon: string; // lucide icon name
}

export const PROBLEMS: ProblemDef[] = [
  {
    slug: 'fall-prevention',
    title: 'Fall Prevention',
    short: 'Reduce the risk — and the fear — of a serious fall at home.',
    long: 'Falls are the #1 cause of injury for adults over 65. The right mix of wearable alerts, passive radar detection, and better lighting can dramatically lower the risk without making your parent feel monitored.',
    categories: ['medical-alert', 'fall-wearable', 'radar-fall'],
    relatedKits: ['fall-prevention', 'starter'],
    icon: 'Shield',
  },
  {
    slug: 'medication-management',
    title: 'Medication Management',
    short: 'Make sure the right pills are taken at the right time.',
    long: 'Missed or doubled medication doses send thousands of seniors to the hospital each year. Automatic dispensers and gentle reminders help your parent stay independent and on-schedule.',
    categories: ['pill-dispenser', 'med-reminder'],
    relatedKits: ['memory-support', 'budget-friendly', 'recovery-after-surgery'],
    icon: 'Pill',
  },
  {
    slug: 'memory-support',
    title: 'Memory Support',
    short: 'Gentle help for early forgetfulness and cognitive change.',
    long: 'From voice-based reminders to door sensors that alert you if someone leaves at night, memory-support devices can extend independence for months or years.',
    categories: ['voice-display', 'door-sensor', 'gps-tracker'],
    relatedKits: ['memory-support'],
    icon: 'Brain',
  },
  {
    slug: 'home-security',
    title: 'Home Security',
    short: 'Keep the front door — and the whole house — safer.',
    long: 'Smart locks, doorbell cameras, and simple sensors give your parent (and you) confidence that the home is secure day and night.',
    categories: ['smart-lock', 'camera', 'door-sensor'],
    relatedKits: ['premium-smart-home', 'memory-support'],
    icon: 'Lock',
  },
  {
    slug: 'living-alone',
    title: 'Living Alone',
    short: 'Quiet visibility for a parent who prefers their own home.',
    long: 'WiFi presence sensors and voice assistants keep the household feeling normal while quietly letting you know things are okay.',
    categories: ['wifi-presence', 'voice-display', 'medical-alert'],
    relatedKits: ['living-alone', 'starter'],
    icon: 'Home',
  },
  {
    slug: 'emergency-response',
    title: 'Emergency Response',
    short: 'One-tap help when something actually goes wrong.',
    long: 'Medical alert pendants, fall-detecting watches, and monitored response services turn a scary moment into a fast one.',
    categories: ['medical-alert', 'fall-wearable'],
    relatedKits: ['fall-prevention', 'starter'],
    icon: 'BellRing',
  },
  {
    slug: 'daily-wellness',
    title: 'Daily Wellness',
    short: 'Support healthy routines — steps, sleep, hydration, mood.',
    long: 'Smartwatches and senior tablets make it easier to keep small daily habits and stay socially connected.',
    categories: ['smartwatch', 'senior-tablet', 'voice-display'],
    relatedKits: ['premium-smart-home', 'living-alone'],
    icon: 'HeartPulse',
  },
  {
    slug: 'caregiver-peace-of-mind',
    title: 'Caregiver Peace of Mind',
    short: 'Sleep better knowing you\'ll be alerted when it matters.',
    long: 'Passive sensors and family-friendly dashboards mean fewer 3 a.m. worry calls — and more confidence between visits.',
    categories: ['wifi-presence', 'radar-fall', 'gps-tracker'],
    relatedKits: ['premium-smart-home', 'living-alone'],
    icon: 'HeartHandshake',
  },
];

export const getProblem = (slug: string) => PROBLEMS.find(p => p.slug === slug);
