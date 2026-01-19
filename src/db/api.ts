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
  RentPayment,
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

// Admin: Get all properties with owner details
export const getAllPropertiesForAdmin = async (): Promise<Property[]> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(username, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Admin: Verify property
export const verifyProperty = async (propertyId: string, adminId: string, notes?: string): Promise<void> => {
  const { error: updateError } = await supabase
    .from('properties')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: adminId,
    })
    .eq('id', propertyId);

  if (updateError) throw updateError;

  // Log verification
  const { error: logError } = await supabase
    .from('property_verifications')
    .insert({
      property_id: propertyId,
      admin_id: adminId,
      status: 'verified',
      notes: notes || null,
    });

  if (logError) throw logError;
};

// Admin: Reject property verification
export const rejectPropertyVerification = async (propertyId: string, adminId: string, notes: string): Promise<void> => {
  const { error: updateError } = await supabase
    .from('properties')
    .update({
      is_verified: false,
      verified_at: null,
      verified_by: null,
    })
    .eq('id', propertyId);

  if (updateError) throw updateError;

  // Log rejection
  const { error: logError } = await supabase
    .from('property_verifications')
    .insert({
      property_id: propertyId,
      admin_id: adminId,
      status: 'rejected',
      notes,
    });

  if (logError) throw logError;
};

// Check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.is_admin || false;
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

// Rent Payments API
export const getRentPayments = async (filters?: {
  propertyId?: string;
  tenantId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  let query = supabase
    .from('rent_payments')
    .select('*, tenant:tenants(*), room:rooms(*), property:properties(*)')
    .order('due_date', { ascending: false });
  
  if (filters?.propertyId) {
    query = query.eq('property_id', filters.propertyId);
  }
  if (filters?.tenantId) {
    query = query.eq('tenant_id', filters.tenantId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('due_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('due_date', filters.endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
};

export const getRentPaymentById = async (id: string) => {
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*, tenant:tenants(*), room:rooms(*), property:properties(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const createRentPayment = async (payment: Partial<RentPayment>) => {
  const { data, error } = await supabase
    .from('rent_payments')
    .insert([payment])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateRentPayment = async (id: string, updates: Partial<RentPayment>) => {
  const { data, error } = await supabase
    .from('rent_payments')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const deleteRentPayment = async (id: string) => {
  const { error } = await supabase.from('rent_payments').delete().eq('id', id);
  if (error) throw error;
};

export const markRentPaymentAsPaid = async (
  id: string,
  paymentDetails: {
    paid_date: string;
    payment_method?: string;
    transaction_id?: string;
    notes?: string;
  }
) => {
  const { data, error } = await supabase
    .from('rent_payments')
    .update({
      status: 'paid',
      ...paymentDetails,
    })
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const generateMonthlyRentPayment = async (tenantId: string) => {
  // Get tenant details
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*, room:rooms(*), property:properties(*)')
    .eq('id', tenantId)
    .maybeSingle();
  
  if (tenantError || !tenant) throw tenantError || new Error('Tenant not found');
  
  if (!tenant.move_in_date || !tenant.monthly_rent || !tenant.room_id) {
    throw new Error('Tenant missing required rent information');
  }
  
  // Calculate next due date
  const today = new Date();
  const rentDueDay = tenant.rent_due_day || 1;
  const nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, rentDueDay);
  
  // Check if payment already exists for this month
  const { data: existingPayment } = await supabase
    .from('rent_payments')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('due_date', nextDueDate.toISOString().split('T')[0])
    .maybeSingle();
  
  if (existingPayment) {
    return existingPayment;
  }
  
  // Create new rent payment
  const newPayment = {
    tenant_id: tenantId,
    room_id: tenant.room_id,
    property_id: tenant.property_id,
    amount: tenant.monthly_rent,
    due_date: nextDueDate.toISOString().split('T')[0],
    status: 'pending' as const,
  };
  
  return createRentPayment(newPayment);
};

export const getRentPaymentAnalytics = async (propertyId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('rent_payments')
    .select('*')
    .eq('property_id', propertyId);
  
  if (startDate) {
    query = query.gte('due_date', startDate);
  }
  if (endDate) {
    query = query.lte('due_date', endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  const payments = Array.isArray(data) ? data : [];
  
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.status === 'paid').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + Number(p.amount), 0);
  
  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  
  // Group by month for timeline
  const paymentsByMonth = payments.reduce((acc: Record<string, { paid: number; pending: number; overdue: number }>, payment) => {
    const month = payment.due_date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { paid: 0, pending: 0, overdue: 0 };
    }
    if (payment.status === 'paid') {
      acc[month].paid += Number(payment.amount);
    } else if (payment.status === 'pending') {
      acc[month].pending += Number(payment.amount);
    } else if (payment.status === 'overdue') {
      acc[month].overdue += Number(payment.amount);
    }
    return acc;
  }, {});
  
  return {
    totalPayments,
    paidPayments,
    pendingPayments,
    overduePayments,
    totalAmount,
    paidAmount,
    pendingAmount,
    overdueAmount,
    collectionRate,
    paymentsByMonth,
  };
};