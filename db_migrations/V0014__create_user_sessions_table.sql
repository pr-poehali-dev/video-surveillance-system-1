-- Создание таблицы для хранения активных сессий пользователей
CREATE TABLE IF NOT EXISTS t_p76735805_video_surveillance_s.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    current_route VARCHAR(255),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Индексы для быстрого поиска
CREATE INDEX idx_user_sessions_user_id ON t_p76735805_video_surveillance_s.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON t_p76735805_video_surveillance_s.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON t_p76735805_video_surveillance_s.user_sessions(expires_at);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE t_p76735805_video_surveillance_s.user_sessions IS 'Активные сессии пользователей системы';
COMMENT ON COLUMN t_p76735805_video_surveillance_s.user_sessions.session_token IS 'Уникальный токен сессии';
COMMENT ON COLUMN t_p76735805_video_surveillance_s.user_sessions.current_route IS 'Текущий раздел/маршрут пользователя';
COMMENT ON COLUMN t_p76735805_video_surveillance_s.user_sessions.last_activity IS 'Время последней активности';