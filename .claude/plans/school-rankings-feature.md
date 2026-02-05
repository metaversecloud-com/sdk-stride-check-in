# School Rankings Feature Implementation Plan

## Summary
Add a "Show School Rankings" feature that displays a leaderboard of schools ranked by check-in count on the Home page, controlled by a new admin setting.

## Files to Modify

### Backend Changes

| File | Change |
|------|--------|
| `server/types/DroppedAssetInterface.ts` | Add `showSchoolRankings: boolean` to `AppSettings`, add `SchoolRanking` interface |
| `server/utils/droppedAssets/initializeDroppedAssetDataObject.ts` | Add `showSchoolRankings: false` default |
| `server/controllers/handleGetSettings.ts` | Expose `showSchoolRankings` to non-admin users |
| `server/controllers/handleUpdateSettings.ts` | Add validation for `showSchoolRankings` boolean |
| `server/controllers/handleGetRankings.ts` | **NEW** - Endpoint to aggregate and return school rankings |
| `server/controllers/index.ts` | Export new handler |
| `server/routes.ts` | Register `GET /rankings` route |

### Frontend Changes

| File | Change |
|------|--------|
| `client/src/components/AdminSettings.tsx` | Add checkbox for `showSchoolRankings` setting |
| `client/src/components/SchoolRankings.tsx` | **NEW** - Component to display ranked schools |
| `client/src/components/index.ts` | Export new component |
| `client/src/pages/Home.tsx` | Conditionally render `SchoolRankings` when setting is enabled |

## Implementation Details

### 1. Type Definitions (`DroppedAssetInterface.ts`)
```typescript
export interface AppSettings {
  title: string;
  description: string;
  checkInDaily: boolean;
  showSchoolRankings: boolean;  // NEW
}

export interface SchoolRanking {
  schoolId: string;
  schoolName: string;
  checkInCount: number;
  rank: number;
}
```

### 2. Rankings Endpoint Logic (`handleGetRankings.ts`)
- **30-second in-memory cache** per asset to avoid expensive recalculation on each request
  - Cache key: `assetId`
  - Cache stores: `{ rankings, timestamp }`
  - Return cached response if within 30 seconds, otherwise recalculate
- Check if `showSchoolRankings` is enabled; return empty if disabled
- Iterate through `checkedInUsers` array
- For each check-in record, count each schoolId (users may have multiple schools)
- Use schoolNames array for display names
- Sort by count descending
- Assign ranks with tie handling (same count = same rank)

### 3. Admin Settings UI
- Add checkbox labeled "Show School Rankings"
- Description: "Display a leaderboard of schools ranked by check-in count on the home page"

### 4. SchoolRankings Component
- Fetch from `/rankings` endpoint
- Return null if disabled or loading
- Show empty state message if no check-ins
- Display ranked list with rank number, school name, and check-in count

### 5. Home Page Integration
- Import `SchoolRankings` component
- Render conditionally: `{settings.showSchoolRankings && <SchoolRankings />}`

## Verification

1. **Admin Panel**: Toggle setting on/off, verify it saves
2. **Home Page (setting OFF)**: School rankings section should not appear
3. **Home Page (setting ON)**: School rankings section should appear
4. **Empty State**: With no check-ins, show friendly message
5. **With Check-ins**: Verify schools are ranked by count, ties handled correctly
6. **Multi-school Users**: A user with multiple schools should count toward each school's total