DELETE FROM public.tdz_projects p
WHERE EXISTS (SELECT 1 FROM public.tdz_activity_logs a WHERE a.project_id = p.id AND a.source = 'seed')
   OR p.parent_id IN (SELECT id FROM public.tdz_projects q WHERE EXISTS (SELECT 1 FROM public.tdz_activity_logs a WHERE a.project_id = q.id AND a.source = 'seed'));

DELETE FROM public.tdz_calendar_events WHERE google_event_id IS NULL;

DELETE FROM public.tdz_contacts WHERE source LIKE 'google_%' AND google_resource_id LIKE 'people/%@%';