-- V3: Fix image data storage for large images
-- Drop the problematic index on image_data that causes the 8191 bytes limit error
DROP INDEX IF EXISTS idx_agents_image_data;

-- Change image_data column to use a more appropriate data type for large binary data
-- TEXT type in PostgreSQL can handle up to 1GB, but we don't want to index it directly
ALTER TABLE agents ALTER COLUMN image_data TYPE TEXT;

-- Create a partial index only on agents that have images, but only index a hash of the data
-- This allows us to quickly find agents with images without indexing the full content
CREATE INDEX idx_agents_has_image ON agents(id) WHERE image_data IS NOT NULL AND image_data != '';

-- Create an index on mime_type for efficient filtering by image type
CREATE INDEX idx_agents_mime_type ON agents(mime_type) WHERE mime_type IS NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN agents.image_data IS 'Base64 encoded image data. Can store up to 1GB. Not directly indexed due to size limitations.';
COMMENT ON COLUMN agents.mime_type IS 'MIME type of the stored image (e.g., image/jpeg, image/png)'; 