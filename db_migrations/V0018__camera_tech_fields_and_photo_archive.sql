ALTER TABLE t_p76735805_video_surveillance_s.cameras_registry
  ADD COLUMN IF NOT EXISTS resolution VARCHAR(20),
  ADD COLUMN IF NOT EXISTS fps INTEGER,
  ADD COLUMN IF NOT EXISTS traffic NUMERIC(8,2);

CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.photo_archive_tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cameras TEXT[] NOT NULL DEFAULT '{}',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  interval_seconds INTEGER NOT NULL DEFAULT 300,
  daily_hour INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.photo_archive_screenshots (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES t_p76735805_video_surveillance_s.photo_archive_tasks(id),
  camera_name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  taken_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photo_screenshots_task ON t_p76735805_video_surveillance_s.photo_archive_screenshots(task_id);