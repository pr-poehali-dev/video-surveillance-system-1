UPDATE t_p76735805_video_surveillance_s.roles
SET permissions = jsonb_set(permissions, '{bpla}', '{"view": false}'::jsonb, true)
WHERE NOT (permissions ? 'bpla');

UPDATE t_p76735805_video_surveillance_s.roles
SET permissions = jsonb_set(permissions, '{bpla,view}', 'true'::jsonb, true)
WHERE id = 3;