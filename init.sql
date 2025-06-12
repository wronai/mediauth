-- Ultimate Upload System Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roles TEXT[] DEFAULT '{"user"}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100),
    size BIGINT,
    description TEXT,
    uploader_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejection_reason TEXT
);

-- Configuration table
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, roles)
VALUES ('admin@company.com', '$2b$10$rQZ8uJWHJ5JKJ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1', '{"admin","manager"}')
ON CONFLICT (email) DO NOTHING;

-- Insert default manager user (password: manager123)
INSERT INTO users (email, password_hash, roles)
VALUES ('manager@company.com', '$2b$10$rQZ8uJWHJ5JKJ1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1Q1', '{"manager"}')
ON CONFLICT (email) DO NOTHING;

-- Insert default email config
INSERT INTO config (key, value, updated_by)
VALUES ('email_config', '{"smtp_host":"smtp.gmail.com","smtp_port":587,"from_email":"noreply@company.com","from_name":"Upload System"}', 'system')
ON CONFLICT (key) DO NOTHING;
