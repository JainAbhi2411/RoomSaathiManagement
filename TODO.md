# Task: Website Sync Integration

## Plan

- [x] Step 1: Database Schema for Sync Tracking
  - [x] Add sync tracking fields to properties (synced_to_website, website_property_id, last_sync_at, sync_error)
  - [x] Create property_sync_logs table for audit trail
  - [x] Add RLS policies for admin access to sync logs
  - [x] Create indexes for sync queries

- [x] Step 2: Website Sync Service
  - [x] Create websiteSync.ts service module
  - [x] Implement syncPropertyToWebsite function
  - [x] Implement removePropertyFromWebsite function
  - [x] Implement testWebsiteConnection function
  - [x] Add data transformation logic (management DB → website DB)
  - [x] Handle environment variable configuration check

- [x] Step 3: TypeScript Types
  - [x] Add sync fields to Property interface
  - [x] Create PropertySyncLog interface
  - [x] Update API function signatures

- [x] Step 4: API Integration
  - [x] Update verifyProperty to trigger sync
  - [x] Create syncPropertyToWebsite API function
  - [x] Implement sync status tracking
  - [x] Add sync log creation
  - [x] Handle sync errors gracefully

- [x] Step 5: Admin Dashboard UI Updates
  - [x] Add "Website Sync" column to property table
  - [x] Show sync status badges (Synced/Failed/Pending)
  - [x] Add manual retry button for failed syncs
  - [x] Update verify button to show "Verify & Sync to Website"
  - [x] Add loading state during verification and sync
  - [x] Show sync progress toasts
  - [x] Import Globe, AlertTriangle, RefreshCw icons

- [x] Step 6: Environment Configuration
  - [x] Create .env.example with website database variables
  - [x] Add VITE_WEBSITE_SUPABASE_URL variable
  - [x] Add VITE_WEBSITE_SUPABASE_ANON_KEY variable
  - [x] Document configuration requirements

- [x] Step 7: Documentation
  - [x] Create SETUP_WEBSITE_SYNC.md guide
  - [x] Document sync flow and architecture
  - [x] Provide website database schema requirements
  - [x] Add troubleshooting section
  - [x] Include security considerations

- [ ] Step 8: Configuration & Testing (Manual)
  - [ ] Add website database credentials to .env file
  - [ ] Create properties table in website database
  - [ ] Set up RLS policies on website database
  - [ ] Test sync with a sample property
  - [ ] Verify property appears in website database
  - [ ] Test manual retry for failed syncs

- [ ] Step 9: Advanced Features (Future)
  - [ ] Bulk sync for multiple properties
  - [ ] Scheduled automatic sync
  - [ ] Bi-directional sync (website → management)
  - [ ] Webhook integration for real-time sync
  - [ ] Sync conflict resolution

## Notes

### Sync Flow
1. **Owner** lists property in management software
2. **Admin** reviews and verifies property
3. **System** automatically syncs verified property to website database
4. **Website** displays property to public users

### Key Features
- **Automatic Sync**: Triggered immediately on verification
- **Status Tracking**: Real-time sync status in admin dashboard
- **Error Handling**: Failed syncs don't block verification
- **Manual Retry**: Admins can retry failed syncs
- **Audit Trail**: All sync attempts logged in property_sync_logs
- **Data Transformation**: Automatic mapping between database schemas

### Sync Status Indicators
- **Synced** (Blue + Globe): Successfully synced to website
- **Failed** (Red + Alert): Sync failed, can retry
- **Pending** (Gray + Refresh): Verified but not synced
- **-** (Gray): Not verified yet

### Database Configuration
- **Management DB**: Current Supabase instance (already configured)
- **Website DB**: Separate Supabase instance (needs configuration)
- **Connection**: Uses separate Supabase client for website
- **Security**: Uses anon key with proper RLS policies

### Technical Implementation
- **Service Layer**: websiteSync.ts handles all sync operations
- **API Layer**: db/api.ts integrates sync with verification
- **UI Layer**: AdminDashboard shows sync status and controls
- **Error Handling**: Graceful degradation if website DB not configured
- **Logging**: Comprehensive sync logs for debugging

### Setup Requirements
1. Add website database credentials to .env
2. Create properties table in website database
3. Configure RLS policies for anon key access
4. Test connection before first sync

Core sync functionality COMPLETE: database tracking, sync service, API integration, UI indicators, documentation
