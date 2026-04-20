export type ContractorType =
  | 'General Contractor'
  | 'Flooring Installer'
  | 'Painter'
  | 'Electrician'
  | 'Plumber'
  | 'Roofer'
  | 'Kitchen / Bath Remodeler'
  | 'HVAC'
  | 'Cabinet Installer'
  | 'Tile Installer'
  | 'Landscaping'
  | 'Handyman';

export type LicenseStatus = 'Active' | 'Inactive' | 'Expired' | 'Suspended';

export type CompanySize =
  | 'Solo Operator'
  | 'Small Crew'
  | 'Growing Local'
  | 'Mid-Sized'
  | 'Multi-Location';

export type BusinessMaturity =
  | 'Premium / Design-Forward'
  | 'Established'
  | 'Value / Budget'
  | 'Low-Tech';

export type SourceBadge =
  | 'Official License Source'
  | 'Google Business'
  | 'Yelp'
  | 'Houzz'
  | 'BBB'
  | 'Company Website'
  | 'Verified Email';

export interface Contractor {
  contractor_id: string;
  company_name: string;
  dba_name?: string;
  contractor_type: ContractorType;
  specialties: string[];
  license_number: string;
  license_classification: string;
  license_status: LicenseStatus;
  license_issue_date: string;
  license_expiration_date: string;
  bond_status: 'Active' | 'Expired' | 'None';
  insurance_status: 'Active' | 'Expired' | 'None';
  address: string;
  city: string;
  county: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  contact_form_url?: string;
  review_rating?: number;
  review_count?: number;
  source_count: number;
  source_urls: SourceBadge[];
  years_in_business: number;
  estimated_company_size: CompanySize;
  estimated_business_maturity: BusinessMaturity;
  service_area: string[];
  tags: string[];
  confidence_score: number; // 0-100
  last_verified_date: string;
  commercial_residential: 'Commercial' | 'Residential' | 'Both';
}

export interface SavedSegment {
  id: string;
  name: string;
  notes?: string;
  filters: SegmentFilters;
  contractor_ids: string[];
  created_at: string;
}

export interface SegmentFilters {
  query?: string;
  states?: string[];
  cities?: string[];
  counties?: string[];
  zip?: string;
  radiusMiles?: number;
  contractorTypes?: ContractorType[];
  licenseStatus?: LicenseStatus[];
  hasWebsite?: boolean;
  hasEmail?: boolean;
  hasVerifiedEmail?: boolean;
  hasPhone?: boolean;
  companySizes?: CompanySize[];
  maturity?: BusinessMaturity[];
  minReviews?: number;
  maxReviews?: number;
  minConfidence?: number;
  commercialResidential?: 'Commercial' | 'Residential' | 'Both';
}
