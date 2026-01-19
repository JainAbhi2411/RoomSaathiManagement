-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Properties policies
CREATE POLICY "Admins have full access to properties" ON public.properties
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view their own properties" ON public.properties
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Owners can create properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own properties" ON public.properties
  FOR UPDATE TO authenticated USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own properties" ON public.properties
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Rooms policies
CREATE POLICY "Admins have full access to rooms" ON public.rooms
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view rooms of their properties" ON public.rooms
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = rooms.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can create rooms for their properties" ON public.rooms
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = rooms.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update rooms of their properties" ON public.rooms
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = rooms.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete rooms of their properties" ON public.rooms
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = rooms.property_id AND owner_id = auth.uid())
  );

-- Tenants policies
CREATE POLICY "Admins have full access to tenants" ON public.tenants
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view tenants of their properties" ON public.tenants
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = tenants.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can create tenants for their properties" ON public.tenants
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = tenants.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update tenants of their properties" ON public.tenants
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = tenants.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete tenants of their properties" ON public.tenants
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = tenants.property_id AND owner_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Admins have full access to bookings" ON public.bookings
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view bookings of their properties" ON public.bookings
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = bookings.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can create bookings for their properties" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = bookings.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update bookings of their properties" ON public.bookings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = bookings.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete bookings of their properties" ON public.bookings
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = bookings.property_id AND owner_id = auth.uid())
  );

-- Payments policies
CREATE POLICY "Admins have full access to payments" ON public.payments
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view payments of their properties" ON public.payments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = payments.booking_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create payments for their properties" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = payments.booking_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update payments of their properties" ON public.payments
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = payments.booking_id AND p.owner_id = auth.uid()
    )
  );

-- Maintenance requests policies
CREATE POLICY "Admins have full access to maintenance" ON public.maintenance_requests
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view maintenance of their properties" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = maintenance_requests.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can create maintenance for their properties" ON public.maintenance_requests
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = maintenance_requests.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update maintenance of their properties" ON public.maintenance_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = maintenance_requests.property_id AND owner_id = auth.uid())
  );

-- Contracts policies
CREATE POLICY "Admins have full access to contracts" ON public.contracts
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Owners can view contracts of their properties" ON public.contracts
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = contracts.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can create contracts for their properties" ON public.contracts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE id = contracts.property_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update contracts of their properties" ON public.contracts
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE id = contracts.property_id AND owner_id = auth.uid())
  );

-- Create public view for profiles
CREATE VIEW public.public_profiles AS
  SELECT id, username, full_name, role FROM profiles;