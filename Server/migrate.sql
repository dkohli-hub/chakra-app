-- Run this against the chakra database to add missing columns
-- psql -U postgres -d chakra -f migrate.sql

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS life_area VARCHAR(30);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ch INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS multitask BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS state_history JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS origin_bucket VARCHAR(30);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_timestamp TIMESTAMP;
