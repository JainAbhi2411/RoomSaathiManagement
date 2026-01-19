
-- Add WhatsApp fields to properties table
ALTER TABLE properties
ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN whatsapp_group_id TEXT,
ADD COLUMN whatsapp_group_invite_link TEXT,
ADD COLUMN owner_whatsapp_number TEXT,
ADD COLUMN welcome_message_template TEXT DEFAULT 'Welcome to {property_name}! We''re glad to have you as our tenant. Your room number is {room_number}. If you have any questions, feel free to reach out. 😊';

-- Create WhatsApp logs table
CREATE TABLE whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'group_created', 'tenant_added', 'welcome_sent', 'error'
  phone_number TEXT,
  message TEXT,
  status TEXT NOT NULL, -- 'pending', 'success', 'failed'
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_whatsapp_logs_property ON whatsapp_logs(property_id);
CREATE INDEX idx_whatsapp_logs_tenant ON whatsapp_logs(tenant_id);
CREATE INDEX idx_whatsapp_logs_created ON whatsapp_logs(created_at DESC);

COMMENT ON TABLE whatsapp_logs IS 'Logs all WhatsApp-related actions for properties';
COMMENT ON COLUMN properties.whatsapp_enabled IS 'Whether WhatsApp group management is enabled for this property';
COMMENT ON COLUMN properties.whatsapp_group_id IS 'WhatsApp group ID for this property';
COMMENT ON COLUMN properties.whatsapp_group_invite_link IS 'WhatsApp group invite link';
COMMENT ON COLUMN properties.owner_whatsapp_number IS 'Owner WhatsApp number with country code (e.g., +919876543210)';
