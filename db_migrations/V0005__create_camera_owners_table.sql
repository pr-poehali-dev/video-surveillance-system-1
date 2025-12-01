CREATE TABLE IF NOT EXISTS camera_owners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES camera_owners(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_camera_owners_parent_id ON camera_owners(parent_id);

INSERT INTO camera_owners (id, name, description, parent_id) VALUES
(1, 'МВД', 'Министерство внутренних дел', NULL),
(2, 'Администрация', 'Городская администрация', NULL),
(3, 'МЧС', 'Министерство по чрезвычайным ситуациям', NULL),
(4, 'Полиция', NULL, 1),
(5, 'ГИБДД', NULL, 1),
(6, 'Центральный район', NULL, 2),
(7, 'Ленинский район', NULL, 2);

SELECT setval('camera_owners_id_seq', (SELECT MAX(id) FROM camera_owners));
