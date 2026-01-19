-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add verification fields to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_properties_verification ON properties(is_verified, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin);

-- Create admin verification log table
CREATE TABLE IF NOT EXISTS property_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for verification logs
CREATE INDEX IF NOT EXISTS idx_property_verifications_property ON property_verifications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_verifications_admin ON property_verifications(admin_id);

-- Enable RLS on property_verifications
ALTER TABLE property_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all verification logs" ON property_verifications;
DROP POLICY IF EXISTS "Admins can create verification logs" ON property_verifications;
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;
DROP POLICY IF EXISTS "Admins can update property verification" ON properties;

-- Policy: Admins can view all verification logs
CREATE POLICY "Admins can view all verification logs"
  ON property_verifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy: Admins can create verification logs
CREATE POLICY "Admins can create verification logs"
  ON property_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy: Admins can view all properties
CREATE POLICY "Admins can view all properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
    OR owner_id = auth.uid()
  );

-- Policy: Admins can update property verification
CREATE POLICY "Admins can update property verification"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

COMMENT ON COLUMN properties.is_verified IS 'Whether the property has been verified by Roomsaathi admin';
COMMENT ON COLUMN properties.verified_at IS 'Timestamp when the property was verified';
COMMENT ON COLUMN properties.verified_by IS 'Admin user who verified the property';
COMMENT ON TABLE property_verifications IS 'Log of property verification actions by admins';