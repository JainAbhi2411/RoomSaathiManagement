import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CSVUpload from '@/components/csv/CSVUpload';
import { supabase } from '@/db/supabase';

const PROPERTY_TEMPLATE_HEADERS = [
  'name',
  'property_type',
  'description',
  'address',
  'city',
  'state',
  'pincode',
  'total_rooms',
  'amenities',
  'bhk_type',
  'property_size',
  'meal_plan',
  'dormitory_capacity',
  'number_of_floors',
  'rooms_per_floor',
  'food_included',
];

export default function PropertyCSVUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const validatePropertyRow = (row: any, index: number): string | null => {
    // Required fields
    if (!row.name || !row.name.trim()) {
      return 'Property name is required';
    }
    if (!row.property_type || !row.property_type.trim()) {
      return 'Property type is required';
    }
    if (!['pg', 'hostel', 'flat', 'mess', 'vacant_room'].includes(row.property_type.toLowerCase())) {
      return 'Property type must be one of: pg, hostel, flat, mess, vacant_room';
    }
    if (!row.address || !row.address.trim()) {
      return 'Address is required';
    }
    if (!row.city || !row.city.trim()) {
      return 'City is required';
    }
    if (!row.state || !row.state.trim()) {
      return 'State is required';
    }
    if (!row.pincode || !row.pincode.trim()) {
      return 'Pincode is required';
    }
    if (!row.total_rooms || isNaN(parseInt(row.total_rooms))) {
      return 'Total rooms must be a valid number';
    }

    // Validate numeric fields
    if (row.property_size && isNaN(parseFloat(row.property_size))) {
      return 'Property size must be a valid number';
    }
    if (row.dormitory_capacity && isNaN(parseInt(row.dormitory_capacity))) {
      return 'Dormitory capacity must be a valid number';
    }
    if (row.number_of_floors && isNaN(parseInt(row.number_of_floors))) {
      return 'Number of floors must be a valid number';
    }
    if (row.rooms_per_floor && isNaN(parseInt(row.rooms_per_floor))) {
      return 'Rooms per floor must be a valid number';
    }

    return null;
  };

  const handleUpload = async (data: any[]): Promise<{ success: boolean; errors?: string[] }> => {
    try {
      const properties = data.map((row) => ({
        owner_id: user!.id,
        name: row.name.trim(),
        property_type: row.property_type.toLowerCase(),
        description: row.description?.trim() || null,
        address: row.address.trim(),
        city: row.city.trim(),
        state: row.state.trim(),
        pincode: row.pincode.trim(),
        total_rooms: parseInt(row.total_rooms),
        amenities: Array.isArray(row.amenities) 
          ? row.amenities 
          : row.amenities?.split(';').map((a: string) => a.trim()).filter((a: string) => a) || null,
        bhk_type: row.bhk_type?.trim() || null,
        property_size: row.property_size ? parseFloat(row.property_size) : null,
        meal_plan: row.meal_plan?.trim() || null,
        dormitory_capacity: row.dormitory_capacity ? parseInt(row.dormitory_capacity) : null,
        number_of_floors: row.number_of_floors ? parseInt(row.number_of_floors) : 1,
        rooms_per_floor: row.rooms_per_floor ? parseInt(row.rooms_per_floor) : 1,
        food_included: row.food_included?.toLowerCase() === 'true',
        images: null,
        videos: null,
      }));

      const { error } = await supabase
        .from('properties')
        .insert(properties);

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
          <h1 className="text-2xl md:text-3xl font-bold">Bulk Upload Properties</h1>
          <p className="text-muted-foreground mt-1">
            Upload multiple properties at once using a CSV file
          </p>
        </div>
      </div>

      <CSVUpload
        title="Upload Properties CSV"
        description="Download the template, fill in your property data, and upload the CSV file to add multiple properties at once."
        templateHeaders={PROPERTY_TEMPLATE_HEADERS}
        templateFileName="properties_template.csv"
        onUpload={handleUpload}
        validateRow={validatePropertyRow}
      />

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">Field Descriptions:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium">name:</span> Property name (required)
          </div>
          <div>
            <span className="font-medium">property_type:</span> pg, hostel, flat, mess, or vacant_room (required)
          </div>
          <div>
            <span className="font-medium">description:</span> Property description (optional)
          </div>
          <div>
            <span className="font-medium">address:</span> Full address (required)
          </div>
          <div>
            <span className="font-medium">city:</span> City name (required)
          </div>
          <div>
            <span className="font-medium">state:</span> State name (required)
          </div>
          <div>
            <span className="font-medium">pincode:</span> Postal code (required)
          </div>
          <div>
            <span className="font-medium">total_rooms:</span> Number of rooms (required)
          </div>
          <div>
            <span className="font-medium">amenities:</span> Separate with semicolons (e.g., WiFi;Parking;AC)
          </div>
          <div>
            <span className="font-medium">bhk_type:</span> 1RK, 1BHK, 2BHK, etc. (optional)
          </div>
          <div>
            <span className="font-medium">property_size:</span> Size in sq ft (optional)
          </div>
          <div>
            <span className="font-medium">meal_plan:</span> Meal plan details (optional)
          </div>
          <div>
            <span className="font-medium">dormitory_capacity:</span> Capacity for dormitory (optional)
          </div>
          <div>
            <span className="font-medium">number_of_floors:</span> Number of floors (default: 1)
          </div>
          <div>
            <span className="font-medium">rooms_per_floor:</span> Rooms per floor (default: 1)
          </div>
          <div>
            <span className="font-medium">food_included:</span> true or false (default: false)
          </div>
        </div>
      </div>
    </div>
  );
}
