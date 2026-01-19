# Property Management Software Requirements Document

## 1. Application Overview

### 1.1 Application Name
Property Management Pro

### 1.2 Application Description
A professional management software designed for property owners of PG, hostels, flats, mess, and vacant rental spaces in India. The platform enables owners to create accounts, list properties with comprehensive information, and manage all property-related tasks including real-time room booking, vacancy tracking, and analytics. The application features a professional theme with a modern color scheme and an advanced step-by-step property listing process with property-type-specific information collection, detailed room management capabilities, and a highly visual cinema-style occupancy dashboard that displays floor layouts, room arrangements, and individual seat/bed occupancy status. Additionally, the system includes automated WhatsApp group management for seamless tenant communication and onboarding.\n
## 2. Core Features

### 2.1 Owner Account Management
- Owner registration and login\n- Profile management\n- Account settings
\n### 2.2 Advanced Property Listing Management
- Multi-step property listing process:\n  - **Step 1: Basic Information**
    - Property type selection (PG, hostel, flat, mess, vacant room space)
    - Property name\n    - Property description
  - **Step 2: Property Type Specific Details**
    - **For Flat/Apartment:**
      - Configuration type (1 BHK, 2 BHK, 3 BHK, 4 BHK, 5+ BHK)
      - Number of bathrooms
      - Number of balconies
      - Furnishing status (Fully Furnished, Semi-Furnished, Unfurnished)
      - Availability type (Entire flat, Shared flat)\n    - **For PG/Hostel:**
      - Total capacity (number of beds)
      - Room sharing types available (Single, Double, Triple, Four sharing, Dormitory)
      - Gender accommodation (Boys, Girls, Co-ed)
      - Meal plans available (Breakfast, Lunch, Dinner, All meals, No meals)
      - Food included (Yes/No)
    - **For Mess:**
      - Seating capacity
      - Meal types offered (Breakfast, Lunch, Dinner, Snacks)\n      - Food type (Veg, Non-veg, Both)
      - Meal plan options (Monthly, Daily)\n    - **For Vacant Room Space:**
      - Room size (in sq ft)
      - Intended use (Residential, Commercial, Storage)
      - Sharing type (Single, Shared)\n  - **Step 3: Location Details**
    - State selection (dropdown with all Indian states)\n    - City selection (dropdown dynamically populated based on selected state)
    - Complete address\n    - Pincode
    - Landmark
  - **Step 4: Property Specifications**
    - Property size (in sq ft)
    - Total number of floors in property
    - Floor-wise room distribution:\n      - Floor number
      - Number of rooms on each floor
      - System auto-calculates total rooms across all floors
    - Age of property\n    - Facing direction
  - **Step 5: Pricing Details**
    - **For Flat/Apartment:**\n      - Monthly rent
      - Security deposit amount
      - Maintenance charges
      - Brokerage (if applicable)
    - **For PG/Hostel:**\n      - Rent structure per sharing type (to be defined during room addition)
      - Security deposit amount
      - Maintenance charges (included/separate)
      - Meal charges (if applicable)
    - **For Mess:**
      - Monthly meal plan charges
      - Daily meal charges
      - Security deposit\n    - **For Vacant Room Space:**
      - Monthly rent
      - Security deposit
    - Electricity charges (included/separate)
    - Water charges (included/separate)
    - Other charges\n  - **Step 6: Amenities**
    - Checkboxes for amenities selection:\n      - WiFi
      - Air Conditioning
      - Parking\n      - Power Backup
      - Laundry Service
      - Housekeeping
      - Security/CCTV
      - Lift
      - Water Purifier
      - Refrigerator
      - Microwave
      - TV
      - Washing Machine
      - Gym
      - Common Area
      - Attached Bathroom
      - Balcony
      - Furnished
      - Semi-Furnished
      - Meals Included
      - 24/7 Water Supply
      - Geyser
      - Cupboard
      - Study Table
      - Bed
  - **Step 7: Rules and Preferences**
    - Gender preference (Male/Female/Any)
    - Food preference (Veg/Non-veg/Both)
    - Smoking allowed (Yes/No)
    - Drinking allowed (Yes/No)
    - Pets allowed (Yes/No)
    - Visitor policy
    - Gate closing time
    - Notice period for vacating
  - **Step 8: Owner Contact Information**
    - Owner name
    - Contact number
    - Alternate contact number
    - Email address\n    - Preferred contact time
  - **Step 9: Media Upload**
    - Property exterior images upload (multiple)
    - Property common area images upload (multiple)
    - Property videos upload (optional)
    - Virtual tour link (optional)
  - **Step 10: Additional Details**
    - Nearby landmarks (schools, hospitals, metro stations, bus stops)
    - Distance from major locations
    - Property highlights
    - Special instructions
  - **Step 11: Review and Submit**
    - Preview of all entered information
    - Edit option for each section
    - Final submission\n- **Progress Save and Resume Functionality**
  - Auto-save feature that saves progress at each step
  - Manual save option available on every step
  - Save as draft button visible throughout the form
  - Resume from saved progress option on property listing page
  - Display saved draft properties with completion percentage
  - Option to continue editing or delete saved drafts
  - Progress indicator showing which steps are completed
  - Data persistence across sessions
  - Notification when progress is successfully saved
- Edit existing property information
- Delete property listings
- Property status management (Active/Inactive)
\n### 2.3 Advanced Room Management System with Floor-Based Validation
- **Room Addition Interface** (accessible after property listing is completed)
- **Intelligent Floor and Room Quota Management:**
  - System automatically fetches floor configuration from property details (total floors and rooms per floor)
  - Floor dropdown dynamically displays only floors that have remaining room quota
  - Real-time tracking of added rooms per floor
  - When the specified number of rooms for a floor is reached, that floor is automatically removed from the floor selection dropdown
  - Visual indicator showing remaining room slots per floor (e.g., Floor 1: 3/5 rooms added)\n  - Prevents adding more rooms than originally specified in property details
  - Validation message if user attempts to exceed floor room limit
  - Floor-wise room counter displayed during room addition process
\n- **For PG/Hostel Properties:**
  - Add individual rooms with following details:
    - Floor number (dropdown populated from property details, showing only floors with available room slots)
    - Room number/name
    - Sharing type (Single sharing, Double sharing, Triple sharing, Four sharing, Dormitory)
    - Number of beds in room
    - Rent per seat/bed
    - Room size (in sq ft)
    - Room-specific amenities (AC, Attached bathroom, Balcony, Window, Fan, Light, etc.)
    - Current occupancy status
    - Available seats\n    - Room images upload (multiple images per room)
    - Room description
- **For Flat/Apartment Properties:**
  - Add room details:\n    - Floor number (dropdown with floor quota validation)
    - Room type (Bedroom, Living room, Kitchen, Bathroom, Balcony)\n    - Room size (in sq ft)
    - Room-specific amenities\n    - Room images upload (multiple images per room)\n- **For Vacant Room Space:**\n  - Floor number (dropdown with floor quota validation)\n  - Room number/identifier\n  - Room size\n  - Current status (Available/Occupied)
  - Room images upload\n- Room editing and deletion capabilities (with automatic floor quota recalculation)
- Bulk room addition option for similar room types (with floor quota validation)
- Room status management (Available/Occupied/Under Maintenance)
- Dashboard showing floor-wise room addition progress

### 2.4 Tenant Management System
- Add tenant information:\n  - Tenant name
  - Contact details
  - ID proof\n  - Check-in date
  - Room assignment (owner can specify which room the tenant has booked)
  - Seat assignment (for PG/Hostel shared rooms)
- Real-time occupancy update upon tenant room assignment
- Tenant profile management\n- Tenant history tracking
- Check-out management with automatic occupancy status update

### 2.5 Real-Time Room Booking System
- Live booking interface similar to movie booking systems
- Visual room and seat selection (for PG/Hostel)
- Display of room sharing type and rent per seat
- Room-wise availability display
- Instant booking confirmation
- Booking status updates
- Seat-level booking for shared accommodations

### 2.6 Enhanced Cinema-Style Visual Real-Time Occupancy Dashboard
- **Movie Theater Inspired Visual Interface**
  - Cinema hall seating layout style visualization
  - Property structure displayed as theater screen (property name/info at top)
  - Floor-wise sections displayed as theater rows
  - Rooms displayed as seat groups within each floor row
  - Individual beds/seats within rooms shown as cinema seats
\n- **Property-Type Adaptive Visualization:**
  - **For PG/Hostel:**
    - Each floor displayed as a horizontal row (like theater rows A, B, C)
    - Rooms arranged horizontally within each floor row
    - Individual beds/seats within each room shown as seat icons
    - Seat count per room visually represented (2-seater shows 2 seat icons, 4-seater shows 4 seat icons)
    - Sharing type label displayed above each room group
  - **For Flat/Apartment:**
    - Entire flat shown as single unit or room-wise breakdown
    - Rooms within flat displayed as grouped sections
    - Visual representation adapts to BHK configuration
  - **For Vacant Room Space:**
    - Individual room units displayed as single seats
    - Floor-wise arrangement maintained
  - **For Mess:**
    - Seating capacity shown as dining hall layout
    - Table arrangements visualized
\n- **Interactive Seat/Bed Visualization:**
  - Each bed/seat represented as clickable icon (similar to movie seat selection)
  - Seat icons styled like cinema seats with armrests and backrest visual
  - Room boundaries clearly marked with subtle borders or spacing
  - Room numbers/names displayed prominently
  - Bed/seat numbers labeled within each room

- **Color-Coded Occupancy Indicators:**
  - Green: Available seats/beds
  - Red: Occupied seats/beds
  - Yellow: Under maintenance
  - Blue: Reserved/Booked
  - Grey: Not applicable/Blocked

- **Enhanced Interactive Features:**
  - Hover over any seat/bed to see:\n    - Room number and name
    - Bed/seat number
    - Occupancy status
    - Tenant name (if occupied)
    - Rent amount
    - Room amenities
  - Click on seat/bed for detailed information popup
  - Click on room group to see room-level details
  - Floor row headers clickable to expand/collapse floor view
\n- **Visual Layout Controls:**
  - Toggle between compact and expanded view
  - Zoom in/out functionality for large properties
  - Pan and scroll for navigation
  - Full-screen mode option
  - Floor selector for quick navigation
  - Room type filter (Single/Double/Triple/Four sharing/Dormitory)
\n- **Real-Time Statistics Panel:**
  - Total floors\n  - Total rooms
  - Total beds/seats (for PG/Hostel)\n  - Currently occupied count
  - Currently available count
  - Overall occupancy percentage
  - Floor-wise occupancy breakdown
  - Room-type-wise occupancy breakdown
  - Revenue metrics
\n- **Legend and Guide:**
  - Color legend explaining status indicators
  - Visual guide showing seat/room representation
  - Quick help tooltip\n\n- **Responsive Design:**
  - Adapts to screen size while maintaining cinema-style layout
  - Mobile-optimized touch interactions
  - Tablet view with optimized spacing
\n- **Real-Time Updates:**
  - Instant visual update when tenant is assigned\n  - Smooth color transition animations
  - Live sync across multiple devices
  - Notification badges for recent changes

### 2.7 Automated WhatsApp Group Management System
- **Automatic WhatsApp Group Creation**
  - System automatically creates a WhatsApp group for each property using the owner's registered contact number
  - Group naming convention: Property name + PG/Hostel Group (e.g., Sunshine PG Group)
  - Owner becomes the group admin automatically
  - Group creation triggered upon property listing completion
\n- **Automatic Tenant Addition to WhatsApp Group**
  - When a tenant is assigned a room and marked as occupied in the system, the tenant is automatically added to the property's WhatsApp group
  - System uses the tenant's contact number provided during tenant registration
  - Addition happens in real-time upon room occupancy confirmation
  - Tenant receives group invitation automatically

- **Personalized Welcome Message**
  - Upon tenant addition to the WhatsApp group, system automatically sends a personalized welcome message to the tenant
  - Welcome message includes:
    - Tenant name
    - Property name
    - Room number and seat/bed number (if applicable)
    - Check-in date
    - Owner contact information
    - Important property rules and guidelines
    - Amenities available
    - Emergency contact details
  - Message template customizable by owner

- **WhatsApp Integration Management**
  - Owner can enable/disable WhatsApp group management feature
  - Owner can customize welcome message template
  - Owner can view list of group members
  - System maintains sync between tenant occupancy status and WhatsApp group membership
  - When tenant checks out, option to remove from WhatsApp group automatically

- **Group Communication Features**
  - Owner can send broadcast messages to all tenants through the system
  - Announcement feature for important updates
  - Message history tracking
  - Group activity logs
\n### 2.8 Property Management Tasks
- Payment tracking\n- Maintenance requests handling
- Contract management
- Booking history
- Check-in/check-out management
- Seat allocation management (for PG/Hostel)\n- Room transfer requests
\n### 2.9 Analytics and Reports
- Occupancy rate reports (property-wise, floor-wise, and room-wise)
- Revenue analysis (total and per room/seat)
- Booking trends
- Tenant demographics
- Financial summaries
- Performance metrics
- Sharing-type-wise revenue comparison
- Custom date range reports
- Room-wise profitability analysis
- Floor-wise occupancy comparison

## 3. User Roles\n- Property Owner (primary role for current version)
\n## 4. Design Requirements

### 4.1 Theme and Color Scheme
- Professional and modern design theme
- Primary color palette with business-appropriate colors
- Clean and intuitive user interface
- Consistent visual hierarchy
- Professional typography
- Cinema/movie theater inspired visual design for occupancy dashboard
- Seat icon design similar to movie booking apps

### 4.2 User Experience\n- Step-by-step guided property listing process
- Progress indicator showing current step
- Save draft functionality at each step
- Clear navigation between steps
- Validation and error messages
- Responsive design for all devices
- Intuitive room management interface with floor quota validation
- Cinema-style visual room and seat layout display
- Easy image upload with preview\n- Drag-and-drop functionality for image uploads
- Interactive floor, room, and seat-level visualization
- Real-time occupancy status updates with smooth animations
- Seamless resume experience from saved progress
- Movie theater inspired seat selection experience
- Hover and click interactions for detailed information
- Zoom, pan, and navigation controls for large properties
- Visual feedback for floor room quota limits
- Clear indicators for remaining room slots per floor
- Seamless WhatsApp integration with minimal user intervention
- One-click WhatsApp group management
\n## 5. Technical Requirements
- Responsive web application
- Real-time data synchronization
- Secure authentication system
- Media file upload support (images and videos)
- Multiple image upload per room
- Dashboard with advanced data visualization
- Location-based dropdown system (State → City hierarchy)
- Form validation and data integrity checks
- Draft saving functionality with auto-save capability
- Property-type-specific form rendering
- Dynamic pricing calculation based on sharing type
- Image compression and optimization
- Gallery view for room images
- Auto-calculation of total rooms based on floor-wise input
- Real-time occupancy tracking and updates
- Interactive cinema-style visual dashboard with seat-level representation
- SVG or Canvas-based rendering for seat/room visualization
- WebSocket or similar technology for live updates
- Local storage or database persistence for draft data
- Session management for resume functionality
- Smooth animation libraries for status transitions
- Touch-optimized interactions for mobile devices
- Scalable vector graphics for zoom functionality
- Floor-wise room quota tracking and validation logic
- Dynamic dropdown population based on remaining floor capacity
- Real-time room counter per floor
- WhatsApp Business API integration for automated group management
- Automated message sending capabilities
- Contact synchronization with WhatsApp\n- Group creation and member management APIs
- Message template management system
- Real-time WhatsApp group sync with tenant occupancy status

## 6. Geographic Scope
- Application operates exclusively in India
- State dropdown includes all Indian states and union territories
- City dropdown dynamically populated based on selected state
\n## 7. Workflow\n1. Owner creates account and logs in
2. Owner adds property through step-by-step listing process
3. System adapts form fields based on selected property type
4. System auto-saves progress at each step
5. Owner can manually save draft at any point and resume later
6. Owner inputs floor details (total floors and rooms per floor)
7. System auto-calculates total rooms and stores floor-wise room quota
8. Owner completes property listing and submits
9. System automatically creates a WhatsApp group for the property using owner's contact number
10. Owner becomes the WhatsApp group admin
11. Owner proceeds to add individual rooms with specific details
12. System fetches floor configuration from property details
13. Floor dropdown displays only floors with remaining room quota
14. System shows visual indicator of remaining room slots per floor (e.g., Floor 1: 3/5 rooms added)\n15. When owner adds a room, system decrements the available room count for that floor
16. Once a floor reaches its room limit, that floor is automatically removed from the floor selection dropdown
17. System validates and prevents adding more rooms than specified for each floor
18. For PG/Hostel: Owner specifies sharing type, rent per seat, and food inclusion for each room
19. Owner uploads images for each room
20. Rooms become available for booking once added\n21. Owner adds tenant information and assigns specific room and seat\n22. System updates occupancy status in real-time upon tenant assignment
23. System automatically adds the tenant to the property's WhatsApp group using tenant's contact number
24. System sends personalized welcome message to the tenant via WhatsApp including property details, room information, and important guidelines
25. Enhanced cinema-style visual occupancy dashboard displays:\n    - Property layout as theater screen
    - Floors as theater rows
    - Rooms as seat groups\n    - Individual beds/seats as cinema seat icons
    - Real-time color-coded occupancy status for each seat/bed
26. Owner manages bookings, tenants, and property operations through dashboard
27. Real-time occupancy dashboard updates automatically with smooth animations for every change
28. Owner can interact with visual dashboard to view detailed information by hovering or clicking on seats/rooms
29. Owner can send broadcast messages to all tenants through WhatsApp group management interface
30. When tenant checks out, system can automatically remove tenant from WhatsApp group (if enabled)
31. If owner edits or deletes rooms, system automatically recalculates floor quota and updates available floors in dropdown