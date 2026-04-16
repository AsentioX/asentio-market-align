import hero from '@/assets/tastudio/hero.jpg';
import model911 from '@/assets/tastudio/model-911.jpg';
import modelCayenne from '@/assets/tastudio/model-cayenne.jpg';
import modelMacan from '@/assets/tastudio/model-macan.jpg';
import modelTaycan from '@/assets/tastudio/model-taycan.jpg';
import modelPanamera from '@/assets/tastudio/model-panamera.jpg';
import buildAggressive from '@/assets/tastudio/build-aggressive.jpg';
import buildRefined from '@/assets/tastudio/build-refined.jpg';
import buildTechnical from '@/assets/tastudio/build-technical.jpg';

export { hero, buildAggressive, buildRefined, buildTechnical };

export type DrivingStyle = 'daily' | 'performance' | 'track' | 'executive';
export type Personality = 'subtle' | 'bold' | 'technical';
export type Usage = 'city' | 'canyon' | 'social' | 'collection';
export type BuildTemplate = 'refined' | 'aggressive' | 'technical';

export interface DriverProfile {
  drivingStyle: DrivingStyle;
  personality: Personality;
  usage: Usage;
}

export interface VehicleModel {
  id: string;
  name: string;
  series: string;
  image: string;
  basePrice: number;
}

export const VEHICLE_MODELS: VehicleModel[] = [
  { id: '911', name: '911', series: 'Type 992', image: model911, basePrice: 120000 },
  { id: 'cayenne', name: 'Cayenne', series: 'Performance SUV', image: modelCayenne, basePrice: 95000 },
  { id: 'macan', name: 'Macan', series: 'Compact SUV', image: modelMacan, basePrice: 75000 },
  { id: 'taycan', name: 'Taycan', series: 'Electric GT', image: modelTaycan, basePrice: 110000 },
  { id: 'panamera', name: 'Panamera', series: 'Executive Sport', image: modelPanamera, basePrice: 105000 },
];

export interface BuildPart {
  category: 'Aero' | 'Wheels' | 'Interior' | 'Performance';
  item: string;
  price: number;
}

export interface Build {
  id: string;
  name: string;
  template: BuildTemplate;
  modelId: string;
  image: string;
  tagline: string;
  parts: BuildPart[];
  createdAt: string;
}

const TEMPLATES: Record<BuildTemplate, { image: string; tagline: string; parts: BuildPart[] }> = {
  refined: {
    image: buildRefined,
    tagline: 'Subtle presence. Uncompromising craft.',
    parts: [
      { category: 'Aero', item: 'Carbon Front Lip — Discreet', price: 6800 },
      { category: 'Wheels', item: 'Formula IV Forged 21"', price: 8400 },
      { category: 'Interior', item: 'Nappa Leather Package', price: 12500 },
      { category: 'Performance', item: 'Sport Suspension Lowering', price: 4200 },
    ],
  },
  aggressive: {
    image: buildAggressive,
    tagline: 'Maximum stance. Visceral character.',
    parts: [
      { category: 'Aero', item: 'GT Wide-Body Kit + Rear Wing', price: 18500 },
      { category: 'Wheels', item: 'Forged Bronze 21" Center-Lock', price: 11200 },
      { category: 'Interior', item: 'Alcantara + Carbon Trim', price: 14800 },
      { category: 'Performance', item: 'Titanium Sport Exhaust', price: 12000 },
    ],
  },
  technical: {
    image: buildTechnical,
    tagline: 'Engineered for the apex.',
    parts: [
      { category: 'Aero', item: 'Carbon Aero Package — Functional', price: 14200 },
      { category: 'Wheels', item: 'Magnesium Track Wheels 20"', price: 13500 },
      { category: 'Interior', item: 'Race-Spec Carbon Buckets', price: 16500 },
      { category: 'Performance', item: 'PASM+ & Brake Upgrade', price: 18800 },
    ],
  },
};

export function selectTemplate(profile: DriverProfile): BuildTemplate {
  if (profile.personality === 'bold' || profile.drivingStyle === 'performance') return 'aggressive';
  if (profile.personality === 'technical' || profile.drivingStyle === 'track') return 'technical';
  return 'refined';
}

export function generateBuild(modelId: string, template: BuildTemplate, name?: string): Build {
  const t = TEMPLATES[template];
  const model = VEHICLE_MODELS.find((m) => m.id === modelId)!;
  const labels: Record<BuildTemplate, string> = {
    refined: 'Stealth',
    aggressive: 'Apex',
    technical: 'Precision',
  };
  return {
    id: `${Date.now()}`,
    name: name ?? `${labels[template]} ${model.name}`,
    template,
    modelId,
    image: t.image,
    tagline: t.tagline,
    parts: t.parts,
    createdAt: new Date().toISOString(),
  };
}

export function buildTotal(build: Build): number {
  return build.parts.reduce((sum, p) => sum + p.price, 0);
}

export const STYLE_OPTIONS: { value: DrivingStyle; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily Luxury', desc: 'Comfort and presence, every day.' },
  { value: 'performance', label: 'Performance Focused', desc: 'Sharper, faster, louder.' },
  { value: 'track', label: 'Track Ready', desc: 'Engineered for circuit days.' },
  { value: 'executive', label: 'Executive Presence', desc: 'Refined power for business.' },
];

export const PERSONALITY_OPTIONS: { value: Personality; label: string; desc: string }[] = [
  { value: 'subtle', label: 'Subtle & Refined', desc: 'Understated. For those who know.' },
  { value: 'bold', label: 'Bold & Aggressive', desc: 'Make a statement on arrival.' },
  { value: 'technical', label: 'Technical & Precise', desc: 'Function-driven aesthetics.' },
];

export const USAGE_OPTIONS: { value: Usage; label: string; desc: string }[] = [
  { value: 'city', label: 'City Driving', desc: 'Daily commute, urban edge.' },
  { value: 'canyon', label: 'Weekend / Canyon', desc: 'Backroads and mountain passes.' },
  { value: 'social', label: 'Social / Events', desc: 'Pulling up matters.' },
  { value: 'collection', label: 'Collection', desc: 'A statement piece.' },
];

export const TEMPLATE_PROMPTS: Record<BuildTemplate, string> = {
  refined: 'Apply a refined TECHART-style customization to this Porsche: subtle carbon front lip, polished silver forged wheels, lowered stance, elegant editorial lighting. Keep proportions and angle identical.',
  aggressive: 'Apply an aggressive TECHART-style wide-body customization to this Porsche: GT wide fenders, large rear wing, forged bronze wheels, dramatic stance, moody industrial lighting. Keep proportions and angle identical.',
  technical: 'Apply a technical motorsport TECHART-style customization to this Porsche: functional carbon aero, magnesium track wheels, cool blue lighting on a race track. Keep proportions and angle identical.',
};
