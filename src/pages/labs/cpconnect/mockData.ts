import kitchenImg from '@/assets/cpconnect/kitchen-remodel.jpg';
import bathroomImg from '@/assets/cpconnect/bathroom-reno.jpg';
import livingRoomImg from '@/assets/cpconnect/living-room.jpg';

export interface Project {
  id: string;
  name: string;
  address: string;
  status: 'draft' | 'in-progress' | 'pending-approval' | 'completed';
  budget: number;
  tier: 'economy' | 'standard' | 'premium';
  rooms: Room[];
  createdAt: string;
  homeowner?: string;
  proLinkId: string;
  image: string;
}

export interface Room {
  id: string;
  name: string;
  sqft: number;
  materials: Material[];
}

export interface Material {
  id: string;
  name: string;
  category: 'flooring' | 'cabinets' | 'paint' | 'fixtures' | 'countertops' | 'tile';
  unit: string;
  quantity: number;
  prices: { economy: number; standard: number; premium: number };
  specs: string;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Modern Kitchen Remodel',
    address: '1247 Oak Street, Austin, TX',
    status: 'in-progress',
    budget: 42500,
    image: kitchenImg,
    tier: 'standard',
    proLinkId: 'CPL-2026-8A3F',
    homeowner: 'Sarah Mitchell',
    createdAt: '2026-04-10',
    rooms: [
      {
        id: 'r1',
        name: 'Kitchen',
        sqft: 180,
        materials: [
          { id: 'm1', name: 'Engineered Hardwood', category: 'flooring', unit: 'sq ft', quantity: 180, prices: { economy: 4.5, standard: 8.5, premium: 14 }, specs: '5" wide plank, oak finish' },
          { id: 'm2', name: 'Shaker Cabinets', category: 'cabinets', unit: 'linear ft', quantity: 24, prices: { economy: 120, standard: 280, premium: 450 }, specs: 'Soft-close, full overlay' },
          { id: 'm3', name: 'Quartz Countertop', category: 'countertops', unit: 'sq ft', quantity: 45, prices: { economy: 35, standard: 65, premium: 120 }, specs: '3cm thick, polished edge' },
          { id: 'm4', name: 'Subway Tile Backsplash', category: 'tile', unit: 'sq ft', quantity: 30, prices: { economy: 3, standard: 8, premium: 18 }, specs: '3x6, matte finish' },
          { id: 'm5', name: 'Interior Paint', category: 'paint', unit: 'gallon', quantity: 4, prices: { economy: 25, standard: 45, premium: 75 }, specs: 'Eggshell, low VOC' },
          { id: 'm6', name: 'Pendant Lights', category: 'fixtures', unit: 'each', quantity: 3, prices: { economy: 45, standard: 120, premium: 280 }, specs: 'Brushed brass, dimmable' },
        ],
      },
    ],
  },
  {
    id: 'p2',
    name: 'Master Bath Renovation',
    address: '892 Elm Drive, Denver, CO',
    status: 'pending-approval',
    budget: 28000,
    image: bathroomImg,
    tier: 'premium',
    proLinkId: 'CPL-2026-7B2E',
    homeowner: 'James & Linda Park',
    createdAt: '2026-04-08',
    rooms: [
      {
        id: 'r2',
        name: 'Master Bathroom',
        sqft: 120,
        materials: [
          { id: 'm7', name: 'Porcelain Floor Tile', category: 'flooring', unit: 'sq ft', quantity: 120, prices: { economy: 5, standard: 12, premium: 22 }, specs: '24x24, marble look' },
          { id: 'm8', name: 'Vanity Cabinet', category: 'cabinets', unit: 'each', quantity: 1, prices: { economy: 400, standard: 900, premium: 1800 }, specs: '60" double sink, floating' },
          { id: 'm9', name: 'Shower Tile', category: 'tile', unit: 'sq ft', quantity: 80, prices: { economy: 6, standard: 15, premium: 30 }, specs: 'Large format, textured' },
          { id: 'm10', name: 'Bathroom Fixtures', category: 'fixtures', unit: 'set', quantity: 1, prices: { economy: 200, standard: 600, premium: 1400 }, specs: 'Faucet, showerhead, accessories' },
        ],
      },
    ],
  },
  {
    id: 'p3',
    name: 'Open Concept Living Room',
    address: '3401 Pine Ave, Portland, OR',
    status: 'draft',
    budget: 18000,
    image: livingRoomImg,
    tier: 'economy',
    proLinkId: 'CPL-2026-9C1D',
    createdAt: '2026-04-14',
    rooms: [
      {
        id: 'r3',
        name: 'Living Room',
        sqft: 320,
        materials: [
          { id: 'm11', name: 'Luxury Vinyl Plank', category: 'flooring', unit: 'sq ft', quantity: 320, prices: { economy: 3, standard: 6, premium: 10 }, specs: '7" wide, waterproof' },
          { id: 'm12', name: 'Built-in Shelving', category: 'cabinets', unit: 'linear ft', quantity: 12, prices: { economy: 80, standard: 180, premium: 320 }, specs: 'Floor-to-ceiling, adjustable' },
          { id: 'm13', name: 'Accent Wall Paint', category: 'paint', unit: 'gallon', quantity: 6, prices: { economy: 25, standard: 45, premium: 75 }, specs: 'Matte, designer colors' },
          { id: 'm14', name: 'Recessed Lighting', category: 'fixtures', unit: 'each', quantity: 8, prices: { economy: 25, standard: 55, premium: 95 }, specs: '6" LED, adjustable temp' },
        ],
      },
    ],
  },
];

export const LABOR_RATE_PER_SQFT: Record<string, number> = {
  economy: 12,
  standard: 22,
  premium: 38,
};

export const calcProjectCost = (project: Project, tier: 'economy' | 'standard' | 'premium') => {
  let materialsCost = 0;
  let totalSqft = 0;
  project.rooms.forEach((room) => {
    totalSqft += room.sqft;
    room.materials.forEach((mat) => {
      materialsCost += mat.quantity * mat.prices[tier];
    });
  });
  const laborCost = totalSqft * LABOR_RATE_PER_SQFT[tier];
  return { materialsCost, laborCost, total: materialsCost + laborCost, totalSqft };
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
  'pending-approval': { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700' },
};
