-- Add floor-based room calculation and food inclusion fields to properties table
ALTER TABLE properties
ADD COLUMN number_of_floors INTEGER DEFAULT 1,
ADD COLUMN rooms_per_floor INTEGER DEFAULT 1,
ADD COLUMN food_included BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN properties.number_of_floors IS 'Total number of floors in the property';
COMMENT ON COLUMN properties.rooms_per_floor IS 'Number of rooms per floor';
COMMENT ON COLUMN properties.food_included IS 'Whether food/meals are included (mainly for PG properties)';
