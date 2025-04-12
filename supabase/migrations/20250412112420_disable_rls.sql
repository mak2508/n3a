-- Disable Row Level Security on all tables
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_insights DISABLE ROW LEVEL SECURITY;

-- Add a comment to the migration
COMMENT ON TABLE meetings IS 'RLS disabled for all operations';
COMMENT ON TABLE sentiment_events IS 'RLS disabled for all operations';
COMMENT ON TABLE clients IS 'RLS disabled for all operations';
COMMENT ON TABLE client_insights IS 'RLS disabled for all operations'; 