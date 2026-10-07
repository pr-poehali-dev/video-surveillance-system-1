CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.ord_recognitions (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(10) NOT NULL,
  camera_id INTEGER REFERENCES t_p76735805_video_surveillance_s.cameras_registry(id),
  recognized_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  match_percent NUMERIC(5,2),
  plate VARCHAR(20),
  image_url TEXT,
  car_image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ord_recognitions_kind_chk CHECK (kind IN ('face', 'plate'))
);

CREATE INDEX IF NOT EXISTS idx_ord_rec_kind_time ON t_p76735805_video_surveillance_s.ord_recognitions(kind, recognized_at DESC);
CREATE INDEX IF NOT EXISTS idx_ord_rec_plate ON t_p76735805_video_surveillance_s.ord_recognitions(plate);
CREATE INDEX IF NOT EXISTS idx_ord_rec_camera ON t_p76735805_video_surveillance_s.ord_recognitions(camera_id);