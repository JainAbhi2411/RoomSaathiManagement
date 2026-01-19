import { supabase } from './supabase';
import type {
  Property,
  Room,
  Tenant,
  Booking,
  Payment,
  MaintenanceRequest,
  Contract,
  PropertyWithRooms,
  DashboardStats,
} from '@/types';

// Properties API
export const getProperties = async (ownerId?: string) => {
  let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
  
  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getPropertyById = async (id: string): Promise<PropertyWithRooms | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*, rooms(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createProperty = async (property: Partial<Property>) => {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateProperty = async (id: string, updates: Partial<Property>) => {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteProperty = async (id: string) => {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
};

// Rooms API
export const getRoomsByProperty = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .order('room_number', { ascending: true });
  
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createRoom = async (room: Partial<Room>) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([room])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, updates: Partial<Room>) => {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string) => {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
};

// Tenants API
export const getTenants = async (propertyId?: string) => {
  let query = supabase.from('tenants').select('*').order('created_at', { ascending: false });
  
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getTenantById = async (id: string) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createTenant = async (tenant: Partial<Tenant>) => {
  const { data, error } = await supabase
    .from('tenants')
    .insert([tenant])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateTenant = async (id: string, updates: Partial<Tenant>) => {
  const { data, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteTenant = async (id: string) => {
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) throw error;
};

// Bookings API
export const getBookings = async (propertyId?: string) => {
  let query = supabase
    .from('bookings')
    .select('*, tenant:tenants(*), room:rooms(*), property:properties(*)')
    .order('created_at', { ascending: false });
  
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createBooking = async (booking: Partial<Booking>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateBooking = async (id: string, updates: Partial<Booking>) => {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Payments API
export const getPayments = async (bookingId?: string) => {
  let query = supabase
    .from('payments')
    .select('*, tenant:tenants(*), booking:bookings(*)')
    .order('due_date', { ascending: false });
  
  if (bookingId) {
    query = query.eq('booking_id', bookingId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createPayment = async (payment: Partial<Payment>) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updatePayment = async (id: string, updates: Partial<Payment>) => {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Maintenance Requests API
export const getMaintenanceRequests = async (propertyId?: string) => {
  let query = supabase
    .from('maintenance_requests')
    .select('*, property:properties(*), room:rooms(*)')
    .order('created_at', { ascending: false });
  
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createMaintenanceRequest = async (request: Partial<MaintenanceRequest>) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert([request])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateMaintenanceRequest = async (id: string, updates: Partial<MaintenanceRequest>) => {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Contracts API
export const getContracts = async (propertyId?: string) => {
  let query = supabase
    .from('contracts')
    .select('*, tenant:tenants(*), booking:bookings(*), property:properties(*)')
    .order('created_at', { ascending: false });
  
  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const createContract = async (contract: Partial<Contract>) => {
  const { data, error } = await supabase
    .from('contracts')
    .insert([contract])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateContract = async (id: string, updates: Partial<Contract>) => {
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Dashboard Stats API
export const getDashboardStats = async (ownerId: string): Promise<DashboardStats> => {
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', ownerId);
  
  const propertyIds = properties?.map(p => p.id) || [];
  
  const { data: rooms } = await supabase
    .from('rooms')
    .select('is_occupied')
    .in('property_id', propertyIds);
  
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id')
    .in('property_id', propertyIds);
  
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, payment_date')
    .eq('status', 'pending');
  
  const totalRooms = rooms?.length || 0;
  const occupiedRooms = rooms?.filter(r => r.is_occupied).length || 0;
  const vacantRooms = totalRooms - occupiedRooms;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'paid')
    .gte('payment_date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);
  
  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  
  return {
    totalProperties: properties?.length || 0,
    totalRooms,
    occupiedRooms,
    vacantRooms,
    totalTenants: tenants?.length || 0,
    pendingPayments: payments?.length || 0,
    monthlyRevenue,
    occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
  };
};