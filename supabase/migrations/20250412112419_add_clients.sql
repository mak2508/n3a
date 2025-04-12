/*
  # Create clients schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `date_of_birth` (date)
      - `profession` (text)
      - `relationship_type` (text) - e.g., 'Premium', 'Standard', 'Business'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `client_insights`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `category` (text) - e.g., 'Family', 'Hobbies', 'Goals', 'Preferences'
      - `insight` (text)
      - `source_meeting_id` (uuid, foreign key, nullable) - reference to meeting where insight was gained
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
*/

-- Create clients table
CREATE TABLE clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text,
    date_of_birth date,
    profession text,
    relationship_type text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create client_insights table
CREATE TABLE client_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    category text NOT NULL,
    insight text NOT NULL,
    source_meeting_id uuid REFERENCES meetings(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users for clients"
    ON clients
    FOR SELECT
    USING (true);

CREATE POLICY "Allow read access to all authenticated users for client insights"
    ON client_insights
    FOR SELECT
    USING (true);

-- Insert mock data
INSERT INTO clients (id, name, email, phone, date_of_birth, profession, relationship_type) VALUES
    (
        'c47ac10b-58cc-4372-a567-0e02b2c3d479',
        'John Smith',
        'john.smith@email.com',
        '+1-555-0123',
        '1975-06-15',
        'Software Engineer',
        'Premium'
    ),
    (
        '7d793739-3167-4c36-8272-6c45e544c4eb',
        'Sarah Johnson',
        'sarah.j@email.com',
        '+1-555-0124',
        '1982-03-22',
        'Business Owner',
        'Business'
    ),
    (
        'b5f8c3e9-2c5a-4f3d-a7b8-9d0e1c2f3e4d',
        'Michael Brown',
        'michael.b@email.com',
        '+1-555-0125',
        '1990-11-08',
        'Doctor',
        'Standard'
    );

-- Insert mock insights
INSERT INTO client_insights (client_id, category, insight, source_meeting_id) VALUES
    (
        'c47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Family',
        'Has two children in college, planning for their graduate studies',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    ),
    (
        'c47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Hobbies',
        'Passionate about golf and photography',
        NULL
    ),
    (
        'c47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Goals',
        'Planning to retire in 5 years, interested in passive income investments',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    ),
    (
        '7d793739-3167-4c36-8272-6c45e544c4eb',
        'Business',
        'Owns a successful chain of organic food stores, looking to expand to new locations',
        '7d793739-3167-4c36-8272-6c45e544c4eb'
    ),
    (
        '7d793739-3167-4c36-8272-6c45e544c4eb',
        'Family',
        'Recently married, spouse is a marketing executive',
        NULL
    ),
    (
        'b5f8c3e9-2c5a-4f3d-a7b8-9d0e1c2f3e4d',
        'Career',
        'Chief of Pediatrics at City Hospital, interested in medical real estate investments',
        'b5f8c3e9-2c5a-4f3d-a7b8-9d0e1c2f3e4d'
    ),
    (
        'b5f8c3e9-2c5a-4f3d-a7b8-9d0e1c2f3e4d',
        'Hobbies',
        'Enjoys sailing and has a small yacht',
        NULL
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_insights_updated_at
    BEFORE UPDATE ON client_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 