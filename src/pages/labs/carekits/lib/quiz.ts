// Assessment quiz: questions, scoring, recommendation logic

export type QuizKey =
  | 'livesAlone' | 'stairs' | 'wifi' | 'fellPast12' | 'mobilityAid' | 'dailyMeds' | 'forgetsMeds'
  | 'memoryWandering' | 'cooksAlone' | 'wearable' | 'cameras' | 'voiceAssistant' | 'overnight'
  | 'privacy' | 'budget' | 'monthlyFee' | 'setup';

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestion {
  key: QuizKey;
  q: string;
  helper?: string;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  { key: 'livesAlone', q: 'Does your parent live alone?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'stairs', q: 'Does their home have stairs they use daily?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'wifi', q: 'Does their home have reliable Wi-Fi?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'Sometimes spotty', value: 'spotty' }, { label: 'No', value: 'no' }] },
  { key: 'fellPast12', q: 'Have they fallen in the past 12 months?',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Once', value: 'once' },
      { label: 'More than once', value: 'multi' },
    ]
  },
  { key: 'mobilityAid', q: 'Do they use a cane, walker, or other mobility aid?',
    options: [
      { label: 'No aid', value: 'none' },
      { label: 'Cane', value: 'cane' },
      { label: 'Walker', value: 'walker' },
      { label: 'Wheelchair', value: 'chair' },
    ]
  },
  { key: 'dailyMeds', q: 'Do they take daily medication?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
  { key: 'forgetsMeds', q: 'Do they sometimes forget to take medication?',
    options: [
      { label: 'Never', value: 'never' },
      { label: 'Occasionally', value: 'sometimes' },
      { label: 'Often', value: 'often' },
    ]
  },
  { key: 'memoryWandering', q: 'Are there memory or wandering concerns?',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Mild forgetfulness', value: 'mild' },
      { label: 'Diagnosed cognitive decline', value: 'diagnosed' },
    ]
  },
  { key: 'cooksAlone', q: 'Do they cook independently?',
    options: [{ label: 'Yes, often', value: 'often' }, { label: 'Occasionally', value: 'some' }, { label: 'Rarely', value: 'rare' }] },
  { key: 'wearable', q: 'Would they be comfortable wearing a device (watch or pendant)?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'Maybe', value: 'maybe' }, { label: 'No', value: 'no' }] },
  { key: 'cameras', q: 'Would they be comfortable with cameras in the home?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'Only outside', value: 'outside' }, { label: 'No', value: 'no' }] },
  { key: 'voiceAssistant', q: 'Do they already use Alexa, Google Home, or Siri?',
    options: [{ label: 'Yes, comfortable', value: 'yes' }, { label: 'Tried it', value: 'some' }, { label: 'No', value: 'no' }] },
  { key: 'overnight', q: 'Would overnight monitoring give you peace of mind?',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'Only if unobtrusive', value: 'passive' }, { label: 'No', value: 'no' }] },
  { key: 'privacy', q: 'How important is privacy to your parent?',
    options: [
      { label: 'Very important', value: 'high' },
      { label: 'Somewhat important', value: 'med' },
      { label: 'Not a concern', value: 'low' },
    ]
  },
  { key: 'budget', q: 'What is your approximate upfront budget?',
    options: [
      { label: 'Under $200', value: 'xs' },
      { label: '$200 – $500', value: 'low' },
      { label: '$500 – $1,000', value: 'mid' },
      { label: '$1,000+', value: 'high' },
    ]
  },
  { key: 'monthlyFee', q: 'Monthly subscription preference?',
    options: [
      { label: 'No monthly fees', value: 'none' },
      { label: 'Under $10/month', value: 'low' },
      { label: 'Under $25/month', value: 'mid' },
      { label: 'No preference', value: 'any' },
    ]
  },
    options: [
      { label: 'Under $300', value: 'low' },
      { label: '$300 – $800', value: 'mid' },
      { label: '$800+', value: 'high' },
    ]
  },
  { key: 'setup', q: 'Who will set up the products?',
    options: [
      { label: 'My parent', value: 'parent' },
      { label: 'I (the caregiver) will', value: 'caregiver' },
      { label: 'We need professional setup', value: 'pro' },
    ]
  },
];

export type Answers = Partial<Record<QuizKey, string>>;

export interface RiskProfile {
  fall_risk_score: number;        // 0-5
  medication_risk_score: number;  // 0-5
  cognitive_risk_score: number;   // 0-5
  home_safety_risk_score: number; // 0-5
  routine_visibility_score: number;
  social_isolation_score: number;
  privacy_preference_score: number; // 0-5 higher = more privacy-first
  tech_comfort_score: number;       // 0-5 higher = more comfort
  risk_tags: string[];
  recommended_categories: string[]; // slugs
  kit_name: string;
  budget_range: string;
}

const cat = (slug: string) => slug; // helper alias

export function scoreAnswers(a: Answers): RiskProfile {
  let fall = 0, med = 0, cog = 0, home = 0, routine = 0, isol = 0, priv = 0, tech = 3;
  const tags = new Set<string>();
  const cats = new Set<string>();

  // Lives alone
  if (a.livesAlone === 'yes') {
    tags.add('Lives alone');
    routine += 2; isol += 2;
  }

  // Falls
  if (a.fellPast12 === 'once') { fall += 3; tags.add('Moderate fall risk'); }
  if (a.fellPast12 === 'multi') { fall += 5; tags.add('High fall risk'); }

  // Mobility aids
  if (a.mobilityAid && a.mobilityAid !== 'none') {
    fall += 2;
    if (a.mobilityAid === 'walker' || a.mobilityAid === 'chair') fall += 1;
  }

  // Medication
  if (a.dailyMeds === 'yes') {
    med += 2;
    if (a.forgetsMeds === 'sometimes') { med += 2; tags.add('Medication support needed'); }
    if (a.forgetsMeds === 'often') { med += 4; tags.add('Medication support needed'); }
  }

  // Cognitive / wandering
  if (a.memoryWandering === 'mild') { cog += 3; tags.add('Cognitive support needed'); }
  if (a.memoryWandering === 'diagnosed') { cog += 5; tags.add('Cognitive support needed'); tags.add('Wandering risk'); }

  // Home safety from cooking + falls
  if (a.cooksAlone === 'often') home += 2;
  if (a.cooksAlone === 'some') home += 1;
  if (cog >= 3 && (a.cooksAlone === 'often' || a.cooksAlone === 'some')) {
    home += 2; tags.add('Home safety risk');
  }
  if (fall >= 3) tags.add('Home safety risk');

  // Wearable comfort
  const wearableOk = a.wearable === 'yes';
  const wearableMaybe = a.wearable === 'maybe';
  if (a.wearable === 'no') tags.add('Wearable not preferred');

  // Cameras / privacy
  const cameraOk = a.cameras === 'yes';
  if (a.privacy === 'high') { priv = 5; tags.add('Privacy-first required'); }
  else if (a.privacy === 'med') priv = 3;
  else priv = 1;
  if (a.cameras === 'no') priv = Math.max(priv, 4);

  // Tech comfort & setup
  if (a.setup === 'parent') tech = 4;
  if (a.setup === 'caregiver') tech = 3;
  if (a.setup === 'pro') { tech = 1; tags.add('Low tech comfort'); tags.add('Caregiver setup needed'); }

  // Budget
  const budget = a.budget ?? 'mid';

  // ----- Recommendation logic -----
  const privacyFirst = priv >= 4;

  // Fall risk -> passive + emergency
  if (fall >= 3) {
    cats.add(cat('medical-alert'));
    if (wearableOk || wearableMaybe) cats.add(cat('fall-wearable'));
    cats.add(cat('radar-fall'));
    cats.add(cat('wifi-presence'));
  } else if (fall >= 1) {
    cats.add(cat('medical-alert'));
    if (wearableOk) cats.add(cat('fall-wearable'));
  }

  // Lives alone -> presence visibility
  if (a.livesAlone === 'yes') {
    cats.add(cat('wifi-presence'));
    cats.add(cat('voice-display'));
  }

  // Medication
  if (med >= 4) cats.add(cat('pill-dispenser'));
  else if (med >= 2) cats.add(cat('med-reminder'));

  // Cognitive / wandering
  if (cog >= 3) {
    cats.add(cat('gps-tracker'));
    cats.add(cat('door-sensor'));
  }

  // Home safety
  if (home >= 2) {
    cats.add(cat('stove-shutoff'));
    cats.add(cat('leak-sensor'));
  }

  // Cameras only if user is comfortable AND privacy not high
  if (cameraOk && !privacyFirst) {
    cats.add(cat('camera'));
  }

  // Privacy-first: remove camera, prefer non-wearable
  if (privacyFirst) {
    cats.delete(cat('camera'));
  }
  if (a.wearable === 'no') {
    cats.delete(cat('fall-wearable'));
    cats.delete(cat('smartwatch'));
  }

  // Low tech comfort -> simple devices only
  if (tech <= 2) {
    cats.delete(cat('smartwatch'));
    cats.delete(cat('senior-tablet'));
  }

  // Budget shaping
  if (budget === 'high') {
    cats.add(cat('voice-display'));
    cats.add(cat('senior-tablet'));
    if (!privacyFirst) cats.add(cat('smart-lock'));
  }

  // Always provide at least a baseline
  if (cats.size === 0) {
    cats.add(cat('medical-alert'));
    cats.add(cat('voice-display'));
  }

  // Kit name selection
  let kit = 'Starter Safety Kit';
  if (fall >= 3 && privacyFirst) kit = 'Privacy-First Fall Protection Kit';
  else if (fall >= 3) kit = 'Fall Protection Kit';
  else if (cog >= 3) kit = 'Cognitive Safety Kit';
  else if (med >= 4) kit = 'Medication Support Kit';
  else if (privacyFirst) kit = 'Privacy-First Monitoring Kit';
  else if (budget === 'high') kit = 'Full Peace of Mind Kit';

  return {
    fall_risk_score: Math.min(5, fall),
    medication_risk_score: Math.min(5, med),
    cognitive_risk_score: Math.min(5, cog),
    home_safety_risk_score: Math.min(5, home),
    routine_visibility_score: Math.min(5, routine),
    social_isolation_score: Math.min(5, isol),
    privacy_preference_score: priv,
    tech_comfort_score: tech,
    risk_tags: Array.from(tags),
    recommended_categories: Array.from(cats),
    kit_name: kit,
    budget_range: budget,
  };
}
