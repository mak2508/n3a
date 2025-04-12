-- Change sentiment column type to string
ALTER TABLE sentiment_events
ALTER COLUMN sentiment TYPE VARCHAR(50);

-- Update comment for the sentiment column
COMMENT ON COLUMN sentiment_events.sentiment IS 'The sentiment label (e.g., positive, negative, neutral)'; 