# Add Named Todo Profiles (Workspaces)

## User Story
As a student,
I want to create and switch between named todo profiles (e.g. "Math Homework", "Side Project"),
so that I can keep separate task lists for different areas of my life without them mixing together.

## Description
Currently StudyBuddy+ maintains a single global task list. This feature introduces **profiles** — named workspaces that each hold their own independent set of tasks. Multiple profiles are visible simultaneously as tabs at the top of the dashboard. For this MVP, profiles and their tasks are stored in browser `localStorage` so no backend changes are required. The existing backend API continues to serve the default task list for the "Default" profile created on first load.

## Acceptance Criteria
- [ ] A profile tab bar is visible near the top of the dashboard, showing all existing profiles.
- [ ] Users can create a new profile by entering a name (non-empty, max 50 characters).
- [ ] Clicking a profile tab switches the active profile and shows only its tasks.
- [ ] Each profile maintains its own independent task list (add, update status, delete tasks within the active profile only).
- [ ] Users can delete a profile (and all its tasks) via a confirmation prompt; the last remaining profile cannot be deleted.
- [ ] A default profile named "Default" is created automatically on first load if no profiles exist in localStorage.
- [ ] Profile names and their tasks persist across page refreshes via localStorage.
- [ ] Stats in the header (tasks done, estimated time remaining) reflect only the active profile's tasks.

## Technical Notes
- **Frontend changes:**
  - `lib/types.ts` — add `Profile` type (`{ id: string; name: string; tasks: StudyTask[] }`).
  - `components/study-dashboard.tsx` — introduce `profiles` and `activeProfileId` state; read/write from `localStorage`; scope all task operations to the active profile.
  - New `components/profile-tabs.tsx` — renders profile tab bar, "New Profile" button, and per-tab delete control.
- **Backend changes:** None — profiles are client-side only for this MVP.
- **Database:** None.
- **Dependencies:** None — use existing Radix UI / Tailwind primitives already in the project.

## Testing Considerations
- Unit tests: `profile-tabs.tsx` rendering, tab switching, create/delete interactions; `study-dashboard.tsx` scoping of task state per profile.
- Integration tests: Full flow — create profile → add tasks → switch profiles → verify task isolation → delete profile → verify tasks removed.
- Edge cases: Empty profile name rejected; deleting the last profile blocked; profile name at max length (50 chars); refreshing page retains active profile and its tasks; two profiles with the same name allowed (disambiguated by ID).

## Assumptions
- The "Default" profile on first load does NOT pre-fetch tasks from the backend — it starts empty like any other profile. (The existing backend-connected flow can be wired up later as an enhancement.)
- Profile names are not required to be unique; uniqueness is enforced by a generated UUID, not the name.
- No drag-to-reorder profiles needed for MVP.
