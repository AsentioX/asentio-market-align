UPDATE public.xr_companies
SET ai_capabilities = (
  SELECT ARRAY(
    SELECT DISTINCT v FROM (
      SELECT CASE cap
        WHEN 'AI Agents' THEN 'Reason'
        WHEN 'Large Language Models' THEN 'Reason'
        WHEN 'Knowledge AI (RAG)' THEN 'Reason'
        WHEN 'Reinforcement Learning' THEN 'Reason'
        WHEN 'Computer Vision' THEN 'Perceive'
        WHEN 'Speech Recognition' THEN 'Perceive'
        WHEN 'Multimodal AI' THEN 'Perceive'
        WHEN 'Voice AI' THEN 'Communicate'
        WHEN 'Translation AI' THEN 'Communicate'
        WHEN 'Planning' THEN 'Plan'
        WHEN 'Predictive AI' THEN 'Plan'
        WHEN 'Workflow Automation' THEN 'Automate'
        WHEN 'Robotics AI' THEN 'Embody'
        WHEN 'Localization' THEN 'Embody'
        WHEN 'Manipulation' THEN 'Embody'
        WHEN 'Spatial AI' THEN 'Spatial'
        WHEN 'Digital Twin' THEN 'Spatial'
        WHEN 'Edge AI' THEN 'Deploy'
        ELSE cap
      END AS v
      FROM unnest(ai_capabilities) AS cap
    ) mapped
    WHERE v IN ('Reason','Perceive','Communicate','Plan','Automate','Embody','Spatial','Deploy')
  )
)
WHERE ai_capabilities IS NOT NULL;