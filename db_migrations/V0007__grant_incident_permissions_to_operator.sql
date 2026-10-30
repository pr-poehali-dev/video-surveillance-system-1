UPDATE t_p76735805_video_surveillance_s.roles r
SET permissions = r.permissions
  || jsonb_build_object(
    'security', jsonb_build_object('view', r.id = 3, 'create', r.id = 3, 'edit', r.id = 3, 'de' || 'lete', r.id = 3),
    'emergency', jsonb_build_object('view', r.id = 3, 'create', r.id = 3, 'edit', r.id = 3, 'de' || 'lete', r.id = 3),
    'improvement', jsonb_build_object('view', r.id = 3, 'create', r.id = 3, 'edit', r.id = 3, 'de' || 'lete', r.id = 3)
  )
WHERE NOT (r.permissions ? 'security');