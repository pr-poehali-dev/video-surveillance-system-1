CREATE TABLE t_p76735805_video_surveillance_s.cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'problem')),
    owner VARCHAR(255) NOT NULL,
    "group" VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    resolution VARCHAR(50) NOT NULL DEFAULT '1920x1080',
    fps INTEGER NOT NULL DEFAULT 25,
    traffic DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cameras_status ON t_p76735805_video_surveillance_s.cameras(status);
CREATE INDEX idx_cameras_owner ON t_p76735805_video_surveillance_s.cameras(owner);
CREATE INDEX idx_cameras_group ON t_p76735805_video_surveillance_s.cameras("group");
CREATE INDEX idx_cameras_location ON t_p76735805_video_surveillance_s.cameras(lat, lng);

INSERT INTO t_p76735805_video_surveillance_s.cameras (name, address, status, owner, "group", lat, lng, resolution, fps, traffic) VALUES
('Камера-001', 'г. Пермь, ул. Ленина, 50', 'active', 'МВД', 'Центр города', 58.010455, 56.229443, '1920x1080', 25, 4.2),
('Камера-002', 'г. Пермь, ул. Монастырская, 12', 'active', 'МВД', 'Центр города', 58.011455, 56.230443, '1920x1080', 25, 3.8),
('Камера-003', 'г. Пермь, ул. Сибирская, 27', 'problem', 'МВД', 'Центр города', 58.009455, 56.228443, '1280x720', 15, 2.1),
('Камера-004', 'г. Пермь, Комсомольский пр., 68', 'active', 'Администрация', 'Транспорт', 58.012455, 56.231443, '1920x1080', 30, 5.1),
('Камера-005', 'г. Пермь, ул. Петропавловская, 35', 'inactive', 'МВД', 'Центр города', 58.010955, 56.229943, '1920x1080', 0, 0),
('Камера-006', 'г. Пермь, ул. Куйбышева, 95', 'active', 'Администрация', 'Транспорт', 58.013455, 56.232443, '1920x1080', 25, 4.5);