-- Добавление поля parent_id для иерархической структуры
ALTER TABLE territorial_divisions ADD COLUMN IF NOT EXISTS parent_id INTEGER DEFAULT NULL;

-- Добавление поля color для визуального отображения
ALTER TABLE territorial_divisions ADD COLUMN IF NOT EXISTS color VARCHAR(50) DEFAULT 'bg-blue-500';

-- Создание индекса для parent_id
CREATE INDEX IF NOT EXISTS idx_territorial_divisions_parent_id ON territorial_divisions(parent_id);

-- Обновление существующих записей с цветами
UPDATE territorial_divisions SET color = 'bg-blue-500' WHERE name = 'Центральный район';
UPDATE territorial_divisions SET color = 'bg-green-500' WHERE name = 'Ленинский район';
UPDATE territorial_divisions SET color = 'bg-orange-500' WHERE name = 'Дзержинский район';
UPDATE territorial_divisions SET color = 'bg-purple-500' WHERE name = 'Свердловский район';
UPDATE territorial_divisions SET color = 'bg-red-500' WHERE name = 'Мотовилихинский район';
UPDATE territorial_divisions SET color = 'bg-blue-400' WHERE name = 'Центр';
UPDATE territorial_divisions SET color = 'bg-blue-300' WHERE name = 'Окраина';
UPDATE territorial_divisions SET color = 'bg-green-400' WHERE name = 'Северная часть';
UPDATE territorial_divisions SET color = 'bg-green-300' WHERE name = 'Южная часть';

-- Установка иерархии (parent_id) для существующих записей
UPDATE territorial_divisions SET parent_id = (SELECT id FROM territorial_divisions WHERE name = 'Центральный район' LIMIT 1) WHERE name = 'Центр';
UPDATE territorial_divisions SET parent_id = (SELECT id FROM territorial_divisions WHERE name = 'Центральный район' LIMIT 1) WHERE name = 'Окраина';
UPDATE territorial_divisions SET parent_id = (SELECT id FROM territorial_divisions WHERE name = 'Ленинский район' LIMIT 1) WHERE name = 'Северная часть';
UPDATE territorial_divisions SET parent_id = (SELECT id FROM territorial_divisions WHERE name = 'Ленинский район' LIMIT 1) WHERE name = 'Южная часть';