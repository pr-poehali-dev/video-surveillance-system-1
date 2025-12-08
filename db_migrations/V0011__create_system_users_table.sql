CREATE TABLE IF NOT EXISTS system_users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    login VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    user_group_id INTEGER,
    camera_group_id INTEGER,
    work_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    is_online BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_users_role_id ON system_users(role_id);
CREATE INDEX IF NOT EXISTS idx_system_users_user_group_id ON system_users(user_group_id);
CREATE INDEX IF NOT EXISTS idx_system_users_camera_group_id ON system_users(camera_group_id);
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_login ON system_users(login);
