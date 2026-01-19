# Feature: Save Progress in Property Form

## Overview
Added automatic draft saving and resume functionality to the PropertyForm, allowing users to save their progress and resume filling out the form later. This prevents data loss and improves user experience for the multi-step property creation process.

## Features Implemented

### 1. Auto-Save with Debouncing
- **Automatic Saving**: Form data is automatically saved to localStorage as users type
- **Debouncing**: 2-second delay before saving to avoid excessive writes
- **Smart Saving**: Skips initial mount to avoid saving empty forms
- **Per-User Storage**: Each user has their own draft storage (keyed by user ID)

### 2. Resume Draft Dialog
- **Automatic Detection**: Checks for saved drafts when user opens the form
- **Timestamp Display**: Shows when the draft was last saved (e.g., "5 minutes ago", "2 hours ago")
- **Two Options**:
  - **Resume Draft**: Restores all form data from the saved draft
  - **Start Fresh**: Discards the draft and starts with a clean form
- **User-Friendly**: Clear dialog with easy-to-understand options

### 3. Manual Save Draft Button
- **Save Draft Button**: Located in the header (top-right) for easy access
- **Visual Feedback**: Toast notification confirms successful save
- **Last Saved Indicator**: Badge showing when the draft was last saved
- **Disabled During Loading**: Prevents multiple saves during form submission

### 4. Draft Lifecycle Management
- **Auto-Clear on Success**: Draft is automatically deleted after successful property creation/update
- **Edit Mode Exclusion**: Draft saving only works for new properties (not when editing existing ones)
- **Clean State**: No orphaned drafts left after successful submissions

## Technical Implementation

### Custom Hook: `useFormPersistence`
Created a reusable hook for form persistence:

```typescript
useFormPersistence<T>(formData: T, options: {
  key: string;           // localStorage key
  debounceMs?: number;   // Debounce delay (default: 1000ms)
})
```

**Returns:**
- `saveToStorage(data)`: Manually save data
- `loadFromStorage()`: Load saved data with timestamp
- `clearStorage()`: Clear saved data

### Storage Format
```json
{
  "formData": { /* all form fields */ },
  "timestamp": "2026-01-19T10:30:00.000Z"
}
```

### localStorage Key Pattern
```
property-form-draft-{userId}
```

## User Experience Flow

### Scenario 1: New User (No Draft)
1. User opens "Add New Property" form
2. Fills in some fields
3. Auto-save triggers after 2 seconds of inactivity
4. User can click "Save Draft" for immediate save
5. Badge shows "Saved just now"

### Scenario 2: Returning User (Has Draft)
1. User opens "Add New Property" form
2. Dialog appears: "Resume Previous Draft?"
3. Shows: "We found a saved draft from 2 hours ago"
4. User chooses:
   - **Resume Draft** → Form populated with saved data
   - **Start Fresh** → Draft deleted, clean form

### Scenario 3: Successful Submission
1. User completes and submits the form
2. Property created successfully
3. Draft automatically cleared from localStorage
4. User redirected to Room Management

### Scenario 4: Editing Existing Property
1. User opens "Edit Property" form
2. No draft saving (edit mode excluded)
3. No "Save Draft" button shown
4. Changes saved only on submit

## UI Components

### Resume Draft Dialog
- **Location**: Appears on component mount (if draft exists)
- **Style**: AlertDialog with clear title and description
- **Actions**: "Start Fresh" (cancel) and "Resume Draft" (primary)

### Save Draft Button
- **Location**: Header, top-right corner
- **Icon**: Save icon with text
- **Variant**: Outline button
- **State**: Disabled during loading

### Last Saved Badge
- **Location**: Next to Save Draft button
- **Icon**: Clock icon
- **Content**: Relative time (e.g., "Saved 3 minutes ago")
- **Variant**: Secondary badge

## Timestamp Formatting

Smart relative time display:
- **< 1 minute**: "just now"
- **< 60 minutes**: "5 minutes ago"
- **< 24 hours**: "3 hours ago"
- **≥ 24 hours**: Full date and time

## Benefits

1. **Data Loss Prevention**: Users never lose their progress
2. **Improved UX**: Can complete form across multiple sessions
3. **Reduced Friction**: No need to fill everything in one sitting
4. **Peace of Mind**: Visual confirmation of auto-save
5. **Flexibility**: Both automatic and manual save options

## Files Created/Modified

### Created:
- `src/hooks/useFormPersistence.ts` - Reusable form persistence hook

### Modified:
- `src/pages/PropertyForm.tsx` - Added draft save/resume functionality

## Code Quality

- ✅ TypeScript type-safe
- ✅ Proper error handling
- ✅ Memory leak prevention (cleanup timeouts)
- ✅ Responsive design (mobile-friendly)
- ✅ Accessibility (proper ARIA labels)
- ✅ All 91 files pass lint checks

## Future Enhancements

- Add draft expiration (e.g., auto-delete after 30 days)
- Show draft preview in resume dialog
- Support multiple drafts per user
- Sync drafts across devices (using backend)
- Add "Save and Exit" button for explicit save
- Show unsaved changes warning on navigation
