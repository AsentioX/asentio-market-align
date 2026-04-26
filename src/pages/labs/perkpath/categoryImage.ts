// Category-based fallback images so each perk card shows a relevant photo
// when the scraped/seeded perk doesn't include its own image_url.
import type { PerkCategory } from '@/hooks/usePerkPath';

const CATEGORY_IMAGES: Record<PerkCategory, string[]> = {
  auto: [
    'https://images.unsplash.com/photo-1449965408869-ebd3fee7e6c3?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&h=375&fit=crop',
  ],
  dining: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=375&fit=crop',
  ],
  travel: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1540339832862-474599807836?w=600&h=375&fit=crop',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=375&fit=crop',
  ],
  health: [
    'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=375&fit=crop',
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=600&h=375&fit=crop',
  ],
  services: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=375&fit=crop',
  ],
  other: [
    'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=375&fit=crop',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=375&fit=crop',
  ],
};

export function categoryImage(category: string, ...seedParts: (string | null | undefined)[]): string {
  const cat = (CATEGORY_IMAGES as Record<string, string[]>)[category] ? (category as PerkCategory) : 'other';
  const pool = CATEGORY_IMAGES[cat];
  const seed = seedParts.filter(Boolean).join('|') || cat;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}
