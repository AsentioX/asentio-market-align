export const STAGES = [
  { key: 'target_identified', label: 'Target Identified', color: 'bg-slate-100 text-slate-700' },
  { key: 'researching', label: 'Researching', color: 'bg-slate-100 text-slate-700' },
  { key: 'initial_contact', label: 'Initial Contact', color: 'bg-blue-50 text-blue-700' },
  { key: 'prospectus_sent', label: 'Prospectus Sent', color: 'bg-blue-50 text-blue-700' },
  { key: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'bg-indigo-50 text-indigo-700' },
  { key: 'presentation_delivered', label: 'Presentation Delivered', color: 'bg-indigo-50 text-indigo-700' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: 'bg-violet-50 text-violet-700' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-amber-50 text-amber-700' },
  { key: 'verbal_commitment', label: 'Verbal Commitment', color: 'bg-amber-50 text-amber-800' },
  { key: 'contract_signed', label: 'Contract Signed', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'activation_planning', label: 'Activation Planning', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'delivery', label: 'Reality Hack Delivery', color: 'bg-emerald-50 text-emerald-800' },
  { key: 'post_event', label: 'Post Event Reporting', color: 'bg-teal-50 text-teal-700' },
  { key: 'renewal', label: 'Renewal Discussion', color: 'bg-teal-50 text-teal-700' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'bg-rose-50 text-rose-700' },
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
  target_identified: ['research','warm_intro'],
  researching: ['warm_intro','linkedin'],
  initial_contact: ['warm_intro','intro_email'],
  prospectus_sent: ['follow_up','schedule_meeting'],
  meeting_scheduled: ['prep_presentation'],
  presentation_delivered: ['send_summary','answer_questions','schedule_followup'],
  proposal_sent: ['follow_up','legal_review'],
  negotiation: ['legal_review','send_contract'],
  verbal_commitment: ['send_contract','obtain_signature'],
  contract_signed: ['collect_logos','define_challenge','confirm_mentors'],
  activation_planning: ['confirm_workshop','confirm_prizes','confirm_booth'],
  delivery: ['add_to_website','publish_announcement'],
  post_event: ['deliver_resumes','metrics_report','roi_report'],
  renewal: ['schedule_retro','discuss_renewal','next_year_prospectus'],
  closed_lost: [],
};

export const DELIVERABLE_CATEGORIES = [
  'Workshop','Challenge','Mentors','Prizes','Recruiting session',
  'Branding','Resume access','Social post','Press mention',
];
