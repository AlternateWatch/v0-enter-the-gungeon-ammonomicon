-- Add quote field to bosses and enemies tables
-- This allows storing the iconic phrase that appears below the name

ALTER TABLE bosses 
ADD COLUMN IF NOT EXISTS quote text;

ALTER TABLE enemies 
ADD COLUMN IF NOT EXISTS quote text;
