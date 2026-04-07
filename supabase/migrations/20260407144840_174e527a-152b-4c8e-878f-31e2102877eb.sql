
DROP VIEW IF EXISTS public.mydj_session_summary_view;
CREATE VIEW public.mydj_session_summary_view WITH (security_invoker = true) AS
SELECT
  s.id AS session_id,
  s.user_id,
  m.name AS mode_name,
  m.strategy_type,
  s.activity_type,
  s.started_at,
  s.ended_at,
  s.status,
  s.intensity_preference,
  so.duration_minutes,
  so.hr_start,
  so.hr_end,
  so.hr_change,
  so.hrv_change,
  so.effectiveness_score,
  so.target_state_reached,
  so.user_rating,
  cs.name AS current_state_name,
  ts.name AS target_state_name
FROM public.mydj_sessions s
LEFT JOIN public.mydj_modes m ON s.mode_id = m.id
LEFT JOIN public.mydj_session_outcomes so ON so.session_id = s.id
LEFT JOIN public.mydj_state_definitions cs ON s.current_state_id = cs.id
LEFT JOIN public.mydj_state_definitions ts ON s.target_state_id = ts.id;
