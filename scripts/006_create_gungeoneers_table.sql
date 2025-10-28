-- Create gungeoneers (armazmorristas) table
CREATE TABLE IF NOT EXISTS gungeoneers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quote TEXT,
  starting_weapon TEXT,
  starting_items TEXT,
  armor INTEGER,
  health INTEGER,
  past TEXT,
  description TEXT,
  unlocked_by TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gungeoneers_updated_at
  BEFORE UPDATE ON gungeoneers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
