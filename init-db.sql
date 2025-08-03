-- Initialize database for Cron Task Management System

-- Create database user if not exists (for development)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cronuser') THEN
        CREATE ROLE cronuser WITH LOGIN PASSWORD 'cronpass123';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE cronmanager TO cronuser;
GRANT ALL ON SCHEMA public TO cronuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cronuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cronuser;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create function to generate UUIDs (for older PostgreSQL versions)
CREATE OR REPLACE FUNCTION gen_random_uuid() RETURNS uuid AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- Initial system user for API access
INSERT INTO users (id, username, password) 
VALUES (
    gen_random_uuid(),
    'admin',
    crypt('admin123', gen_salt('bf'))
) ON CONFLICT (username) DO NOTHING;

-- Insert some sample data for demonstration
INSERT INTO activity_logs (id, task_id, type, message, details, created_at)
VALUES (
    gen_random_uuid(),
    NULL,
    'system_startup',
    'Sistema inicializado com sucesso',
    '{"version": "1.0.0", "environment": "docker"}',
    NOW()
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cron_tasks_status ON cron_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cron_tasks_next_run ON cron_tasks(next_run);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);

-- Update statistics
ANALYZE;