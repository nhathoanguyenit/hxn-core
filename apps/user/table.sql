CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ROLES
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,          -- e.g. 'ADMIN', 'EDITOR'
    name VARCHAR(100) NOT NULL,                -- e.g. 'Administrator'
    description TEXT
);

-- PERMISSIONS
CREATE TABLE permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,         -- e.g. 'USER_CREATE', 'POST_DELETE'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- USER ↔ ROLE mapping (no FKs)
CREATE TABLE user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- ROLE ↔ PERMISSION mapping (no FKs)
CREATE TABLE role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

INSERT INTO roles (code, name, description)
VALUES
  ('ADMIN', 'Administrator', 'Has full system access'),
  ('AGENT', 'Agent', 'Handles operational tasks'),
  ('GUEST', 'Guest', 'Read-only access');

INSERT INTO users (username, fullname, password)
VALUES
  ('admin', 'System Admin', 'admin123'),
  ('agent', 'Support Agent', 'agent123'),
  ('guest', 'Guest User', 'guest123');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON (
  (u.username = 'admin'     AND r.code = 'ADMIN') OR
  (u.username = 'agent'     AND r.code = 'AGENT') OR
  (u.username = 'guest'     AND r.code = 'GUEST')
);

SELECT
  u.username,
  array_agg(r.code) AS roles
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
GROUP BY u.username;
