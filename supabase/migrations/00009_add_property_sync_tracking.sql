-- Add sync tracking fields to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS synced_to_website BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS website_property_id UUID;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS sync_error TEXT;

-- Create property sync log table
CREATE TABLE IF NOT EXISTS property_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'success', 'failed')),
  website_property_id UUID,
  error_message TEXT,
  synced_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sync logs
CREATE INDEX IF NOT EXISTS idx_property_sync_logs_property ON property_sync_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_property_sync_logs_status ON property_sync_logs(sync_status, created_at);
CREATE INDEX IF NOT EXISTS idx_properties_sync_status ON properties(synced_to_website, is_verified);

-- Enable RLS on property_sync_logs
ALTER TABLE property_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all sync logs
CREATE POLICY "Admins can view all sync logs"
  ON property_sync_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy: Admins can create sync logs
CREATE POLICY "Admins can create sync logs"
  ON property_sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

COMMENT ON COLUMN properties.synced_to_website IS 'Whether the property has been synced to main Roomsaathi website';
COMMENT ON COLUMN properties.website_property_id IS 'Property ID in the main website database';
COMMENT ON COLUMN properties.last_sync_at IS 'Timestamp of last successful sync';
COMMENT ON COLUMN properties.sync_error IS 'Last sync error message if any';
COMMENT ON TABLE property_sync_logs IS 'Log of property sync attempts to main website';