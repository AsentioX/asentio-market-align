UPDATE public.xr_companies
SET human_interface = (
  SELECT ARRAY(
    SELECT DISTINCT CASE
      WHEN v IN ('AI Agent','Desktop','Conversational') THEN 'Conversational'
      WHEN v IN ('Smart Glasses','Hearables','Mobile','Smart Watch','Smart Ring','Spatial Computing','Brain Computer Interface','Personal Devices') THEN 'Personal Devices'
      WHEN v IN ('Robotics','Humanoid Robot','Industrial Robot','Autonomous Vehicle','Embodied') THEN 'Embodied'
      WHEN v IN ('Smart Home','Ambient Computing','Environment') THEN 'Environment'
      ELSE NULL
    END
    FROM unnest(human_interface) AS v
  )
)
WHERE human_interface IS NOT NULL AND array_length(human_interface, 1) > 0;