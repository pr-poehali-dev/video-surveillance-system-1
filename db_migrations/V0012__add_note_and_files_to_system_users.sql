ALTER TABLE t_p76735805_video_surveillance_s.system_users 
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS attached_files TEXT[];