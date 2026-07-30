WITH mapped AS (
  SELECT
    c.id,
    (
      SELECT array_agg(DISTINCT new_v ORDER BY new_v)
      FROM (
        SELECT
          CASE
            WHEN old_v IN ('Inspection','Monitoring','Quality Assurance','Diagnostics','Situational Awareness') THEN 'Observe'
            WHEN old_v IN ('Maintenance','Repair','Assembly','Picking','Inventory','Material Handling','Installation','Manufacturing','Cleaning') THEN 'Operate'
            WHEN old_v IN ('Decision Support','Knowledge Retrieval','Navigation','Translation','Planning','Forecasting','Scheduling','Recommendations') THEN 'Think'
            WHEN old_v IN ('Collaboration','Communication','Remote Assistance','Meetings','Coaching') THEN 'Collaborate'
            WHEN old_v IN ('Training','Customer Service','Shopping','Healthcare','Hospitality','Sales','Education') THEN 'Serve'
            WHEN old_v IN ('Content Creation','Design','Coding','Video Creation','Image Generation') THEN 'Create'
            WHEN old_v IN ('Safety','Security','Compliance','Emergency Response','Risk Assessment') THEN 'Protect'
            ELSE old_v
          END AS new_v
        FROM unnest(c.human_activities) AS u(old_v)
      ) m
      WHERE new_v IS NOT NULL
    ) AS new_arr
  FROM xr_companies c
  WHERE human_activities IS NOT NULL AND array_length(human_activities,1) > 0
)
UPDATE xr_companies
SET human_activities = m.new_arr
FROM mapped m
WHERE xr_companies.id = m.id;