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
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  floor: number | null;
  price: number;
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
