import { supabase } from '@/integrations/supabase/client';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

interface SeedCard {
  title: string;
  description: string;
  mode: 'work' | 'personal';
  context_label: string;
  grouping_key: string;
  time_bucket: string;
  priority: string;
  color_theme: string | null;
  last_activity_at: string;
  due_date?: string;
  children?: Omit<SeedCard, 'children'>[];
  tasks?: { title: string; done?: boolean; due?: string }[];
}

const SEED: SeedCard[] = [
  {
    title: 'Series B narrative',
    description: 'Investor story, metrics appendix and the deck refresh.',
    mode: 'work',
    context_label: 'Fundraise',
    grouping_key: 'Fundraise',
    time_bucket: 'today',
    priority: 'critical',
    color_theme: 'indigo',
    last_activity_at: hoursAgo(0.4),
    due_date: daysFromNow(2),
    tasks: [
      { title: 'Rewrite the market slide', due: daysFromNow(0) },
      { title: 'Pull Q3 retention numbers', due: daysFromNow(1) },
      { title: 'Book the rehearsal', done: true },
    ],
    children: [
      {
        title: 'Metrics appendix',
        description: 'Cohorts, payback, NDR.',
        mode: 'work',
        context_label: 'Fundraise',
        grouping_key: 'Fundraise',
        time_bucket: 'today',
        priority: 'high',
        color_theme: null,
        last_activity_at: hoursAgo(3),
        tasks: [{ title: 'Cohort chart v2' }, { title: 'Sanity-check payback math' }],
      },
      {
        title: 'Deck design pass',
        description: 'Typography and chart styling.',
        mode: 'work',
        context_label: 'Fundraise',
        grouping_key: 'Fundraise',
        time_bucket: 'this_week',
        priority: 'core',
        color_theme: null,
        last_activity_at: hoursAgo(30),
        tasks: [{ title: 'Restyle the 6 data slides' }],
      },
    ],
  },
  {
    title: 'Q4 hiring loop',
    description: 'Two senior engineers and a designer.',
    mode: 'work',
    context_label: 'People',
    grouping_key: 'People',
    time_bucket: 'this_week',
    priority: 'high',
    color_theme: 'sky',
    last_activity_at: hoursAgo(6),
    due_date: daysFromNow(9),
    tasks: [{ title: 'Debrief Tuesday panel' }, { title: 'Send offer to candidate #4', due: daysFromNow(3) }],
  },
  {
    title: 'Platform reliability',
    description: 'Error budget, alert noise, on-call rotation.',
    mode: 'work',
    context_label: 'Engineering',
    grouping_key: 'Engineering',
    time_bucket: 'this_month',
    priority: 'core',
    color_theme: 'teal',
    last_activity_at: hoursAgo(50),
    tasks: [{ title: 'Trim noisy alerts' }, { title: 'Publish on-call handbook' }],
  },
  {
    title: 'Brand refresh exploration',
    description: 'Parked until the raise closes.',
    mode: 'work',
    context_label: 'Marketing',
    grouping_key: 'Marketing',
    time_bucket: 'backlog',
    priority: 'low',
    color_theme: 'amber',
    last_activity_at: hoursAgo(220),
    tasks: [{ title: 'Collect reference boards' }],
  },
  {
    title: 'Kitchen remodel',
    description: 'Contractor quotes and permit filing.',
    mode: 'personal',
    context_label: 'Home',
    grouping_key: 'Home',
    time_bucket: 'this_week',
    priority: 'high',
    color_theme: 'emerald',
    last_activity_at: hoursAgo(12),
    due_date: daysFromNow(5),
    tasks: [{ title: 'Compare the three quotes' }, { title: 'File the permit', due: daysFromNow(4) }],
    children: [
      {
        title: 'Appliance shortlist',
        description: 'Range, hood, dishwasher.',
        mode: 'personal',
        context_label: 'Home',
        grouping_key: 'Home',
        time_bucket: 'this_month',
        priority: 'low',
        color_theme: null,
        last_activity_at: hoursAgo(70),
        tasks: [{ title: 'Measure the range gap' }],
      },
    ],
  },
  {
    title: 'Marathon block',
    description: 'Twelve-week build to the spring race.',
    mode: 'personal',
    context_label: 'Health',
    grouping_key: 'Health',
    time_bucket: 'today',
    priority: 'core',
    color_theme: 'rose',
    last_activity_at: hoursAgo(2),
    tasks: [{ title: 'Easy 8k tonight', due: daysFromNow(0) }, { title: 'Book physio' }],
  },
];

export const seedToDoooZ = async (userId: string) => {
  for (const [i, card] of SEED.entries()) {
    const { data: parent } = await supabase
      .from('tdz_projects')
      .insert({
        user_id: userId,
        title: card.title,
        description: card.description,
        mode: card.mode,
        context_label: card.context_label,
        grouping_key: card.grouping_key,
        time_bucket: card.time_bucket,
        priority: card.priority,
        color_theme: card.color_theme,
        due_date: card.due_date ?? null,
        last_activity_at: card.last_activity_at,
        sort_order: i * 10,
      })
      .select()
      .single();
    if (!parent) continue;

    if (card.tasks?.length) {
      await supabase.from('tdz_tasks').insert(
        card.tasks.map((t, r) => ({
          user_id: userId,
          project_id: parent.id,
          title: t.title,
          done: t.done ?? false,
          due_date: t.due ?? null,
          rank: r,
        })),
      );
    }

    await supabase.from('tdz_activity_logs').insert({
      user_id: userId,
      project_id: parent.id,
      source: 'seed',
      summary: `Workspace created "${card.title}".`,
      detail: card.description,
      occurred_at: card.last_activity_at,
    });

    for (const [ci, child] of (card.children ?? []).entries()) {
      const { data: sub } = await supabase
        .from('tdz_projects')
        .insert({
          user_id: userId,
          parent_id: parent.id,
          title: child.title,
          description: child.description,
          mode: child.mode,
          context_label: child.context_label,
          grouping_key: child.grouping_key,
          time_bucket: child.time_bucket,
          priority: child.priority,
          color_theme: child.color_theme,
          last_activity_at: child.last_activity_at,
          sort_order: i * 10 + ci + 1,
        })
        .select()
        .single();
      if (sub && child.tasks?.length) {
        await supabase.from('tdz_tasks').insert(
          child.tasks.map((t, r) => ({
            user_id: userId,
            project_id: sub.id,
            title: t.title,
            done: t.done ?? false,
            due_date: t.due ?? null,
            rank: r,
          })),
        );
      }
    }
  }

  // Seed a light calendar for both slots
  const base = new Date();
  base.setHours(9, 0, 0, 0);
  const ev = (slot: string, title: string, offsetH: number, durH: number, location?: string, link?: string) => ({
    user_id: userId,
    account_slot: slot,
    title,
    location: location ?? null,
    meeting_link: link ?? null,
    starts_at: new Date(base.getTime() + offsetH * 3600000).toISOString(),
    ends_at: new Date(base.getTime() + (offsetH + durH) * 3600000).toISOString(),
  });
  await supabase.from('tdz_calendar_events').insert([
    ev('work', 'Investor sync', 1, 0.5, undefined, 'https://meet.google.com/abc-defg-hij'),
    ev('work', 'Design review', 1.5, 1, 'Studio A'),
    ev('work', 'Hiring debrief', 5, 0.5, undefined, 'https://meet.google.com/xyz-1234-abc'),
    ev('personal', 'Physio', 9, 1, 'Bay Clinic'),
    ev('personal', 'Contractor walkthrough', 26, 1, 'Home'),
  ]);
};
