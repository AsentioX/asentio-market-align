export interface Sponsor {
  id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  headquarters: string | null;
  logo_url: string | null;
  stage: string;
  priority: string;
  tier_target: string | null;
  relationship_strength: number | null;
  probability: number | null;
  estimated_value: number | null;
  motivations: Record<string, number>;
  owner_id: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string; sponsor_id: string; name: string; role: string | null;
  email: string | null; linkedin: string | null; influence: string;
  is_decision_maker: boolean; notes: string | null; created_at: string;
}

export interface Action {
  id: string; sponsor_id: string; title: string; template_key: string | null;
  category: string | null; owner_id: string | null; owner_name: string | null;
  due_date: string | null; status: string; priority: string;
  waiting_on: string; notes: string | null;
  completed_at: string | null; created_at: string; updated_at: string;
}

export interface Meeting {
  id: string; sponsor_id: string; title: string; meeting_date: string | null;
  attendees: string | null; transcript: string | null;
  summary: MeetingSummary | null; minutes: string | null;
  extracted_actions: ExtractedAction[] | null; source: string | null;
  created_at: string;
}

export interface MeetingSummary {
  objectives?: string[]; topics?: string[]; decisions?: string[];
  risks?: string[]; questions?: string[];
}

export interface ExtractedAction {
  title: string; category: string; waiting_on: 'mit'|'sponsor';
  due_in_days: number; priority: 'low'|'medium'|'high';
}

export interface Deliverable {
  id: string; sponsor_id: string; category: string; title: string;
  status: string; owner_id: string | null; due_date: string | null;
  notes: string | null; created_at: string; updated_at: string;
}
