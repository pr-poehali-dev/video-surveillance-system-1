CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.drone_detections (
  id SERIAL PRIMARY KEY,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  drone_type VARCHAR(100) NOT NULL,
  latitude NUMERIC(10,6) NOT NULL,
  longitude NUMERIC(10,6) NOT NULL,
  zone VARCHAR(100),
  threat VARCHAR(10) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  altitude INTEGER,
  speed INTEGER,
  camera VARCHAR(255),
  address VARCHAR(500),
  confirmed BOOLEAN,
  photo_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drone_detections_detected_at ON t_p76735805_video_surveillance_s.drone_detections(detected_at DESC);