-- Enable anonymous access to all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_events ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Enable read access for anonymous users on clients"
ON clients FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable insert access for anonymous users on clients"
ON clients FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users on clients"
ON clients FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for anonymous users on clients"
ON clients FOR DELETE
TO anon
USING (true);

-- Meetings policies
CREATE POLICY "Enable read access for anonymous users on meetings"
ON meetings FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable insert access for anonymous users on meetings"
ON meetings FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users on meetings"
ON meetings FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for anonymous users on meetings"
ON meetings FOR DELETE
TO anon
USING (true);

-- Sentiment events policies
CREATE POLICY "Enable read access for anonymous users on sentiment_events"
ON sentiment_events FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable insert access for anonymous users on sentiment_events"
ON sentiment_events FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users on sentiment_events"
ON sentiment_events FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for anonymous users on sentiment_events"
ON sentiment_events FOR DELETE
TO anon
USING (true); 