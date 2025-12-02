-- Create user_groups table for hierarchical user group management
CREATE TABLE t_p76735805_video_surveillance_s.user_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES t_p76735805_video_surveillance_s.user_groups(id),
    user_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO t_p76735805_video_surveillance_s.user_groups (id, name, description, parent_id, user_count) VALUES
(1, 'МВД', 'Министерство внутренних дел', NULL, 5),
(2, 'Отдел мониторинга', 'Отдел круглосуточного мониторинга', 1, 3),
(3, 'Дежурная часть', 'Дежурная часть МВД', 1, 2),
(4, 'Администрация', 'Администрация Пермского края', NULL, 8),
(5, 'Отдел безопасности', 'Отдел по безопасности', 4, 4);

-- Update sequence to correct value
SELECT setval('t_p76735805_video_surveillance_s.user_groups_id_seq', (SELECT MAX(id) FROM t_p76735805_video_surveillance_s.user_groups));