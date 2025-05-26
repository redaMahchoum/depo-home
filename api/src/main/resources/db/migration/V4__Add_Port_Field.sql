-- V4: Add port field to agents table
-- Add port column to store the application port information
ALTER TABLE agents ADD COLUMN port VARCHAR(10);

-- Add a comment to document the new column
COMMENT ON COLUMN agents.port IS 'Port number where the agent application is running (e.g., 3000, 8080)'; 