-- Delete all existing entries
DELETE FROM sentiment_events;

-- Remove timestamp and event columns
ALTER TABLE sentiment_events
DROP COLUMN timestamp,
DROP COLUMN event;

-- Add start_index and end_index columns
ALTER TABLE sentiment_events
ADD COLUMN start_index INTEGER NOT NULL,
ADD COLUMN end_index INTEGER NOT NULL;

-- Add comments to the new columns
COMMENT ON COLUMN sentiment_events.start_index IS 'The starting character index of the sentiment event in the transcript';
COMMENT ON COLUMN sentiment_events.end_index IS 'The ending character index of the sentiment event in the transcript';
