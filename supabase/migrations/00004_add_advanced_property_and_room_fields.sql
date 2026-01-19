
-- Add property-specific fields to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS bhk_type TEXT,
ADD COLUMN IF NOT EXISTS property_size NUMERIC,
ADD COLUMN IF NOT EXISTS meal_plan TEXT,
ADD COLUMN IF NOT EXISTS dormitory_capacity INTEGER;

-- Add advanced fields to rooms table
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS sharing_type TEXT,
ADD COLUMN IF NOT EXISTS price_per_seat NUMERIC,
ADD COLUMN IF NOT EXISTS occupied_seats INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS room_amenities TEXT[],
ADD COLUMN IF NOT EXISTS room_images TEXT[],
ADD COLUMN IF NOT EXISTS room_description TEXT,
ADD COLUMN IF NOT EXISTS room_size NUMERIC,
ADD COLUMN IF NOT EXISTS has_attached_bathroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_balcony BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS furnishing_status TEXT;

-- Add comments for documentation
COMMENT ON COLUMN properties.bhk_type IS 'For flats/apartments: 1BHK, 2BHK, 3BHK, etc.';
COMMENT ON COLUMN properties.property_size IS 'Property size in square feet';
COMMENT ON COLUMN properties.meal_plan IS 'For mess: breakfast, lunch, dinner, all meals';
COMMENT ON COLUMN properties.dormitory_capacity IS 'For hostels: total dormitory capacity';

COMMENT ON COLUMN rooms.sharing_type IS 'For PG/Hostel: single, double, triple, quad, dormitory';
COMMENT ON COLUMN rooms.price_per_seat IS 'Price per seat for shared rooms';
COMMENT ON COLUMN rooms.occupied_seats IS 'Number of currently occupied seats in shared room';
COMMENT ON COLUMN rooms.room_amenities IS 'Room-specific amenities';
COMMENT ON COLUMN rooms.room_images IS 'Array of image URLs for this specific room';
COMMENT ON COLUMN rooms.room_description IS 'Detailed description of the room';
COMMENT ON COLUMN rooms.room_size IS 'Room size in square feet';
