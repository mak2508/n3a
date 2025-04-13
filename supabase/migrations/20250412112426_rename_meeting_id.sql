-- Rename source_meeting_id to meeting_id in client_insights table
ALTER TABLE client_insights RENAME COLUMN source_meeting_id TO meeting_id; 