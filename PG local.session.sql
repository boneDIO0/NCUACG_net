BEGIN;

-- 大小寫不敏感字串型別（需要能 CREATE EXTENSION）
CREATE EXTENSION IF NOT EXISTS citext;

-- users
CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          CITEXT UNIQUE NOT NULL,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- credentials（One-to-One：user_id 唯一 + 外鍵）
CREATE TABLE IF NOT EXISTS credentials (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL UNIQUE
                  REFERENCES users(id) ON DELETE CASCADE,
  username      CITEXT UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  last_login    TIMESTAMPTZ NULL
);

-- 假資料（可重複執行）
INSERT INTO users (name, email) VALUES
  ('影蒙', 'ym@example.com'),
  ('夜閃', 'ys@example.com'),
  ('元風', 'yf@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO credentials (user_id, username, password_hash, last_login) VALUES
  ((SELECT id FROM users WHERE email = 'ym@example.com'), 'yingmeng', 'bcrypt:$2b$12$dummyhash1', NULL),
  ((SELECT id FROM users WHERE email = 'ys@example.com'), 'yeshan',   'bcrypt:$2b$12$dummyhash2', NOW()),
  ((SELECT id FROM users WHERE email = 'yf@example.com'), 'yuanfeng', 'bcrypt:$2b$12$dummyhash3', NULL)
ON CONFLICT (username) DO NOTHING;

COMMIT;