CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.incident_events (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  event_type VARCHAR(30) NOT NULL,
  detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
  camera_id INTEGER,
  camera_name VARCHAR(255),
  address VARCHAR(500),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  confidence INTEGER,
  photo_url TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incident_events_cat_time ON t_p76735805_video_surveillance_s.incident_events (category, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_events_type ON t_p76735805_video_surveillance_s.incident_events (event_type);