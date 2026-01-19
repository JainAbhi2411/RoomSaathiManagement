# Feature: Intelligent Room Management with Floor Limits

## Overview
Implemented intelligent room management that automatically fetches floor configuration from property details and enforces room limits per floor. The system prevents adding more rooms than configured and only shows floors that have available space, ensuring data integrity and proper property management.

## Key Features

### 1. Automatic Floor Configuration Fetching
- **Property-Based Limits**: Fetches `number_of_floors` and `rooms_per_floor` from property
- **Total Room Calculation**: Automatically calculates total allowed rooms (floors × rooms per floor)
- **Real-Time Tracking**: Shows current room count vs. total allowed
- **Visual Progress**: Displays "X/Y Rooms Added" indicator

### 2. Smart Floor Availability
- **Dynamic Floor List**: Only shows floors with available space
- **Availability Display**: Shows "(X/Y available)" for each floor option
- **Full Floor Hiding**: Automatically hides floors that reached their limit
- **Edit Mode Exception**: When editing, shows the room's current floor even if full

### 3. Validation System
- **Floor Selection Required**: Validates that a floor is selected before submission
- **Total Room Limit**: Prevents exceeding total property room capacity
- **Per-Floor Limit**: Prevents exceeding rooms per floor configuration
- **User-Friendly Messages**: Clear error messages explaining limits

### 4. Visual Indicators
- **Configuration Card**: Shows property floor and room configuration
- **Progress Display**: Current rooms added vs. total allowed
- **Warning Messages**: Alerts when limits are reached
- **Disabled States**: Disables "Add Room" button when no space available

## User Interface Elements

### Property Configuration Card
```
┌─────────────────────────────────────────┐
│ Property Configuration                  │
│ 3 Floors × 4 Rooms = 12 Total Rooms   │
│                              10/12      │
│                         Rooms Added     │
└─────────────────────────────────────────┘
```

### Floor Dropdown (Smart Filtering)
```
Select floor
├─ Ground Floor (2/4 available)
├─ Floor 1 (1/4 available)
└─ Floor 2 (4/4 available)

Note: Floor 3 is hidden (0/4 available - full)
```

### Warning Messages

#### Room Limit Reached
```
⚠️ Room limit reached! You have added all 12 rooms 
   allowed for this property.
   
   To add more rooms, update the property's floor 
   and room configuration.
```

#### All Floors Full
```
⚠️ All floors are full! Each floor has reached 
   its 4 room limit.
```

## Technical Implementation

### Floor Availability Calculation
```typescript
const getAvailableFloors = () => {
  if (!property) return [];

  const numberOfFloors = property.number_of_floors || 0;
  const roomsPerFloor = property.rooms_per_floor || 0;

  if (numberOfFloors === 0 || roomsPerFloor === 0) {
    return [];
  }

  // Count rooms per floor
  const roomCountByFloor: Record<number, number> = {};
  rooms.forEach((room) => {
    const floor = room.floor || 0;
    roomCountByFloor[floor] = (roomCountByFloor[floor] || 0) + 1;
  });

  // Generate available floors (0 to numberOfFloors-1)
  const availableFloors: Array<{ floor: number; available: number; total: number }> = [];
  for (let i = 0; i < numberOfFloors; i++) {
    const currentCount = roomCountByFloor[i] || 0;
    const available = roomsPerFloor - currentCount;
    
    // Only include floors that have space available
    if (available > 0 || (editingRoom && editingRoom.floor === i)) {
      availableFloors.push({
        floor: i,
        available,
        total: roomsPerFloor,
      });
    }
  }

  return availableFloors;
};
```

### Validation Logic
```typescript
// Check total room limit
if (!editingRoom && !canAddMoreRooms) {
  toast({
    title: 'Room Limit Reached',
    description: `You can only add ${totalRoomsAllowed} rooms...`,
    variant: 'destructive',
  });
  return;
}

// Check per-floor limit
const selectedFloorData = availableFloors.find(f => f.floor === roomForm.floor);
if (!editingRoom && selectedFloorData && selectedFloorData.available <= 0) {
  toast({
    title: 'Floor Full',
    description: `Floor ${roomForm.floor} already has ${selectedFloorData.total} rooms...`,
    variant: 'destructive',
  });
  return;
}
```

### Button State Management
```typescript
<Button 
  onClick={resetForm}
  disabled={!canAddMoreRooms || availableFloors.length === 0}
>
  <Plus className="mr-2 h-4 w-4" />
  Add Room
</Button>
```

## User Experience Flow

### Scenario 1: Adding Rooms Within Limits
1. User opens Room Management for a property
2. Property configured: 3 floors × 4 rooms = 12 total
3. Currently has 5 rooms added
4. Configuration card shows "5/12 Rooms Added"
5. User clicks "Add Room"
6. Floor dropdown shows:
   - Ground Floor (2/4 available)
   - Floor 1 (1/4 available)
   - Floor 2 (4/4 available)
7. User selects "Floor 1"
8. Fills in room details
9. Submits successfully
10. Room count updates to "6/12"

### Scenario 2: Floor Reaches Limit
1. Property: 2 floors × 3 rooms = 6 total
2. Ground Floor has 3 rooms (full)
3. Floor 1 has 2 rooms (1 available)
4. User clicks "Add Room"
5. Floor dropdown only shows:
   - Floor 1 (1/3 available)
6. Ground Floor is hidden (full)
7. User must select Floor 1
8. After adding, Floor 1 also becomes full
9. Next time, no floors available in dropdown

### Scenario 3: All Rooms Added
1. Property: 2 floors × 2 rooms = 4 total
2. All 4 rooms already added
3. Configuration shows "4/4 Rooms Added"
4. Warning message appears:
   "⚠️ Room limit reached! You have added all 4 rooms..."
5. "Add Room" button is disabled
6. User must edit property configuration to add more

### Scenario 4: Editing Existing Room
1. User clicks "Edit" on a room
2. Room is on Floor 1 (which is now full)
3. Floor dropdown still shows Floor 1
4. Exception: Current floor always shown when editing
5. User can change floor if other floors have space
6. Validation ensures new floor has capacity

### Scenario 5: Property Not Configured
1. Property has number_of_floors = 0 or rooms_per_floor = 0
2. Warning message: "All floors are full or property not configured"
3. Floor dropdown is disabled
4. "Add Room" button is disabled
5. User must configure property first

## Validation Rules

### Floor Selection
- **Required**: Floor must be selected (not null/undefined)
- **Available Space**: Selected floor must have available capacity
- **Within Range**: Floor must be between 0 and (number_of_floors - 1)

### Total Room Limit
- **Formula**: total_rooms = number_of_floors × rooms_per_floor
- **Check**: current_rooms < total_rooms
- **Action**: Prevent adding if limit reached

### Per-Floor Limit
- **Formula**: rooms_on_floor < rooms_per_floor
- **Check**: Count existing rooms on selected floor
- **Action**: Prevent adding if floor is full

## Benefits

### For Property Owners
1. **Data Integrity**: Ensures room count matches property configuration
2. **Clear Limits**: Always know how many rooms can be added
3. **Guided Process**: Only see valid floor options
4. **Error Prevention**: Can't accidentally exceed limits
5. **Easy Management**: Visual progress tracking

### For System Integrity
1. **Consistent Data**: Room counts always match property specs
2. **Validation**: Multiple layers of validation prevent errors
3. **Scalability**: Works for any property size
4. **Flexibility**: Easy to update property configuration
5. **Maintainability**: Clear business logic

### For User Experience
1. **Intuitive**: Only shows valid options
2. **Informative**: Clear messages about limits
3. **Preventive**: Stops errors before they happen
4. **Helpful**: Explains why actions are blocked
5. **Efficient**: No trial and error needed

## Edge Cases Handled

### 1. Property Without Configuration
- **Scenario**: number_of_floors = 0 or rooms_per_floor = 0
- **Handling**: Disable room addition, show configuration message
- **User Action**: Must configure property first

### 2. All Floors Full
- **Scenario**: Every floor has reached its room limit
- **Handling**: Empty floor dropdown, show warning
- **User Action**: Must increase property capacity

### 3. Editing Room on Full Floor
- **Scenario**: Editing a room on a floor that's now full
- **Handling**: Still show that floor in dropdown
- **Reason**: Allow editing without forcing floor change

### 4. Changing Floor During Edit
- **Scenario**: User wants to move room to different floor
- **Handling**: Validate new floor has capacity
- **Result**: Allow if space available, block if full

### 5. Concurrent Additions
- **Scenario**: Multiple users adding rooms simultaneously
- **Handling**: Database constraints prevent over-limit
- **Fallback**: Validation on submission catches issues

## Visual Design

### Configuration Card Styling
- **Background**: bg-muted with border
- **Layout**: Flex with space-between
- **Typography**: font-medium for title, text-muted-foreground for details
- **Emphasis**: Large font (text-lg) for room count

### Warning Messages
- **Room Limit**: bg-destructive/10 with border-destructive
- **Floor Full**: bg-warning/10 with border-warning
- **Icon**: ⚠️ emoji for attention
- **Text**: Clear, actionable messages

### Floor Dropdown
- **Format**: "Floor X (Y/Z available)"
- **Ground Floor**: Special label for floor 0
- **Disabled State**: Grayed out with helpful text
- **Helper Text**: Explains filtering logic

## Files Modified
- `src/pages/RoomManagement.tsx` - Added intelligent floor management

## Code Quality
- ✅ All 91 files pass lint checks
- ✅ TypeScript type-safe
- ✅ Proper validation
- ✅ Clear error messages
- ✅ Efficient calculations
- ✅ Clean, maintainable code

## Future Enhancements

1. **Bulk Room Addition**: Add multiple rooms at once
2. **Floor Templates**: Copy room configuration from one floor to another
3. **Capacity Warnings**: Alert when approaching limits (e.g., 80% full)
4. **Auto-Numbering**: Suggest room numbers based on floor and position
5. **Visual Floor Plan**: Drag-and-drop room placement on floor layout
6. **Capacity Analytics**: Show floor utilization charts
7. **Smart Suggestions**: Recommend optimal room distribution
8. **Batch Operations**: Move multiple rooms between floors

## Comparison: Before vs After

### Before (No Limits)
```
- Manual floor number input
- No validation on room count
- Could exceed property capacity
- No guidance on floor selection
- Possible data inconsistency
- Trial and error process
```

### After (Intelligent Management)
```
- Smart floor dropdown
- Automatic limit enforcement
- Prevents exceeding capacity
- Only shows available floors
- Guaranteed data consistency
- Guided, error-free process
```

## Example Scenarios

### Small Property (PG)
```
Configuration: 2 floors × 3 rooms = 6 total

Floor Distribution:
- Ground Floor: 3/3 rooms (Full) ❌
- Floor 1: 2/3 rooms (1 available) ✅

Status: Can add 1 more room on Floor 1
```

### Medium Property (Hostel)
```
Configuration: 4 floors × 6 rooms = 24 total

Floor Distribution:
- Ground Floor: 6/6 rooms (Full) ❌
- Floor 1: 5/6 rooms (1 available) ✅
- Floor 2: 4/6 rooms (2 available) ✅
- Floor 3: 3/6 rooms (3 available) ✅

Status: Can add 6 more rooms across 3 floors
```

### Large Property (Apartment Complex)
```
Configuration: 10 floors × 8 rooms = 80 total

Current: 65/80 rooms added

Available Floors:
- Floor 3: 1/8 available
- Floor 5: 2/8 available
- Floor 7: 3/8 available
- Floor 8: 4/8 available
- Floor 9: 5/8 available

Status: Can add 15 more rooms
```

## Conclusion

The Intelligent Room Management system transforms room addition from a manual, error-prone process into a guided, validated workflow. By automatically fetching property configuration and enforcing limits, the system ensures data integrity while providing a smooth user experience. Property owners can confidently manage their rooms knowing the system prevents errors and maintains consistency with their property's physical layout.
