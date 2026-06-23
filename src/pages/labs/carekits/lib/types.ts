export type SetupDifficulty = 'easy' | 'moderate' | 'professional';
export type PrivacyLevel = 'high' | 'medium' | 'low';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category_id: string | null;
  short_description: string | null;
  long_description: string | null;
  image_url: string | null;
  price: number | null;
  price_max: number | null;
  monthly_cost: number | null;
  affiliate_url: string | null;
  partner_name: string | null;
  setup_difficulty: SetupDifficulty | null;
  privacy_level: PrivacyLevel | null;
  requires_wearable: boolean;
  uses_camera: boolean;
  requires_subscription: boolean;
  best_for_tags: string[];
  risk_tags: string[];
  pros: string[];
  cons: string[];
  senior_comfort_score: number | null;
  caregiver_peace_of_mind_score: number | null;
  overall_score: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResult {
  id: string;
  email: string | null;
  parent_name: string | null;
  answers: Record<string, string>;
  fall_risk_score: number;
  medication_risk_score: number;
  cognitive_risk_score: number;
  home_safety_risk_score: number;
  routine_visibility_score: number;
  social_isolation_score: number;
  privacy_preference_score: number;
  tech_comfort_score: number;
  budget_range: string | null;
  risk_tags: string[];
  recommended_categories: string[];
  recommended_product_ids: string[];
  kit_name: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  cover_image_url: string | null;
  related_categories: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
