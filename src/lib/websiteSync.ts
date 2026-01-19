import { createClient } from '@supabase/supabase-js';
import type { Property } from '@/types';

// Initialize main website Supabase client
const websiteSupabaseUrl = import.meta.env.VITE_WEBSITE_SUPABASE_URL;
const websiteSupabaseKey = import.meta.env.VITE_WEBSITE_SUPABASE_ANON_KEY;

let websiteSupabase: ReturnType<typeof createClient> | null = null;

// Check if website database credentials are configured
export const isWebsiteSyncConfigured = (): boolean => {
  return !!(websiteSupabaseUrl && websiteSupabaseKey);
};

// Get website Supabase client
const getWebsiteSupabase = () => {
  if (!isWebsiteSyncConfigured()) {
    throw new Error('Website database credentials not configured. Please set VITE_WEBSITE_SUPABASE_URL and VITE_WEBSITE_SUPABASE_ANON_KEY in .env file');
  }

  if (!websiteSupabase) {
    websiteSupabase = createClient(websiteSupabaseUrl, websiteSupabaseKey);
  }

  return websiteSupabase;
};

// Transform property data for website database
const transformPropertyForWebsite = (property: Property) => {
  return {
    // Map management DB fields to website DB fields
    name: property.name,
    property_type: property.property_type,
    description: property.description,
    address: property.address,
    city: property.city,
    state: property.state,
    pincode: property.pincode,
    total_rooms: property.total_rooms,
    amenities: property.amenities,
    images: property.images,
    videos: property.videos,
    bhk_type: property.bhk_type,
    property_size: property.property_size,
    meal_plan: property.meal_plan,
    dormitory_capacity: property.dormitory_capacity,
    number_of_floors: property.number_of_floors,
    rooms_per_floor: property.rooms_per_floor,
    food_included: property.food_included,
    is_verified: true, // Always true for synced properties
    verified_at: property.verified_at,
    // Add management software reference
    management_property_id: property.id,
    owner_name: property.owner?.username,
    owner_email: property.owner?.email,
    owner_phone: property.owner?.phone,
    // Status
    status: 'active',
    featured: false,
  };
};

// Sync property to main website database
export const syncPropertyToWebsite = async (property: Property): Promise<{ success: boolean; websitePropertyId?: string; error?: string }> => {
  try {
    if (!isWebsiteSyncConfigured()) {
      return {
        success: false,
        error: 'Website database not configured',
      };
    }

    const websiteClient = getWebsiteSupabase();
    const transformedData = transformPropertyForWebsite(property);

    // Check if property already exists in website database
    if (property.website_property_id) {
      // Update existing property
      const { data, error } = await websiteClient
        .from('properties')
        .update(transformedData)
        .eq('id', property.website_property_id)
        .select()
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        websitePropertyId: data?.id,
      };
    } else {
      // Insert new property
      const { data, error } = await websiteClient
        .from('properties')
        .insert(transformedData)
        .select()
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        websitePropertyId: data?.id,
      };
    }
  } catch (error) {
    console.error('Failed to sync property to website:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Remove property from website database
export const removePropertyFromWebsite = async (websitePropertyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isWebsiteSyncConfigured()) {
      return {
        success: false,
        error: 'Website database not configured',
      };
    }

    const websiteClient = getWebsiteSupabase();

    const { error } = await websiteClient
      .from('properties')
      .delete()
      .eq('id', websitePropertyId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to remove property from website:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test website database connection
export const testWebsiteConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isWebsiteSyncConfigured()) {
      return {
        success: false,
        error: 'Website database credentials not configured',
      };
    }

    const websiteClient = getWebsiteSupabase();

    // Try to query properties table
    const { error } = await websiteClient
      .from('properties')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to test website connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
