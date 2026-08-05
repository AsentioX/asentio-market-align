export const STAGES = [
  { key: 'potential_sponsor', label: 'Potential Sponsor', color: 'bg-slate-100 text-slate-700' },
  { key: 'contacting', label: 'Contacting', color: 'bg-blue-50 text-blue-700' },
  { key: 'discussing', label: 'Discussing', color: 'bg-indigo-50 text-indigo-700' },
  { key: 'contract_signed', label: 'Contract Signed', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'rh_planning', label: 'RH Planning', color: 'bg-emerald-50 text-emerald-800' },
  { key: 'rh_post_event_interview', label: 'RH Post Event Interview', color: 'bg-teal-50 text-teal-700' },
  { key: 'no_this_year', label: 'Sponsor - No for this year', color: 'bg-amber-50 text-amber-800' },
  { key: 'removed', label: 'Sponsor - REMOVE', color: 'bg-rose-50 text-rose-700' },
] as const;

export type StageKey = typeof STAGES[number]['key'];

export const stageLabel = (k: string) => STAGES.find(s => s.key === k)?.label ?? k;
export const stageColor = (k: string) => STAGES.find(s => s.key === k)?.color ?? 'bg-slate-100 text-slate-700';

export const MOTIVATIONS = [
  'developer_adoption','sdk_validation','recruiting','brand_awareness',
  'thought_leadership','research_collaboration','ecosystem_growth',
] as const;

export const MOTIVATION_LABEL: Record<string,string> = {
  developer_adoption: 'Developer adoption',
  sdk_validation: 'SDK validation',
  recruiting: 'Recruiting',
  brand_awareness: 'Brand awareness',
  thought_leadership: 'Thought leadership',
  research_collaboration: 'Research collaboration',
  ecosystem_growth: 'Ecosystem growth',
};

export type ActionCategory = 'outreach'|'meeting'|'commercial'|'activation'|'delivery'|'renewal';

export const ACTION_LIBRARY: { category: ActionCategory; title: string; key: string; days: number }[] = [
  // Outreach
  { category: 'outreach', title: 'Research company', key: 'research', days: 3 },
  { category: 'outreach', title: 'Find warm introduction', key: 'warm_intro', days: 5 },
  { category: 'outreach', title: 'Connect on LinkedIn', key: 'linkedin', days: 2 },
  { category: 'outreach', title: 'Send intro email', key: 'intro_email', days: 2 },
  { category: 'outreach', title: 'Send prospectus', key: 'send_prospectus', days: 2 },
  { category: 'outreach', title: 'Follow up', key: 'follow_up', days: 5 },
  // Meeting
  { category: 'meeting', title: 'Schedule meeting', key: 'schedule_meeting', days: 5 },
  { category: 'meeting', title: 'Prepare presentation', key: 'prep_presentation', days: 4 },
  { category: 'meeting', title: 'Conduct presentation', key: 'conduct_presentation', days: 7 },
  { category: 'meeting', title: 'Send meeting summary', key: 'send_summary', days: 2 },
  { category: 'meeting', title: 'Answer questions', key: 'answer_questions', days: 3 },
  { category: 'meeting', title: 'Schedule follow-up', key: 'schedule_followup', days: 4 },
  // Commercial
  { category: 'commercial', title: 'Create proposal', key: 'create_proposal', days: 4 },
  { category: 'commercial', title: 'Send proposal', key: 'send_proposal', days: 2 },
  { category: 'commercial', title: 'Send contract', key: 'send_contract', days: 3 },
  { category: 'commercial', title: 'Review legal feedback', key: 'legal_review', days: 5 },
  { category: 'commercial', title: 'Obtain signature', key: 'obtain_signature', days: 7 },
  // Activation
  { category: 'activation', title: 'Define challenge statement', key: 'define_challenge', days: 7 },
  { category: 'activation', title: 'Define judging criteria', key: 'judging_criteria', days: 7 },
  { category: 'activation', title: 'Confirm workshop', key: 'confirm_workshop', days: 10 },
  { category: 'activation', title: 'Confirm mentors', key: 'confirm_mentors', days: 10 },
  { category: 'activation', title: 'Confirm prizes', key: 'confirm_prizes', days: 10 },
  { category: 'activation', title: 'Confirm booth requirements', key: 'confirm_booth', days: 10 },
  // Delivery
  { category: 'delivery', title: 'Collect logos', key: 'collect_logos', days: 5 },
  { category: 'delivery', title: 'Add sponsor to website', key: 'add_to_website', days: 3 },
  { category: 'delivery', title: 'Publish announcement', key: 'publish_announcement', days: 5 },
  { category: 'delivery', title: 'Deliver resumes', key: 'deliver_resumes', days: 14 },
  { category: 'delivery', title: 'Provide metrics report', key: 'metrics_report', days: 21 },
  // Renewal
  { category: 'renewal', title: 'Schedule retrospective', key: 'schedule_retro', days: 14 },
  { category: 'renewal', title: 'Send ROI report', key: 'roi_report', days: 21 },
  { category: 'renewal', title: 'Discuss renewal', key: 'discuss_renewal', days: 30 },
  { category: 'renewal', title: 'Send next-year prospectus', key: 'next_year_prospectus', days: 45 },
];

// Suggested actions by stage
export const STAGE_SUGGESTIONS: Record<string, string[]> = {
  potential_sponsor: ['research','warm_intro','linkedin'],
  contacting: ['intro_email','send_prospectus','follow_up'],
  discussing: ['schedule_meeting','prep_presentation','send_proposal','legal_review'],
  contract_signed: ['collect_logos','define_challenge','confirm_mentors'],
  rh_planning: ['confirm_workshop','confirm_prizes','confirm_booth','add_to_website'],
  rh_post_event_interview: ['deliver_resumes','metrics_report','roi_report','discuss_renewal'],
  no_this_year: ['next_year_prospectus'],
  removed: [],
};

export const DELIVERABLE_CATEGORIES = [
  'Workshop','Challenge','Mentors','Prizes','Recruiting session',
  'Branding','Resume access','Social post','Press mention',
];
