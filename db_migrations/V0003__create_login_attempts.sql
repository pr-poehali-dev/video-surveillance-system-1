CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.login_attempts (
  id SERIAL PRIMARY KEY,
  login VARCHAR(100) NOT NULL,
  ip_address VARCHAR(64) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_login_time ON t_p76735805_video_surveillance_s.login_attempts (login, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON t_p76735805_video_surveillance_s.login_attempts (ip_address, created_at);