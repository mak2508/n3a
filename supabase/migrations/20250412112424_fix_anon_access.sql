-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;

-- Grant all privileges on all tables to anon
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;

-- Grant future privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for anonymous users on clients" ON clients;
DROP POLICY IF EXISTS "Enable insert access for anonymous users on clients" ON clients;
DROP POLICY IF EXISTS "Enable update access for anonymous users on clients" ON clients;
DROP POLICY IF EXISTS "Enable delete access for anonymous users on clients" ON clients;

DROP POLICY IF EXISTS "Enable read access for anonymous users on meetings" ON meetings;
DROP POLICY IF EXISTS "Enable insert access for anonymous users on meetings" ON meetings;
DROP POLICY IF EXISTS "Enable update access for anonymous users on meetings" ON meetings;
DROP POLICY IF EXISTS "Enable delete access for anonymous users on meetings" ON meetings;

DROP POLICY IF EXISTS "Enable read access for anonymous users on sentiment_events" ON sentiment_events;
DROP POLICY IF EXISTS "Enable insert access for anonymous users on sentiment_events" ON sentiment_events;
DROP POLICY IF EXISTS "Enable update access for anonymous users on sentiment_events" ON sentiment_events;
DROP POLICY IF EXISTS "Enable delete access for anonymous users on sentiment_events" ON sentiment_events;

-- Create new policies with proper syntax
CREATE POLICY "anon_select_clients" ON clients FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_meetings" ON meetings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_meetings" ON meetings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_meetings" ON meetings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_meetings" ON meetings FOR DELETE TO anon USING (true);

CREATE POLICY "anon_select_sentiment_events" ON sentiment_events FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_sentiment_events" ON sentiment_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_sentiment_events" ON sentiment_events FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_sentiment_events" ON sentiment_events FOR DELETE TO anon USING (true);

-- Grant access to storage
GRANT USAGE ON SCHEMA storage TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO anon;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "anon_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "anon_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "anon_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "anon_storage_delete" ON storage.objects;

-- Create storage policies
CREATE POLICY "anon_storage_select" ON storage.objects FOR SELECT TO anon USING (true);
CREATE POLICY "anon_storage_insert" ON storage.objects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_storage_update" ON storage.objects FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_storage_delete" ON storage.objects FOR DELETE TO anon USING (true); 