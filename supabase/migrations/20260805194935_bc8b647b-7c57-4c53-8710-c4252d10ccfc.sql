UPDATE public.scrm_sponsors SET
  sponsor_type = COALESCE(sponsor_type, NULLIF(btrim((regexp_match(notes, '(?m)^Type:[ \t]*(.*)$'))[1]), '')),
  organization_type = COALESCE(organization_type, NULLIF(btrim((regexp_match(notes, '(?m)^Org type:[ \t]*(.*)$'))[1]), '')),
  likelihood_2027 = COALESCE(likelihood_2027, NULLIF(btrim((regexp_match(notes, '(?m)^2027 likelihood:[ \t]*(.*)$'))[1]), '')),
  strategic_fit = COALESCE(strategic_fit, NULLIF(btrim((regexp_match(notes, '(?m)^Strategic fit:[ \t]*(.*)$'))[1]), '')),
  recommended_activation = COALESCE(recommended_activation, NULLIF(btrim((regexp_match(notes, '(?m)^Recommended activation:[ \t]*(.*)$'))[1]), '')),
  recommended_next_action = COALESCE(recommended_next_action, NULLIF(btrim((regexp_match(notes, '(?m)^Recommended next action:[ \t]*(.*)$'))[1]), '')),
  notes = NULLIF(btrim(regexp_replace(notes, '(?m)^(Type|Org type|2027 likelihood|Strategic fit|Recommended activation|Recommended next action):[ \t]*.*\n?', '', 'g')), ''),
  updated_at = now()
WHERE notes IS NOT NULL AND notes ~ '(?m)^(Type|Org type|2027 likelihood|Strategic fit|Recommended activation|Recommended next action):';