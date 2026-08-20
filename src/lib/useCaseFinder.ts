// Use Case Finder taxonomy + matching.
//
// Three plain-language columns — Industry / Role / I need to… — each carry a
// hidden HAI Framework profile. Users never see the taxonomy; it only powers
// the ranking of use cases underneath.

import { HAIDimensionKey } from '@/lib/haiFramework';
import { HAIUseCase } from '@/hooks/useHAIUseCases';
import { PFOption } from '@/lib/partnerFinder';

const overlap = (a?: string[] | null, b?: string[] | null): string[] =>
  (a || []).filter((v) => (b || []).includes(v));

const profileValues = (o: PFOption | undefined, key: HAIDimensionKey): string[] =>
  ((o as unknown as Record<string, string[] | undefined>)?.[key] || []) as string[];

/* ------------------------------------------------------------------ */
/* 1. Industry                                                         */
/* ------------------------------------------------------------------ */

export const INDUSTRY_OPTIONS: PFOption[] = [
  { value: 'manufacturing', label: 'Manufacturing', group: 'Industrial', industry_focus: ['Manufacturing', 'Enterprise'], keywords: ['factory', 'production', 'assembly'] },
  { value: 'construction', label: 'Construction', group: 'Industrial', industry_focus: ['Construction', 'Enterprise'], keywords: ['site', 'building'] },
  { value: 'energy', label: 'Energy & Utilities', group: 'Industrial', industry_focus: ['Energy', 'Enterprise'], keywords: ['utility', 'grid', 'plant'] },
  { value: 'automotive', label: 'Automotive', group: 'Industrial', industry_focus: ['Automotive', 'Manufacturing'], keywords: ['vehicle', 'car'] },
  { value: 'aerospace', label: 'Aerospace', group: 'Industrial', industry_focus: ['Manufacturing', 'Defense'], keywords: ['aviation', 'aircraft'] },

  { value: 'retail', label: 'Retail', group: 'Services', industry_focus: ['Retail', 'Consumer'], keywords: ['store', 'shopper'] },
  { value: 'hospitality', label: 'Hospitality', group: 'Services', industry_focus: ['Hospitality', 'Consumer'], keywords: ['hotel', 'restaurant', 'guest'] },
  { value: 'financial-services', label: 'Financial Services', group: 'Services', industry_focus: ['Enterprise'], keywords: ['bank', 'insurance', 'finance'] },
  { value: 'professional-services', label: 'Professional Services', group: 'Services', industry_focus: ['Enterprise'], keywords: ['consulting', 'agency', 'legal'] },

  { value: 'healthcare', label: 'Healthcare', group: 'Health & Education', industry_focus: ['Healthcare'], keywords: ['clinical', 'patient', 'hospital'] },
  { value: 'education', label: 'Education', group: 'Health & Education', industry_focus: ['Education'], keywords: ['school', 'training', 'student'] },

  { value: 'logistics', label: 'Logistics & Supply Chain', group: 'Mobility', industry_focus: ['Logistics', 'Enterprise'], keywords: ['warehouse', 'supply chain', 'fulfilment'] },
  { value: 'transportation', label: 'Transportation', group: 'Mobility', industry_focus: ['Logistics', 'Automotive'], keywords: ['fleet', 'transit', 'driving'] },

  { value: 'government', label: 'Government', group: 'Public Sector', industry_focus: ['Government'], keywords: ['public sector', 'agency'] },
  { value: 'defense', label: 'Defense', group: 'Public Sector', industry_focus: ['Defense', 'Government'], keywords: ['military', 'mission'] },
  { value: 'public-safety', label: 'Public Safety', group: 'Public Sector', industry_focus: ['Government'], keywords: ['emergency', 'first responder', 'police', 'fire'] },

  { value: 'consumer', label: 'Consumer', group: 'Consumer & Media', industry_focus: ['Consumer'], keywords: ['personal', 'everyday'] },
  { value: 'sports', label: 'Sports', group: 'Consumer & Media', industry_focus: ['Sports', 'Consumer'], keywords: ['athlete', 'fitness', 'training'] },
  { value: 'media', label: 'Media & Entertainment', group: 'Consumer & Media', industry_focus: ['Media', 'Consumer'], keywords: ['content', 'production', 'broadcast'] },
];

/* ------------------------------------------------------------------ */
/* 2. Role — dynamically derived from the selected industry            */
/* ------------------------------------------------------------------ */

type RoleArchetype = Omit<PFOption, 'value' | 'label'>;

const ARCHETYPES: Record<string, RoleArchetype> = {
  operator: { group: 'Frontline', human_activities: ['Operate'], human_capabilities: ['Act'], ai_capabilities: ['Perceive'], human_interface: ['Personal Devices'], keywords: ['operate', 'production'] },
  technician: { group: 'Frontline', human_activities: ['Operate', 'Learn'], human_capabilities: ['Act'], ai_capabilities: ['Reason', 'Perceive'], human_interface: ['Personal Devices'], keywords: ['repair', 'service', 'field'] },
  inspector: { group: 'Frontline', human_activities: ['Observe'], human_capabilities: ['Perceive', 'Supervise'], ai_capabilities: ['Perceive'], human_interface: ['Personal Devices'], keywords: ['inspection', 'quality', 'defect'] },
  maintainer: { group: 'Frontline', human_activities: ['Operate', 'Observe'], human_capabilities: ['Act'], ai_capabilities: ['Reason', 'Perceive', 'Plan'], human_interface: ['Personal Devices'], keywords: ['maintenance', 'repair', 'downtime'] },
  handler: { group: 'Frontline', human_activities: ['Operate', 'Navigate'], human_capabilities: ['Act', 'Navigate'], ai_capabilities: ['Embody', 'Perceive'], keywords: ['picking', 'warehouse', 'material handling'] },
  frontlineService: { group: 'Frontline', human_activities: ['Serve'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate'], human_interface: ['Conversational'], keywords: ['guest', 'customer', 'service'] },
  clinician: { group: 'Frontline', human_activities: ['Serve', 'Observe'], human_capabilities: ['Perceive', 'Communicate'], ai_capabilities: ['Perceive', 'Communicate'], keywords: ['patient', 'care', 'clinical'] },
  responder: { group: 'Frontline', human_activities: ['Protect'], human_capabilities: ['Perceive', 'Act'], ai_capabilities: ['Perceive', 'Plan'], keywords: ['emergency', 'incident', 'response'] },
  driver: { group: 'Frontline', human_activities: ['Navigate'], human_capabilities: ['Navigate'], ai_capabilities: ['Spatial', 'Embody'], keywords: ['driving', 'route', 'fleet'] },
  educator: { group: 'Frontline', human_activities: ['Serve', 'Learn'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Reason'], keywords: ['teaching', 'training'] },
  creator: { group: 'Technical', human_activities: ['Create'], human_capabilities: ['Create'], ai_capabilities: ['Perceive', 'Reason'], keywords: ['content', 'design', 'production'] },
  engineer: { group: 'Technical', human_activities: ['Think', 'Create'], human_capabilities: ['Think'], ai_capabilities: ['Reason', 'Plan'], keywords: ['engineering', 'design'] },
  automationEngineer: { group: 'Technical', human_activities: ['Think', 'Operate'], human_capabilities: ['Think', 'Act'], ai_capabilities: ['Automate', 'Embody'], keywords: ['automation', 'robotics', 'controls'] },
  analyst: { group: 'Technical', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Reason', 'Plan'], keywords: ['analysis', 'data', 'forecast'] },
  itLead: { group: 'Technical', human_activities: ['Operate', 'Protect'], human_capabilities: ['Supervise'], ai_capabilities: ['Deploy', 'Automate'], keywords: ['it', 'deployment', 'systems'] },
  supervisor: { group: 'Management', human_activities: ['Observe', 'Collaborate'], human_capabilities: ['Supervise'], ai_capabilities: ['Perceive', 'Plan'], keywords: ['supervision', 'shift', 'team'] },
  qualityManager: { group: 'Management', human_activities: ['Observe'], human_capabilities: ['Supervise'], ai_capabilities: ['Perceive', 'Reason'], keywords: ['quality', 'compliance', 'audit'] },
  safetyManager: { group: 'Management', human_activities: ['Protect', 'Observe'], human_capabilities: ['Supervise'], ai_capabilities: ['Perceive'], keywords: ['safety', 'risk', 'ppe'] },
  serviceManager: { group: 'Management', human_activities: ['Serve', 'Think'], human_capabilities: ['Communicate', 'Think'], ai_capabilities: ['Communicate', 'Plan'], keywords: ['service', 'customer', 'support'] },
  programManager: { group: 'Management', human_activities: ['Think', 'Collaborate'], human_capabilities: ['Think', 'Communicate'], ai_capabilities: ['Plan', 'Automate'], keywords: ['program', 'project', 'planning'] },
  opsLeader: { group: 'Leadership', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Plan', 'Automate', 'Reason'], keywords: ['operations', 'efficiency'] },
  executive: { group: 'Leadership', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Reason', 'Plan'], keywords: ['strategy', 'transformation'] },
  innovationLead: { group: 'Leadership', human_activities: ['Think', 'Create'], human_capabilities: ['Think', 'Create'], ai_capabilities: ['Reason'], keywords: ['innovation', 'pilot', 'r&d'] },
};

const role = (archetype: keyof typeof ARCHETYPES, label: string): PFOption => ({
  ...ARCHETYPES[archetype],
  value: `${archetype}:${label.toLowerCase().replace(/[^a-z]+/g, '-')}`,
  label,
});

const INDUSTRIAL_LEADERSHIP = (plant: string) => [
  role('opsLeader', plant),
  role('opsLeader', 'Operations Leader'),
  role('executive', 'Executive'),
];

/** Roles offered per industry, grouped Frontline → Technical → Management → Leadership. */
export const ROLES_BY_INDUSTRY: Record<string, PFOption[]> = {
  manufacturing: [
    role('operator', 'Operator'),
    role('technician', 'Technician'),
    role('inspector', 'Inspector'),
    role('maintainer', 'Maintenance Technician'),
    role('handler', 'Warehouse Worker'),
    role('engineer', 'Engineer'),
    role('engineer', 'Process Engineer'),
    role('automationEngineer', 'Automation Engineer'),
    role('supervisor', 'Supervisor'),
    role('programManager', 'Production Manager'),
    role('qualityManager', 'Quality Manager'),
    role('safetyManager', 'Safety Manager'),
    ...INDUSTRIAL_LEADERSHIP('Plant Manager'),
  ],
  construction: [
    role('operator', 'Site Worker'),
    role('technician', 'Trade Specialist'),
    role('inspector', 'Site Inspector'),
    role('maintainer', 'Equipment Technician'),
    role('engineer', 'Civil / Structural Engineer'),
    role('analyst', 'BIM / VDC Specialist'),
    role('supervisor', 'Foreman'),
    role('programManager', 'Project Manager'),
    role('safetyManager', 'Safety Manager'),
    role('qualityManager', 'Quality Manager'),
    ...INDUSTRIAL_LEADERSHIP('Construction Director'),
  ],
  energy: [
    role('operator', 'Plant Operator'),
    role('technician', 'Field Technician'),
    role('inspector', 'Asset Inspector'),
    role('maintainer', 'Maintenance Technician'),
    role('engineer', 'Grid / Systems Engineer'),
    role('analyst', 'Reliability Analyst'),
    role('supervisor', 'Control Room Supervisor'),
    role('safetyManager', 'HSE Manager'),
    role('programManager', 'Asset Manager'),
    ...INDUSTRIAL_LEADERSHIP('Operations Director'),
  ],
  automotive: [
    role('operator', 'Line Operator'),
    role('technician', 'Service Technician'),
    role('inspector', 'Quality Inspector'),
    role('maintainer', 'Maintenance Technician'),
    role('engineer', 'Vehicle Engineer'),
    role('automationEngineer', 'Automation Engineer'),
    role('creator', 'Designer'),
    role('supervisor', 'Shop Supervisor'),
    role('serviceManager', 'Service Manager'),
    role('qualityManager', 'Quality Manager'),
    ...INDUSTRIAL_LEADERSHIP('Plant Manager'),
  ],
  aerospace: [
    role('technician', 'Assembly Technician'),
    role('inspector', 'Certification Inspector'),
    role('maintainer', 'MRO Technician'),
    role('engineer', 'Design Engineer'),
    role('analyst', 'Systems Analyst'),
    role('supervisor', 'Line Supervisor'),
    role('qualityManager', 'Quality & Compliance Manager'),
    role('safetyManager', 'Safety Manager'),
    ...INDUSTRIAL_LEADERSHIP('Programme Director'),
  ],
  retail: [
    role('frontlineService', 'Store Associate'),
    role('handler', 'Stockroom Associate'),
    role('inspector', 'Merchandising Specialist'),
    role('analyst', 'Category Analyst'),
    role('creator', 'Visual Designer'),
    role('supervisor', 'Store Manager'),
    role('serviceManager', 'Customer Experience Manager'),
    role('programManager', 'Operations Manager'),
    role('opsLeader', 'Retail Operations Leader'),
    role('executive', 'Executive'),
  ],
  hospitality: [
    role('frontlineService', 'Front Desk Associate'),
    role('frontlineService', 'Server / Host'),
    role('maintainer', 'Facilities Technician'),
    role('handler', 'Housekeeping Staff'),
    role('analyst', 'Revenue Analyst'),
    role('supervisor', 'Shift Supervisor'),
    role('serviceManager', 'Guest Experience Manager'),
    role('programManager', 'General Manager'),
    role('executive', 'Executive'),
  ],
  'financial-services': [
    role('frontlineService', 'Branch / Client Advisor'),
    role('analyst', 'Analyst'),
    role('engineer', 'Software Engineer'),
    role('itLead', 'IT / Platform Lead'),
    role('qualityManager', 'Risk & Compliance Manager'),
    role('serviceManager', 'Customer Service Manager'),
    role('programManager', 'Programme Manager'),
    role('executive', 'Executive'),
  ],
  'professional-services': [
    role('frontlineService', 'Client Delivery Consultant'),
    role('creator', 'Designer / Creative'),
    role('analyst', 'Research Analyst'),
    role('engineer', 'Solution Architect'),
    role('programManager', 'Engagement Manager'),
    role('serviceManager', 'Account Manager'),
    role('innovationLead', 'Innovation Lead'),
    role('executive', 'Partner / Executive'),
  ],
  healthcare: [
    role('clinician', 'Nurse'),
    role('clinician', 'Physician'),
    role('clinician', 'Care Assistant'),
    role('technician', 'Clinical Technician'),
    role('maintainer', 'Biomedical Engineer'),
    role('educator', 'Clinical Educator'),
    role('analyst', 'Clinical Informatics Analyst'),
    role('supervisor', 'Ward / Unit Manager'),
    role('qualityManager', 'Quality & Compliance Manager'),
    role('executive', 'Clinical Executive'),
  ],
  education: [
    role('educator', 'Teacher / Instructor'),
    role('educator', 'Trainer'),
    role('frontlineService', 'Student Support Staff'),
    role('creator', 'Curriculum Designer'),
    role('itLead', 'EdTech Lead'),
    role('analyst', 'Learning Analyst'),
    role('supervisor', 'Department Head'),
    role('executive', 'Academic Leader'),
  ],
  logistics: [
    role('handler', 'Warehouse Associate'),
    role('driver', 'Delivery Driver'),
    role('inspector', 'Goods Inspector'),
    role('maintainer', 'Equipment Technician'),
    role('automationEngineer', 'Automation Engineer'),
    role('analyst', 'Supply Chain Analyst'),
    role('supervisor', 'Warehouse Supervisor'),
    role('programManager', 'Logistics Manager'),
    role('safetyManager', 'Safety Manager'),
    role('opsLeader', 'Operations Leader'),
  ],
  transportation: [
    role('driver', 'Driver / Operator'),
    role('technician', 'Fleet Technician'),
    role('inspector', 'Vehicle Inspector'),
    role('analyst', 'Fleet Analyst'),
    role('automationEngineer', 'Autonomy Engineer'),
    role('supervisor', 'Dispatch Supervisor'),
    role('safetyManager', 'Safety Manager'),
    role('opsLeader', 'Operations Leader'),
  ],
  government: [
    role('frontlineService', 'Field Officer'),
    role('inspector', 'Compliance Inspector'),
    role('analyst', 'Policy Analyst'),
    role('itLead', 'Digital Services Lead'),
    role('programManager', 'Programme Manager'),
    role('qualityManager', 'Compliance Manager'),
    role('executive', 'Agency Leader'),
  ],
  defense: [
    role('operator', 'Operator'),
    role('maintainer', 'Maintenance Technician'),
    role('responder', 'Mission Personnel'),
    role('engineer', 'Systems Engineer'),
    role('analyst', 'Intelligence Analyst'),
    role('supervisor', 'Unit Commander'),
    role('safetyManager', 'Readiness & Safety Lead'),
    role('executive', 'Programme Executive'),
  ],
  'public-safety': [
    role('responder', 'First Responder'),
    role('responder', 'Firefighter'),
    role('frontlineService', 'Dispatcher'),
    role('inspector', 'Field Inspector'),
    role('analyst', 'Incident Analyst'),
    role('supervisor', 'Incident Commander'),
    role('safetyManager', 'Emergency Preparedness Manager'),
    role('executive', 'Agency Leader'),
  ],
  consumer: [
    role('frontlineService', 'Everyday User'),
    role('creator', 'Creator / Enthusiast'),
    role('clinician', 'Caregiver'),
    role('educator', 'Learner'),
    role('analyst', 'Product Researcher'),
    role('innovationLead', 'Product Lead'),
    role('executive', 'Executive'),
  ],
  sports: [
    role('frontlineService', 'Athlete'),
    role('educator', 'Coach'),
    role('clinician', 'Physiotherapist'),
    role('analyst', 'Performance Analyst'),
    role('creator', 'Broadcast Producer'),
    role('programManager', 'Team Manager'),
    role('executive', 'Club Executive'),
  ],
  media: [
    role('creator', 'Creator / Producer'),
    role('technician', 'Broadcast Technician'),
    role('creator', 'Editor'),
    role('analyst', 'Audience Analyst'),
    role('engineer', 'Media Engineer'),
    role('programManager', 'Production Manager'),
    role('executive', 'Executive'),
  ],
};

/** Generic fallback used before an industry is chosen. */
export const DEFAULT_ROLES: PFOption[] = [
  role('operator', 'Frontline Worker'),
  role('technician', 'Technician'),
  role('inspector', 'Inspector'),
  role('clinician', 'Care Professional'),
  role('frontlineService', 'Customer-Facing Staff'),
  role('engineer', 'Engineer'),
  role('creator', 'Creator'),
  role('analyst', 'Analyst'),
  role('itLead', 'IT / Platform Lead'),
  role('supervisor', 'Supervisor'),
  role('qualityManager', 'Quality Manager'),
  role('safetyManager', 'Safety Manager'),
  role('programManager', 'Programme Manager'),
  role('opsLeader', 'Operations Leader'),
  role('executive', 'Executive'),
];

export const rolesForIndustry = (industry?: string): PFOption[] =>
  (industry && ROLES_BY_INDUSTRY[industry]) || DEFAULT_ROLES;

/* ------------------------------------------------------------------ */
/* 3. I need to… — concrete jobs, grouped by Human Goal                */
/* ------------------------------------------------------------------ */

export const JOB_OPTIONS: PFOption[] = [
  // Understand
  { value: 'identify-problem', label: 'Identify a problem', group: 'Understand', human_activities: ['Observe'], human_capabilities: ['Perceive'], ai_capabilities: ['Perceive', 'Reason'], keywords: ['detect', 'anomaly', 'defect'] },
  { value: 'inspect-something', label: 'Inspect something', group: 'Understand', human_activities: ['Observe'], human_capabilities: ['Perceive', 'Supervise'], ai_capabilities: ['Perceive'], human_interface: ['Personal Devices'], keywords: ['inspection', 'quality'] },
  { value: 'find-information', label: 'Find information', group: 'Understand', human_activities: ['Think', 'Learn'], human_capabilities: ['Think'], ai_capabilities: ['Reason'], keywords: ['search', 'knowledge', 'retrieval'] },
  { value: 'understand-situation', label: 'Understand what is happening', group: 'Understand', human_activities: ['Observe'], human_capabilities: ['Perceive'], ai_capabilities: ['Perceive', 'Spatial'], keywords: ['situational awareness', 'monitoring'] },

  // Decide
  { value: 'diagnose-problem', label: 'Diagnose a problem', group: 'Decide', human_activities: ['Observe', 'Think'], human_capabilities: ['Think', 'Perceive'], ai_capabilities: ['Reason', 'Perceive'], keywords: ['diagnosis', 'fault', 'troubleshoot'] },
  { value: 'determine-next-action', label: 'Determine the next action', group: 'Decide', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Reason', 'Plan'], keywords: ['decision', 'guidance'] },
  { value: 'make-recommendation', label: 'Make a recommendation', group: 'Decide', human_activities: ['Think', 'Serve'], human_capabilities: ['Think', 'Communicate'], ai_capabilities: ['Reason'], keywords: ['recommendation', 'advice'] },
  { value: 'prioritize-work', label: 'Prioritize work', group: 'Decide', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Plan', 'Automate'], keywords: ['scheduling', 'planning', 'prioritisation'] },

  // Perform
  { value: 'complete-task', label: 'Complete a task', group: 'Perform', human_activities: ['Operate'], human_capabilities: ['Act'], ai_capabilities: ['Automate', 'Embody'], keywords: ['task', 'workflow'] },
  { value: 'repair-equipment', label: 'Repair equipment', group: 'Perform', human_activities: ['Operate'], human_capabilities: ['Act'], ai_capabilities: ['Reason', 'Perceive'], human_interface: ['Personal Devices'], keywords: ['repair', 'service'] },
  { value: 'perform-maintenance', label: 'Perform maintenance', group: 'Perform', human_activities: ['Operate', 'Observe'], human_capabilities: ['Act'], ai_capabilities: ['Plan', 'Perceive'], keywords: ['maintenance', 'preventive'] },
  { value: 'follow-procedure', label: 'Follow a procedure', group: 'Perform', human_activities: ['Operate', 'Learn'], human_capabilities: ['Act'], ai_capabilities: ['Reason'], human_interface: ['Personal Devices'], keywords: ['work instruction', 'procedure', 'sop'] },

  // Communicate
  { value: 'get-expert-assistance', label: 'Get expert assistance', group: 'Communicate', human_activities: ['Collaborate'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Perceive'], human_interface: ['Personal Devices'], keywords: ['remote assist', 'expert', 'see what i see'] },
  { value: 'document-work', label: 'Document work', group: 'Communicate', human_activities: ['Observe', 'Collaborate'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Automate'], keywords: ['documentation', 'reporting', 'capture'] },
  { value: 'share-information', label: 'Share information', group: 'Communicate', human_activities: ['Collaborate'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate'], keywords: ['collaboration', 'meeting'] },
  { value: 'communicate-with-customer', label: 'Communicate with a customer', group: 'Communicate', human_activities: ['Serve'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Reason'], human_interface: ['Conversational'], keywords: ['customer', 'support', 'sales'] },

  // Learn
  { value: 'learn-procedure', label: 'Learn a procedure', group: 'Learn', human_activities: ['Learn'], human_capabilities: ['Think'], ai_capabilities: ['Communicate', 'Spatial'], keywords: ['training', 'onboarding'] },
  { value: 'step-by-step-guidance', label: 'Receive step-by-step guidance', group: 'Learn', human_activities: ['Learn', 'Operate'], human_capabilities: ['Act'], ai_capabilities: ['Reason', 'Communicate'], human_interface: ['Personal Devices'], keywords: ['guidance', 'instructions'] },
  { value: 'develop-skill', label: 'Develop a skill', group: 'Learn', human_activities: ['Learn'], human_capabilities: ['Think'], ai_capabilities: ['Communicate', 'Plan'], keywords: ['skills', 'coaching', 'simulation'] },

  // Create
  { value: 'design-something', label: 'Design something', group: 'Create', human_activities: ['Create'], human_capabilities: ['Create'], ai_capabilities: ['Reason', 'Spatial'], keywords: ['design', 'prototype'] },
  { value: 'produce-content', label: 'Produce content', group: 'Create', human_activities: ['Create'], human_capabilities: ['Create'], ai_capabilities: ['Perceive', 'Reason'], keywords: ['content', 'video', 'image'] },
  { value: 'write-code', label: 'Build software', group: 'Create', human_activities: ['Create'], human_capabilities: ['Create', 'Think'], ai_capabilities: ['Reason', 'Deploy'], keywords: ['coding', 'software', 'developer'] },

  // Navigate
  { value: 'find-my-way', label: 'Find my way', group: 'Navigate', human_activities: ['Navigate'], human_capabilities: ['Navigate'], ai_capabilities: ['Spatial'], keywords: ['wayfinding', 'navigation'] },
  { value: 'plan-a-route', label: 'Plan a route', group: 'Navigate', human_activities: ['Navigate', 'Think'], human_capabilities: ['Navigate'], ai_capabilities: ['Plan', 'Spatial'], keywords: ['route', 'dispatch'] },
  { value: 'locate-assets', label: 'Locate people or assets', group: 'Navigate', human_activities: ['Navigate', 'Observe'], human_capabilities: ['Navigate', 'Perceive'], ai_capabilities: ['Spatial', 'Perceive'], keywords: ['tracking', 'location', 'assets'] },

  // Care
  { value: 'care-for-someone', label: 'Care for someone', group: 'Care', human_activities: ['Serve'], human_capabilities: ['Communicate', 'Perceive'], ai_capabilities: ['Perceive', 'Communicate'], industry_focus: ['Healthcare'], keywords: ['care', 'patient', 'assistance'] },
  { value: 'monitor-wellbeing', label: 'Monitor health or wellbeing', group: 'Care', human_activities: ['Observe'], human_capabilities: ['Perceive'], ai_capabilities: ['Perceive', 'Plan'], human_interface: ['Personal Devices'], keywords: ['monitoring', 'wellness', 'biometrics'] },

  // Protect
  { value: 'keep-people-safe', label: 'Keep people safe', group: 'Protect', human_activities: ['Protect', 'Observe'], human_capabilities: ['Supervise'], ai_capabilities: ['Perceive'], keywords: ['safety', 'hazard', 'ppe'] },
  { value: 'ensure-compliance', label: 'Ensure compliance', group: 'Protect', human_activities: ['Protect', 'Observe'], human_capabilities: ['Supervise'], ai_capabilities: ['Reason', 'Perceive'], keywords: ['compliance', 'audit', 'regulation'] },
  { value: 'respond-to-emergency', label: 'Respond to an emergency', group: 'Protect', human_activities: ['Protect'], human_capabilities: ['Act', 'Perceive'], ai_capabilities: ['Perceive', 'Plan'], keywords: ['emergency', 'incident'] },

  // Manage
  { value: 'plan-work', label: 'Plan and schedule work', group: 'Manage', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Plan', 'Automate'], keywords: ['planning', 'scheduling'] },
  { value: 'forecast-demand', label: 'Forecast demand or risk', group: 'Manage', human_activities: ['Think'], human_capabilities: ['Think'], ai_capabilities: ['Plan', 'Reason'], keywords: ['forecast', 'prediction'] },
  { value: 'track-inventory', label: 'Track inventory or assets', group: 'Manage', human_activities: ['Observe', 'Think'], human_capabilities: ['Supervise'], ai_capabilities: ['Perceive', 'Automate'], keywords: ['inventory', 'stock', 'assets'] },
  { value: 'coach-a-team', label: 'Coach and support a team', group: 'Manage', human_activities: ['Collaborate', 'Learn'], human_capabilities: ['Communicate'], ai_capabilities: ['Communicate', 'Reason'], keywords: ['coaching', 'team', 'performance'] },
];

export const HUMAN_GOALS = Array.from(new Set(JOB_OPTIONS.map((j) => j.group)));

export const jobsForGoal = (goal: string) => JOB_OPTIONS.filter((j) => j.group === goal);

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

export interface UseCaseQuery {
  industry?: string;
  role?: string;
  jobs: string[];
}

export interface UseCaseRecommendation {
  useCase: HAIUseCase;
  score: number;
  /** Short "Smart Glasses + Computer Vision + Voice"-style stack summary. */
  typicalSolution: string[];
  matchedJobs: string[];
  context: string;
}

const MATCH_KEYS: { key: HAIDimensionKey; weight: number }[] = [
  { key: 'human_activities', weight: 3 },
  { key: 'human_capabilities', weight: 2 },
  { key: 'ai_capabilities', weight: 2 },
  { key: 'human_interface', weight: 2 },
  { key: 'industry_focus', weight: 2 },
];

const ucValues = (uc: HAIUseCase, key: HAIDimensionKey): string[] =>
  ((uc as unknown as Record<string, string[] | null>)[key] || []) as string[];

const keywordHit = (uc: HAIUseCase, option?: PFOption) => {
  if (!option) return 0;
  const text = `${uc.name} ${uc.summary || ''} ${uc.description || ''}`.toLowerCase();
  const kws = (option.keywords || []).concat(option.label.toLowerCase());
  return kws.filter((k) => text.includes(k.toLowerCase())).length;
};

export const typicalSolutionFor = (uc: HAIUseCase): string[] => [
  ...(uc.human_interface || []).slice(0, 2),
  ...(uc.ai_capabilities || []).slice(0, 3),
];

/** Rank use cases against an Industry + Role + Jobs request. */
export const findUseCaseMatches = (
  useCases: HAIUseCase[] | undefined,
  query: UseCaseQuery,
  limit = 6
): UseCaseRecommendation[] => {
  if (!useCases) return [];
  const industry = INDUSTRY_OPTIONS.find((o) => o.value === query.industry);
  const roleOpt = rolesForIndustry(query.industry).find((o) => o.value === query.role);
  const jobs = JOB_OPTIONS.filter((j) => query.jobs.includes(j.value));
  if (!industry && !roleOpt && jobs.length === 0) return [];

  const inputs: { option: PFOption; weight: number }[] = [
    ...(industry ? [{ option: industry, weight: 1 }] : []),
    ...(roleOpt ? [{ option: roleOpt, weight: 1.2 }] : []),
    ...jobs.map((j) => ({ option: j, weight: 1.8 })),
  ];

  const scored = useCases.map((uc) => {
    let raw = 0;
    const matchedJobs: string[] = [];

    inputs.forEach(({ option, weight }) => {
      let local = 0;
      MATCH_KEYS.forEach(({ key, weight: kw }) => {
        local += overlap(profileValues(option, key), ucValues(uc, key)).length * kw;
      });
      local += keywordHit(uc, option) * 4;
      if (local > 0 && jobs.includes(option)) {
        matchedJobs.push(option.label);
      }
      raw += local * weight;
    });

    const contextBits = [
      industry?.label,
      roleOpt?.label,
      jobs.length > 0 ? jobs.map((j) => j.label).join(' & ') : null,
    ].filter(Boolean) as string[];

    return {
      useCase: uc,
      score: 0,
      typicalSolution: typicalSolutionFor(uc),
      matchedJobs,
      context: contextBits.join(' → '),
      raw,
    };
  });

  const ranked = scored.filter((s) => s.raw > 0).sort((a, b) => b.raw - a.raw).slice(0, limit);
  const top = ranked[0]?.raw || 1;
  return ranked.map(({ raw, ...rest }) => ({
    ...rest,
    score: Math.max(45, Math.min(97, Math.round(58 + 39 * (raw / top)))),
  }));
};

/** Human-readable label for a stored job/role/industry value. */
export const jobLabel = (value: string) =>
  JOB_OPTIONS.find((j) => j.value === value)?.label || value;
