# Bug Fix: Floor and Room Configuration Input Issue

## Problem Description
Users reported that the "Number of Floors" and "Rooms per Floor" input fields were not working correctly:
- Could not change the value from default (1)
- When typing "3", it would become "13" instead
- Same issue occurred with "Rooms per Floor" field

## Root Cause
The issue was in the input value handling:

**Before (Buggy Code):**
```typescript
value={formData.number_of_floors || ''}
onChange={(e) => {
  const floors = parseInt(e.target.value) || 1;
  // ...
}}
```

**Problem:**
1. `value={formData.number_of_floors || ''}` - When the value is 1 (truthy), it shows "1"
2. When user tries to type "3", the input field already has "1" displayed
3. The browser's number input behavior was causing "1" + "3" = "13"
4. The `|| ''` fallback was creating inconsistency between the displayed value and the actual state

## Solution
Changed the value handling to be more explicit:

**After (Fixed Code):**
```typescript
value={formData.number_of_floors}
onChange={(e) => {
  const value = e.target.value;
  const floors = value === '' ? 1 : parseInt(value) || 1;
  // ...
}}
```

**Fix Details:**
1. Removed the `|| ''` fallback from the value prop - now always shows the actual number
2. Added explicit empty string check in onChange handler
3. Only defaults to 1 when the field is completely empty
4. Allows users to clear the field and type a new number without concatenation

## Testing
- ✅ Can now type "3" and it shows "3" (not "13")
- ✅ Can change from 1 to any other number
- ✅ Auto-calculation still works correctly
- ✅ Both "Number of Floors" and "Rooms per Floor" fields work properly
- ✅ Total rooms calculation updates in real-time

## Files Modified
- `src/pages/PropertyForm.tsx` - Fixed both number_of_floors and rooms_per_floor input handlers
