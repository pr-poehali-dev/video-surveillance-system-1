-- Создание таблицы территориальных делений
CREATE TABLE IF NOT EXISTS territorial_divisions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    camera_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по имени
CREATE INDEX idx_territorial_divisions_name ON territorial_divisions(name);

-- Вставка начальных данных
INSERT INTO territorial_divisions (name, camera_count) VALUES
    ('Центральный район', 245),
    ('Центр', 120),
    ('Окраина', 125),
    ('Ленинский район', 312),
    ('Северная часть', 180),
    ('Южная часть', 132),
    ('Дзержинский район', 198),
    ('Свердловский район', 267),
    ('Мотовилихинский район', 225);