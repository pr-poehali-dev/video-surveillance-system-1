CREATE TABLE t_p76735805_video_surveillance_s.camera_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6366f1',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);