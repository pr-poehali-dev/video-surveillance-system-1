CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.camera_tag_links (
  camera_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (camera_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_camera_tag_links_tag ON t_p76735805_video_surveillance_s.camera_tag_links (tag_id);