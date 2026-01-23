import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CSVUpload from '@/components/csv/CSVUpload';
import { getProperties } from '@/db/api';
import { supabase } from '@/db/supabase';
import type { Property } from '@/types';

const ROOM_TEMPLATE_HEADERS = [
  'room_number',
  'floor',
  'price',
  'monthly_rent',
  'capacity',
  'sharing_type',
  'price_per_seat',
  'room_amenities',
  'room_description',
  'room_size',
  'has_attached_bathroom',
  'has_balcony',
  'furnishing_status',
];

export default function RoomCSVUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;
    try {
      const data = await getProperties(user.id);
      setProperties(data);
      if (data.length > 0) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateRoomRow = (row: any, index: number): string | null => {
    // Required fields
    if (!row.room_number || !row.room_number.trim()) {
      return 'Room number is required';
    }
    if (!row.price || isNaN(parseFloat(row.price))) {
      return 'Price must be a valid number';
    }
    if (!row.capacity || isNaN(parseInt(row.capacity))) {
      return 'Capacity must be a valid number';
    }

    // Validate numeric fields
    if (row.floor && isNaN(parseInt(row.floor))) {
      return 'Floor must be a valid number';
    }
    if (row.monthly_rent && isNaN(parseFloat(row.monthly_rent))) {
      return 'Monthly rent must be a valid number';
    }
    if (row.price_per_seat && isNaN(parseFloat(row.price_per_seat))) {
      return 'Price per seat must be a valid number';
    }
    if (row.room_size && isNaN(parseFloat(row.room_size))) {
      return 'Room size must be a valid number';
    }

    // Validate sharing type
    if (row.sharing_type && !['single', 'double', 'triple', 'quad', 'dormitory'].includes(row.sharing_type.toLowerCase())) {
      return 'Sharing type must be one of: single, double, triple, quad, dormitory';
    }

    // Validate furnishing status
    if (row.furnishing_status && !['fully_furnished', 'semi_furnished', 'unfurnished'].includes(row.furnishing_status.toLowerCase())) {
      return 'Furnishing status must be one of: fully_furnished, semi_furnished, unfurnished';
    }

    return null;
  };

  const handleUpload = async (data: any[]): Promise<{ success: boolean; errors?: string[] }> => {
    if (!selectedPropertyId) {
      return {
        success: false,
        errors: ['Please select a property first'],
      };
    }

    try {
      const rooms = data.map((row) => ({
        property_id: selectedPropertyId,
        room_number: row.room_number.trim(),
        floor: row.floor ? parseInt(row.floor) : null,
        price: parseFloat(row.price),
        monthly_rent: row.monthly_rent ? parseFloat(row.monthly_rent) : null,
        is_occupied: false,
        capacity: parseInt(row.capacity),
        sharing_type: row.sharing_type?.toLowerCase() || null,
        price_per_seat: row.price_per_seat ? parseFloat(row.price_per_seat) : null,
        occupied_seats: 0,
        room_amenities: Array.isArray(row.room_amenities)
          ? row.room_amenities
          : row.room_amenities?.split(';').map((a: string) => a.trim()).filter((a: string) => a) || null,
        room_images: null,
        room_description: row.room_description?.trim() || null,
        room_size: row.room_size ? parseFloat(row.room_size) : null,
        has_attached_bathroom: row.has_attached_bathroom?.toLowerCase() === 'true',
        has_balcony: row.has_balcony?.toLowerCase() === 'true',
        furnishing_status: row.furnishing_status?.toLowerCase() || null,
      }));

      const { error } = await supabase
        .from('rooms')
        .insert(rooms);

      if (error) {
        console.error('Insert error:', error);
        return {
          success: false,
          errors: [error.message],
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        errors: ['An unexpected error occurred during upload'],
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/properties')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bulk Upload Rooms</h1>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You need to create at least one property before uploading rooms.
          </p>
          <Button onClick={() => navigate('/properties/new')}>
            Create Property
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/properties')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bulk Upload Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Upload multiple rooms at once using a CSV file
          </p>
        </div>
      </div>

      {/* Property Selection */}
      <div className="bg-card p-6 rounded-lg border">
        <Label htmlFor="property-select" className="text-base font-semibold mb-2 block">
          Select Property
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the property where you want to add rooms
        </p>
        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger id="property-select" className="w-full md:w-96">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name} - {property.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CSVUpload
        title="Upload Rooms CSV"
        description="Download the template, fill in your room data, and upload the CSV file to add multiple rooms at once."
        templateHeaders={ROOM_TEMPLATE_HEADERS}
        templateFileName="rooms_template.csv"
        onUpload={handleUpload}
        validateRow={validateRoomRow}
      />

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">Field Descriptions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium">room_number:</span> Room number/identifier (required)
          </div>
          <div>
            <span className="font-medium">floor:</span> Floor number (optional)
          </div>
          <div>
            <span className="font-medium">price:</span> Room price (required)
          </div>
          <div>
            <span className="font-medium">monthly_rent:</span> Monthly rent amount (optional)
          </div>
          <div>
            <span className="font-medium">capacity:</span> Maximum occupancy (required)
          </div>
          <div>
            <span className="font-medium">sharing_type:</span> single, double, triple, quad, or dormitory (optional)
          </div>
          <div>
            <span className="font-medium">price_per_seat:</span> Price per person (optional)
          </div>
          <div>
            <span className="font-medium">room_amenities:</span> Separate with semicolons (e.g., AC;TV;Wardrobe)
          </div>
          <div>
            <span className="font-medium">room_description:</span> Room description (optional)
          </div>
          <div>
            <span className="font-medium">room_size:</span> Size in sq ft (optional)
          </div>
          <div>
            <span className="font-medium">has_attached_bathroom:</span> true or false (default: false)
          </div>
          <div>
            <span className="font-medium">has_balcony:</span> true or false (default: false)
          </div>
          <div>
            <span className="font-medium">furnishing_status:</span> fully_furnished, semi_furnished, or unfurnished (optional)
          </div>
        </div>
      </div>
    </div>
  );
}
