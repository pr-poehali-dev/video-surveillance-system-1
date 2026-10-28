CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.user_dashboard_owners (
  user_id INTEGER NOT NULL REFERENCES t_p76735805_video_surveillance_s.system_users(id),
  owner_id INTEGER NOT NULL REFERENCES t_p76735805_video_surveillance_s.camera_owners(id),
  block VARCHAR(30) NOT NULL DEFAULT 'gov',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, owner_id, block)
);