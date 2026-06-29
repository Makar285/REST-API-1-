-- CREATE DATABASE practika3;

-- CREATE TABLE users (
--   id BIGSERIAL PRIMARY KEY,
--   name VARCHAR(500) NOT NULL,
--   email TEXT UNIQUE NOT NULL,
--   password TEXT NOT NULL,
--   status VARCHAR(500) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE posts (
--   id BIGSERIAL PRIMARY KEY,
--   title VARCHAR(500) NOT NULL,
--   content TEXT NOT NULL,
--   image_url TEXT NOT NULL,
--   creator_user_id BIGINT REFERENCES users (id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ
-- );

-- INSERT INTO users (name, email, password, status)
-- VALUES
--   ('Makar Start', 'sp.makarik2010@gmail.com', '$2b$12$.em309oGVW9tjMnIisv8Xe5E56wYRWTxxXNTUe2fP1FxoCltaC2sS', 'I am new');

-- SELECT * FROM users;
-- SELECT * FROM posts;


INSERT INTO posts (title, content, image_url, creator_user_id, created_at)
VALUES
  ($1, $2, $3, $4, $5)
RETURNING id;