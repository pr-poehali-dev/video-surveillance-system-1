CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.cameras_registry (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rtsp_url VARCHAR(512) NOT NULL,
    rtsp_login VARCHAR(255),
    rtsp_password VARCHAR(255),
    model_id INTEGER,
    ptz_ip VARCHAR(50),
    ptz_port VARCHAR(10),
    ptz_login VARCHAR(255),
    ptz_password VARCHAR(255),
    owner VARCHAR(255),
    address VARCHAR(512),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    territorial_division VARCHAR(255),
    archive_depth_days INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cameras_owner ON t_p76735805_video_surveillance_s.cameras_registry(owner);
CREATE INDEX idx_cameras_division ON t_p76735805_video_surveillance_s.cameras_registry(territorial_division);
CREATE INDEX idx_cameras_name ON t_p76735805_video_surveillance_s.cameras_registry(name);