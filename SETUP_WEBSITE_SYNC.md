# Website Sync Setup Guide

This guide explains how to connect the Property Management Software with the main Roomsaathi website database.

## Overview

The system implements a **one-way sync** from the management software to the main website:

```
Owner Lists Property → Admin Verifies → Auto-Sync to Website Database
```

## Setup Steps

### 1. Configure Environment Variables

Add the main website database credentials to your `.env` file:

```env
# Management Software Database (Current - Already configured)
VITE_SUPABASE_URL=your_management_supabase_url
VITE_SUPABASE_ANON_KEY=your_management_supabase_anon_key

# Main Roomsaathi Website Database (Add these)
VITE_WEBSITE_SUPABASE_URL=https://your-website-project.supabase.co
VITE_WEBSITE_SUPABASE_ANON_KEY=your_website_anon_key
```

### 2. Website Database Schema Requirements

The main Roomsaathi website database must have a `properties` table with these columns:

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  name TEXT NOT NULL,
  property_type TEXT NOT NULL,
  description TEXT,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  
  -- Property Details
  total_rooms INTEGER NOT NULL,
  number_of_floors INTEGER NOT NULL,
  rooms_per_floor INTEGER NOT NULL,
  
  -- Additional Details
  amenities TEXT[],
  images TEXT[],
  videos TEXT[],
  bhk_type TEXT,
  property_size NUMERIC,
  meal_plan TEXT,
  dormitory_capacity INTEGER,
  food_included BOOLEAN DEFAULT FALSE,
  
  -- Verification
  is_verified BOOLEAN DEFAULT TRUE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Management Software Reference
  management_property_id UUID,
  
  -- Owner Information
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  
  -- Status
  status TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for management property reference
CREATE INDEX idx_properties_management_id ON properties(management_property_id);
```

### 3. How It Works

#### Automatic Sync on Verification

When an admin verifies a property:

1. **Verification**: Property is marked as verified in management database
2. **Auto-Sync**: System automatically syncs to website database
3. **Status Update**: Sync status is tracked in management database
4. **Notifications**: Admin sees success/failure toasts

#### Sync Status Indicators

In the Admin Dashboard, each property shows:

- **Synced** (Blue badge with Globe icon): Successfully synced to website
- **Failed** (Red badge with Alert icon): Sync failed, can retry
- **Pending** (Gray badge with Refresh icon): Verified but not yet synced
- **-** (Gray badge): Not verified, no sync attempted

#### Manual Retry

If sync fails, admins can:

1. Click the **Refresh icon** button next to the property
2. System will retry the sync
3. Status updates automatically

### 4. Data Transformation

The sync process automatically transforms data:

**From Management DB** → **To Website DB**:
- All property details are copied
- Owner information is included (name, email, phone)
- `is_verified` is always set to `true`
- `management_property_id` stores reference to original property
- `status` is set to `active`

### 5. Sync Logs

All sync attempts are logged in `property_sync_logs` table:

```sql
-- View sync history for a property
SELECT * FROM property_sync_logs 
WHERE property_id = 'property-uuid'
ORDER BY created_at DESC;
```

### 6. Testing the Connection

To test if website database is configured correctly:

1. Set environment variables in `.env`
2. Restart the application
3. Login as admin
4. Verify a property
5. Check for sync success/failure messages

### 7. Troubleshooting

#### "Website database not configured" error

**Solution**: Add `VITE_WEBSITE_SUPABASE_URL` and `VITE_WEBSITE_SUPABASE_ANON_KEY` to `.env` file

#### Sync fails with "Table not found" error

**Solution**: Create `properties` table in website database using schema above

#### Sync fails with "Permission denied" error

**Solution**: Check RLS policies on website database. The anon key must have INSERT/UPDATE permissions on `properties` table

#### Properties not appearing on website

**Solution**: 
1. Check `synced_to_website` field in management database
2. Check `property_sync_logs` for error messages
3. Verify website database has the property record
4. Check website application is reading from correct database

### 8. Security Considerations

- **Anon Key**: Use Supabase anon key (not service role key) for website database
- **RLS Policies**: Ensure website database has proper RLS policies
- **Data Validation**: Sync function validates all required fields
- **Error Handling**: Failed syncs don't block verification process

### 9. Future Enhancements

Potential improvements:

- **Bi-directional Sync**: Sync updates from website back to management software
- **Bulk Sync**: Sync multiple properties at once
- **Scheduled Sync**: Automatic periodic sync of all verified properties
- **Webhook Integration**: Real-time sync using Supabase webhooks
- **Conflict Resolution**: Handle cases where property exists in both databases

## Support

For issues or questions:
1. Check sync logs in `property_sync_logs` table
2. Verify environment variables are set correctly
3. Test database connection using admin dashboard
4. Check Supabase logs for both databases
