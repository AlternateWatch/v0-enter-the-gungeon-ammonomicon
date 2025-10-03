-- Add missing fields to guns table
ALTER TABLE guns
ADD COLUMN IF NOT EXISTS dps TEXT,
ADD COLUMN IF NOT EXISTS class TEXT,
ADD COLUMN IF NOT EXISTS sell_price TEXT;
