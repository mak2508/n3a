/*
  # Create meetings schema

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `date` (timestamptz)
      - `meeting_type` (text)
      - `description` (text)
      - `audio_url` (text, nullable)
      - `transcript` (text, nullable)
      - `summary` (text, nullable)
      - `sentiment` (integer, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `sentiment_events`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key)
      - `timestamp` (text)
      - `event` (text)
      - `sentiment` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all data
*/

CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  date timestamptz NOT NULL,
  meeting_type text NOT NULL,
  description text NOT NULL,
  audio_url text,
  transcript text,
  summary text,
  sentiment integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE sentiment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  timestamp text NOT NULL,
  event text NOT NULL,
  sentiment integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users for meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to all authenticated users for sentiment events"
  ON sentiment_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert mock data
INSERT INTO meetings (id, client_name, date, meeting_type, description, audio_url, sentiment, transcript, summary)
VALUES 
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'John Smith',
    '2024-03-15T10:00:00Z',
    'Retirement Planning',
    'Initial retirement planning discussion',
    'https://example.com/audio1.mp3',
    85,
    'This is a sample transcript...',
    'Client showed interest in long-term investment strategies...'
  ),
  (
    '7d793739-3167-4c36-8272-6c45e544c4eb',
    'Sarah Johnson',
    '2024-03-14T14:30:00Z',
    'Investment Review',
    'Quarterly portfolio review',
    'https://example.com/audio2.mp3',
    65,
    NULL,
    NULL
  ),
  (
    'b5f8c3e9-2c5a-4f3d-a7b8-9d0e1c2f3e4d',
    'Michael Brown',
    '2024-03-13T11:00:00Z',
    'Mortgage Consultation',
    'First-time homebuyer consultation',
    NULL,
    NULL,
    NULL,
    NULL
  );

INSERT INTO sentiment_events (meeting_id, timestamp, event, sentiment)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '10:05', 'Discussion of retirement goals', 90),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '10:15', 'Risk tolerance assessment', 75),
  ('7d793739-3167-4c36-8272-6c45e544c4eb', '14:35', 'Portfolio performance review', 60),
  ('7d793739-3167-4c36-8272-6c45e544c4eb', '14:50', 'Future investment strategy', 85);