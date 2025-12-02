-- Создание таблицы для групп камер
CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.camera_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    camera_ids INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_camera_groups_name ON t_p76735805_video_surveillance_s.camera_groups(name);
CREATE INDEX idx_camera_groups_created_at ON t_p76735805_video_surveillance_s.camera_groups(created_at);

COMMENT ON TABLE t_p76735805_video_surveillance_s.camera_groups IS 'Группы камер для организации';
COMMENT ON COLUMN t_p76735805_video_surveillance_s.camera_groups.camera_ids IS 'Массив ID камер из таблицы cameras_registry';