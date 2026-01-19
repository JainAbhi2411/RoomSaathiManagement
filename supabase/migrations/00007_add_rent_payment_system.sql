
-- Add rent-related fields to rooms table
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10, 2) DEFAULT 0;

-- Add rent-related fields to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS move_in_date DATE,
ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS rent_due_day INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false;

-- Create rent_payments table
CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'partial'
  payment_method TEXT, -- 'cash', 'bank_transfer', 'upi', 'card', 'other'
  transaction_id TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant ON rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_property ON rent_payments(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_due_date ON rent_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON rent_payments(status);
CREATE INDEX IF NOT EXISTS idx_rent_payments_paid_date ON rent_payments(paid_date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rent_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS rent_payments_updated_at ON rent_payments;
CREATE TRIGGER rent_payments_updated_at
  BEFORE UPDATE ON rent_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_rent_payments_updated_at();

-- Add comments
COMMENT ON TABLE rent_payments IS 'Tracks monthly rent payments for tenants';
COMMENT ON COLUMN rent_payments.status IS 'Payment status: pending, paid, overdue, partial';
COMMENT ON COLUMN rent_payments.due_date IS 'Date when rent payment is due';
COMMENT ON COLUMN rent_payments.paid_date IS 'Date when rent was actually paid';
COMMENT ON COLUMN rent_payments.reminder_sent IS 'Whether payment reminder was sent via WhatsApp';
COMMENT ON COLUMN tenants.move_in_date IS 'Date when tenant moved into the property';
COMMENT ON COLUMN tenants.rent_due_day IS 'Day of month when rent is due (1-31)';
COMMENT ON COLUMN rooms.monthly_rent IS 'Monthly rent amount for this room';
