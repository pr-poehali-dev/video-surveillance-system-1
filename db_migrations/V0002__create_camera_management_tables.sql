-- Таблица моделей камер
CREATE TABLE IF NOT EXISTS camera_models (
    id SERIAL PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    description TEXT,
    default_rtsp_port INTEGER DEFAULT 554,
    default_ptz_port INTEGER DEFAULT 8000,
    supports_ptz BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manufacturer, model_name)
);

-- Таблица групп тегов
CREATE TABLE IF NOT EXISTS tag_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тегов
CREATE TABLE IF NOT EXISTS camera_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    tag_group_id INTEGER REFERENCES tag_groups(id),
    color VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица групп камер (с поддержкой иерархии)
CREATE TABLE IF NOT EXISTS camera_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    parent_group_id INTEGER REFERENCES camera_groups(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица камер видеонаблюдения
CREATE TABLE IF NOT EXISTS cameras_registry (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rtsp_url TEXT NOT NULL,
    rtsp_login VARCHAR(100),
    rtsp_password VARCHAR(100),
    
    model_id INTEGER REFERENCES camera_models(id),
    
    ptz_ip VARCHAR(45),
    ptz_port INTEGER,
    ptz_login VARCHAR(100),
    ptz_password VARCHAR(100),
    
    owner VARCHAR(100),
    
    local_ip VARCHAR(45),
    local_port INTEGER,
    
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    territorial_division VARCHAR(200),
    
    archive_depth_days INTEGER DEFAULT 30,
    
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связи камер и групп (многие ко многим)
CREATE TABLE IF NOT EXISTS camera_group_members (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER NOT NULL REFERENCES cameras_registry(id),
    group_id INTEGER NOT NULL REFERENCES camera_groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(camera_id, group_id)
);

-- Таблица связи камер и тегов (многие ко многим)
CREATE TABLE IF NOT EXISTS camera_tag_assignments (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER NOT NULL REFERENCES cameras_registry(id),
    tag_id INTEGER NOT NULL REFERENCES camera_tags(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(camera_id, tag_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_cameras_registry_owner ON cameras_registry(owner);
CREATE INDEX IF NOT EXISTS idx_cameras_registry_status ON cameras_registry(status);
CREATE INDEX IF NOT EXISTS idx_cameras_registry_territorial ON cameras_registry(territorial_division);
CREATE INDEX IF NOT EXISTS idx_cameras_registry_model ON cameras_registry(model_id);
CREATE INDEX IF NOT EXISTS idx_camera_tags_group ON camera_tags(tag_group_id);
CREATE INDEX IF NOT EXISTS idx_camera_groups_parent ON camera_groups(parent_group_id);

-- Вставляем начальные данные для моделей камер
INSERT INTO camera_models (manufacturer, model_name, description, supports_ptz) VALUES
('Hikvision', 'DS-2CD2143G0-I', 'IP-камера 4Мп с ИК-подсветкой до 30м', false),
('Dahua', 'IPC-HDBW4631R-ZS', 'IP-камера 6Мп с моторизированным объективом', true),
('Axis', 'P3375-V', 'Сетевая купольная камера с поддержкой PTZ', true),
('Hikvision', 'DS-2DE4425IW-DE', 'Скоростная поворотная IP-камера 4Мп', true)
ON CONFLICT (manufacturer, model_name) DO NOTHING;

-- Вставляем начальные данные для групп тегов
INSERT INTO tag_groups (name, description, color) VALUES
('Местоположение', 'Теги для категоризации по месту установки', '#3b82f6'),
('Назначение', 'Теги для обозначения целевого назначения', '#10b981'),
('Приоритет', 'Теги приоритетности камер', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Вставляем начальные данные для тегов
INSERT INTO camera_tags (name, tag_group_id, color, description) VALUES
('Улица', (SELECT id FROM tag_groups WHERE name = 'Местоположение'), '#3b82f6', 'Камера установлена на улице'),
('Помещение', (SELECT id FROM tag_groups WHERE name = 'Местоположение'), '#06b6d4', 'Камера установлена внутри помещения'),
('Парковка', (SELECT id FROM tag_groups WHERE name = 'Местоположение'), '#8b5cf6', 'Камера установлена на парковке'),
('Вход', (SELECT id FROM tag_groups WHERE name = 'Назначение'), '#10b981', 'Камера следит за входом'),
('Периметр', (SELECT id FROM tag_groups WHERE name = 'Назначение'), '#14b8a6', 'Камера следит за периметром'),
('Транспорт', (SELECT id FROM tag_groups WHERE name = 'Назначение'), '#84cc16', 'Камера следит за транспортом'),
('Высокий', (SELECT id FROM tag_groups WHERE name = 'Приоритет'), '#ef4444', 'Высокоприоритетная камера'),
('Средний', (SELECT id FROM tag_groups WHERE name = 'Приоритет'), '#f59e0b', 'Среднеприоритетная камера'),
('Низкий', (SELECT id FROM tag_groups WHERE name = 'Приоритет'), '#6b7280', 'Низкоприоритетная камера')
ON CONFLICT (name) DO NOTHING;

-- Вставляем начальные данные для групп камер
INSERT INTO camera_groups (name, description) VALUES
('Центральный район', 'Камеры в центральном районе города'),
('Ленинский район', 'Камеры в Ленинском районе'),
('Дзержинский район', 'Камеры в Дзержинском районе');

-- Вставляем пример камеры
INSERT INTO cameras_registry (
    name, rtsp_url, rtsp_login, rtsp_password,
    model_id, ptz_ip, ptz_port, ptz_login, ptz_password,
    owner, local_ip, local_port,
    address, latitude, longitude,
    territorial_division, archive_depth_days,
    description, status
) VALUES (
    'Камера-001',
    'rtsp://admin:pass@192.168.1.10:554/stream',
    'admin',
    'pass',
    (SELECT id FROM camera_models WHERE model_name = 'DS-2CD2143G0-I' LIMIT 1),
    '192.168.1.10',
    8000,
    'admin',
    'pass',
    'МВД',
    '192.168.1.10',
    554,
    'г. Пермь, ул. Ленина, 50',
    58.0105,
    56.2502,
    'Центральный район',
    30,
    'Основная камера на входе',
    'active'
);

-- Назначаем камере группу
INSERT INTO camera_group_members (camera_id, group_id)
SELECT 
    (SELECT id FROM cameras_registry WHERE name = 'Камера-001' LIMIT 1),
    (SELECT id FROM camera_groups WHERE name = 'Центральный район' LIMIT 1);

-- Назначаем камере теги
INSERT INTO camera_tag_assignments (camera_id, tag_id)
SELECT 
    (SELECT id FROM cameras_registry WHERE name = 'Камера-001' LIMIT 1),
    id 
FROM camera_tags 
WHERE name IN ('Улица', 'Вход', 'Высокий');