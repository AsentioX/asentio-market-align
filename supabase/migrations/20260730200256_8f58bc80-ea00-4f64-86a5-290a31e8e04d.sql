UPDATE public.xr_agencies
SET services = (
  SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), '{}')
  FROM (
    SELECT CASE
      WHEN x = 'AR Development' THEN 'AR'
      WHEN x = 'VR Development' THEN 'VR'
      WHEN x = '3D Modeling' THEN '3D Visualization'
      ELSE x
    END AS s
    FROM unnest(services) AS x
  ) m
  WHERE s IN ('AI Agents','LLM Integration','Computer Vision','Voice AI','Machine Learning','Workflow Automation','AR','VR','Digital Twins','3D Visualization','Humanoid Robotics','Industrial Automation','Autonomous Vehicles','Autonomous Mobile Robot','Robotics Software')
),
updated_at = now()
WHERE services IS NOT NULL;