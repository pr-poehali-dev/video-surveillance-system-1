-- Add responsible person fields to camera_owners table
ALTER TABLE t_p76735805_video_surveillance_s.camera_owners 
ADD COLUMN responsible_full_name VARCHAR(255),
ADD COLUMN responsible_phone VARCHAR(50),
ADD COLUMN responsible_email VARCHAR(255),
ADD COLUMN responsible_position VARCHAR(255);