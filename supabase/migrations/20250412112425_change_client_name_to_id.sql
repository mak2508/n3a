-- Add client_id column
ALTER TABLE meetings ADD COLUMN client_id UUID REFERENCES clients(id);

-- Update existing meetings to set client_id based on client_name
UPDATE meetings m
SET client_id = c.id
FROM clients c
WHERE m.client_name = c.name;

-- Drop the old client_name column
ALTER TABLE meetings DROP COLUMN client_name; 