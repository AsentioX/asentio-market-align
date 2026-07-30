UPDATE public.xr_companies
SET human_capabilities = (
  SELECT COALESCE(array_agg(DISTINCT m), '{}')
  FROM unnest(human_capabilities) v,
  LATERAL (SELECT CASE v
    WHEN 'Seeing' THEN 'Perceive'
    WHEN 'Hearing' THEN 'Perceive'
    WHEN 'Monitoring' THEN 'Supervise'
    WHEN 'Speaking' THEN 'Communicate'
    WHEN 'Collaborating' THEN 'Communicate'
    WHEN 'Remembering' THEN 'Think'
    WHEN 'Learning' THEN 'Think'
    WHEN 'Thinking' THEN 'Think'
    WHEN 'Deciding' THEN 'Think'
    WHEN 'Navigating' THEN 'Navigate'
    WHEN 'Moving' THEN 'Act'
    WHEN 'Manipulating' THEN 'Act'
    WHEN 'Creating' THEN 'Create'
    ELSE v END AS m) x
)
WHERE human_capabilities IS NOT NULL AND array_length(human_capabilities,1) > 0;