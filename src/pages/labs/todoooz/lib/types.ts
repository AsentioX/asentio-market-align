export type TdzMode = 'work' | 'personal';
export type TdzViewMode = TdzMode | 'unified';
export type TdzBucket = 'today' | 'this_week' | 'this_month' | 'backlog';
export type TdzPriority = 'critical' | 'high' | 'core' | 'low';
export type TdzEnvironment = 'ar' | 'slate' | 'studio';
export type TdzGrouping = 'project' | 'client' | 'topic';
export type TdzAccountSlot = 'work' | 'personal';

export interface TdzCard {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  mode: TdzMode;
  context_label: string | null;
  grouping_key: string | null;
  time_bucket: TdzBucket;
  priority: TdzPriority;
  color_theme: string | null;
  status: string;
  progress: number;
  due_date: string | null;
  sort_order: number;
  collapsed: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface TdzTask {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  notes: string | null;
  done: boolean;
  due_date: string | null;
  rank: number;
  account_slot: string | null;
  google_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TdzActivity {
  id: string;
  project_id: string;
  source: string;
  summary: string;
  detail: string | null;
  occurred_at: string;
}

export interface TdzStakeholder {
  id: string;
  project_id: string;
  name: string;
  role: string | null;
  email: string | null;
  avatar_url: string | null;
  notes: string | null;
  contact_id: string | null;
}

export interface TdzDocument {
  id: string;
  project_id: string;
  task_id: string | null;
  url: string;
  title: string;
  doc_type: string;
  added_at: string;
}

export interface TdzEvent {
  id: string;
  project_id: string | null;
  account_slot: string;
  title: string;
  location: string | null;
  meeting_link: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
}

export interface TdzConnection {
  id: string;
  account_slot: TdzAccountSlot;
  account_email: string | null;
  account_name?: string | null;
  avatar_url?: string | null;
  google_sub?: string | null;
  status: string;
  last_synced_at: string | null;
}


export interface TdzContact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  avatar_url: string | null;
  notes: string | null;
  tags: string[];
  source: string;
  account_slot: string | null;
  google_resource_id: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}
