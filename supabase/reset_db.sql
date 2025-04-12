-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS sentiment_events CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS auth.users CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "Allow anonymous access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;

-- Reset the schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Clear migration history
DELETE FROM supabase_migrations.schema_migrations;