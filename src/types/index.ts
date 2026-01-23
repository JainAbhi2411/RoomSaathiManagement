export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole = 'owner' | 'admin';
export type PropertyType = 'pg' | 'hostel' | 'flat' | 'mess' | 'vacant_room';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type SharingType = 'single' | 'double' | 'triple' | 'quad' | 'dormitory';
export type BHKType = '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | '5BHK';
export type FurnishingStatus = 'fully_furnished' | 'semi_furnished' | 'unfurnished';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  property_type: PropertyType;
  description: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_rooms: number;
  amenities: string[] | null;
  images: string[] | null;
  videos: string[] | null;
  bhk_type: string | null;
  property_size: number | null;
  meal_plan: string | null;
  dormitory_capacity: number | null;
  number_of_floors: number;
  rooms_per_floor: number;
  food_included: boolean;
  is_verified?: boolean;
  verified_at?: string;
  verified_by?: string;
  synced_to_website?: boolean;
  website_property_id?: string;
  last_sync_at?: string;
  sync_error?: string;
  created_at: string;
  updated_at: string;
  owner?: {
    username: string | null;
    email: string | null;
    phone?: string | null;
  };
}

export interface PropertyVerification {
  id: string;
  property_id: string;
  admin_id: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertySyncLog {
  id: string;
  property_id: string;
  sync_status: 'pending' | 'success' | 'failed';
  website_property_id?: string;
  error_message?: string;
  synced_data?: any;
  created_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  floor: number | null;
  price: number;
  monthly_rent?: number;
  is_occupied: boolean;
  capacity: number;
  sharing_type: string | null;
  price_per_seat: number | null;
  occupied_seats: number;
  room_amenities: string[] | null;
  room_images: string[] | null;
  room_description: string | null;
  room_size: number | null;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  furnishing_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  property_id: string;
  room_id: string | null;
  full_name: string;
  email: string | null;
  phone: string;
  id_proof_type: string | null;
  id_proof_number: string | null;
  emergency_contact: string | null;
  move_in_date?: string | null;
  monthly_rent?: number;
  rent_due_day?: number;
  deposit_amount?: number;
  deposit_paid?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantDocument {
  id: string;
  tenant_id: string;
  document_type: 'aadhaar_front' | 'aadhaar_back' | 'booking_form' | 'photo' | 'other';
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RentPayment {
  id: string;
  tenant_id: string;
  room_id: string;
  property_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  property_id: string;
  room_id: string;
  tenant_id: string;
  check_in_date: string;
  check_out_date: string | null;
  status: BookingStatus;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: PaymentStatus;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  room_id: string | null;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  booking_id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number | null;
  terms: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithRooms extends Property {
  rooms?: Room[];
}

export interface BookingWithDetails extends Booking {
  tenant?: Tenant;
  room?: Room;
  property?: Property;
}

export interface PaymentWithDetails extends Payment {
  tenant?: Tenant;
  booking?: BookingWithDetails;
}

export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalTenants: number;
  pendingPayments: number;
  monthlyRevenue: number;
  occupancyRate: number;
}
