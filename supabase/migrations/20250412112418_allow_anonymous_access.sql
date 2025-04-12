-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users for meetings" ON meetings;
DROP POLICY IF EXISTS "Allow read access to all authenticated users for sentiment events" ON sentiment_events;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anonymous read access to meetings"
  ON meetings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow anonymous read access to sentiment events"
  ON sentiment_events
  FOR SELECT
  USING (true); 