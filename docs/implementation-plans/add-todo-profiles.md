# Add Named Todo Profiles (Workspaces) — Implementation Plan

## Feature Overview

This feature introduces **profiles** — named workspaces that each hold their own independent task list. A tab bar is added near the top of the dashboard so users can create, switch between, and delete profiles. All data (profiles and their tasks) lives exclusively in browser `localStorage`; no backend changes are needed. On first load, a "Default" profile is created automatically with an empty task list. All task operations (add, update status, delete) are scoped to the active profile only, and the header stats reflect only the active profile's tasks.

---

## Key References

| File | Lines | Pattern to follow |
|------|-------|-------------------|
| `frontend/lib/types.ts` | 1–15 | Minimal type definitions; `CreateTaskInput` derives from `StudyTask` via `Omit` — add `Profile` here |
| `frontend/components/study-dashboard.tsx` | 11–20 | State declarations block — add `profiles` and `activeProfileId` state here |
| `frontend/components/study-dashboard.tsx` | 22–35 | `useEffect` + `loadTasks` pattern — replace with localStorage-based init |
| `frontend/components/study-dashboard.tsx` | 39–80 | Task handler functions (`handleAddTask`, `handleStatusChange`, `handleDelete`) — all need scoping to active profile |
| `frontend/components/study-dashboard.tsx` | 83–102 | `stats` block and `filteredTasks`/`sortedTasks` derivation — must use active profile's tasks |
| `frontend/components/study-dashboard.tsx` | 104–250 | JSX return — insert `<ProfileTabs />` inside the header just below the branding div |
| `frontend/components/task-filters.tsx` | 1–56 | Component interface pattern with typed props; Tailwind button styling for tabs |
| `frontend/components/__tests__/study-dashboard.test.tsx` | 1–20 | `jest.mock('@/lib/api')` pattern and `beforeEach` reset — all `fetchTasks` mocking must be removed/replaced |
| `frontend/components/__tests__/task-filters.test.tsx` | 1–80 | Test structure for a pure UI component with callbacks — follow for `profile-tabs.test.tsx` |

---

## Documentation

- No external dependencies required. All patterns are covered by existing codebase references above.

---

## Architectural Constraints

- **Frontend only** — no backend files may be changed. `lib/api.ts` is also unchanged.
- **No new npm packages** — use only Tailwind CSS, Radix UI primitives, lucide-react, and React hooks already present.
- **`localStorage` is the sole persistence layer** — save and read a single key `"studybuddy-profiles-state"` containing `{ profiles: Profile[], activeProfileId: string }`. Do not use separate keys per profile.
- **`fetchTasks` is no longer called** — the dashboard's `useEffect` is replaced entirely with localStorage initialization. Remove the `fetchTasks` import from `study-dashboard.tsx`.
- **Tasks live inside profiles** — no top-level `tasks` state remains; all task reads/writes go through the matching profile in `profiles`.
- **Profile IDs are UUID strings** — use `crypto.randomUUID()` which is available in modern browsers and the jsdom test environment.

---

## Gotchas

- **SSR / `localStorage` access** — `localStorage` is not available during server-side rendering. Access it only inside `useEffect`, never in initial state values or outside effects. The `isLoading` state should start as `true` and be set to `false` inside the `useEffect` after reading localStorage.
- **`crypto.randomUUID()` in tests** — jsdom (Node 16+) provides `globalThis.crypto.randomUUID`. If tests run on an older Node version, mock it: `jest.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('test-uuid')`. Check with `node --version` first.
- **Active profile after deletion** — when the active profile is deleted, switch to `profiles[0]` (the first remaining one). Enforce this order: remove the deleted profile, then pick the new first element.
- **Deleting the last profile** — the delete button (or the `onDeleteProfile` handler) must guard against `profiles.length === 1`. Disabling the button in the UI is preferred over an alert.
- **`window.confirm` in tests** — `handleDeleteProfile` calls `window.confirm`. In Jest/jsdom, `window.confirm` is not implemented and returns `undefined` (falsy). Mock it explicitly: `window.confirm = jest.fn().mockReturnValue(true)`.
- **`isLoading` state now means "reading localStorage"** — the existing loading spinner and "Loading your tasks…" text will briefly appear on mount; this is acceptable and no UI changes are needed.
- **Existing `study-dashboard.test.tsx` tests are fully invalidated** — all tests that mock `fetchTasks`, test loading from API, or test error states must be removed and replaced with localStorage-based equivalents. The old tests will fail to compile if the `fetchTasks` import is removed from the component.
- **Profile name max length** — validate `name.trim().length > 0 && name.length <= 50` before creating. Show an inline message inside `ProfileTabs` when validation fails; do not use `alert()`.

---

## Ordered Task List

### PR 1 — Profile Types + UI Component

1. **Add `Profile` type** — in `frontend/lib/types.ts`, add `export type Profile = { id: string; name: string; tasks: StudyTask[] }`. Run `cd frontend && pnpm run build` to verify TypeScript accepts the change.

2. **Create `ProfileTabs` component** — create `frontend/components/profile-tabs.tsx` as a `"use client"` component. Props interface:
   ```
   ProfileTabsProps {
     profiles: Profile[]
     activeProfileId: string
     onSwitch: (id: string) => void
     onCreate: (name: string) => void
     onDelete: (id: string) => void
   }
   ```
   Internal state: `newName: string` (controlled input for the "New Profile" text field) and `nameError: string | null`. Render:
   - One tab button per profile (active tab uses `bg-indigo-600 text-white`, inactive uses the same outlined style as `TaskFilters` filter buttons).
   - A delete icon button (`Trash2` from lucide-react) on each tab, disabled when `profiles.length === 1`. Calls `onDelete(profile.id)` — no `confirm` dialog here; the dashboard handler is responsible for that.
   - A small inline form with a text input and "Add" button below/beside the tabs. On submit: validate name (trim non-empty, ≤50 chars), call `onCreate(name)`, clear input. Show `nameError` below the input when validation fails.
   - Follow the Tailwind class patterns from `task-filters.tsx` for button styling. Run `pnpm run build` after creating the file.

3. **Write `ProfileTabs` unit tests** — create `frontend/components/__tests__/profile-tabs.test.tsx`. Use `@testing-library/react` and `userEvent`. Cover:
   - Renders all profile tab names.
   - Clicking a tab calls `onSwitch` with the correct id.
   - Delete button is disabled when only one profile exists.
   - Delete button is enabled when two or more profiles exist; clicking it calls `onDelete` with the correct id.
   - Submitting a valid new profile name calls `onCreate` and clears the input.
   - Submitting an empty name does NOT call `onCreate` and shows an error message.
   - Submitting a name exceeding 50 characters does NOT call `onCreate` and shows an error message.
   - Run `pnpm test -- --testPathPattern=profile-tabs` and verify all tests pass.

---

### PR 2 — Dashboard Integration

4. **Refactor `StudyDashboard`** — in `frontend/components/study-dashboard.tsx`:
   - Remove the `fetchTasks` import and the related `error` / `loadTasks` / `isLoading`-for-fetch logic (keep `isLoading` for the localStorage init).
   - Add imports: `Profile` from `@/lib/types`, `ProfileTabs` from `./profile-tabs`.
   - Replace `const [tasks, setTasks] = useState<StudyTask[]>([])` with:
     ```
     const [profiles, setProfiles] = useState<Profile[]>([])
     const [activeProfileId, setActiveProfileId] = useState<string>("")
     ```
   - Replace the `useEffect` that calls `loadTasks()` with one that reads from `localStorage.getItem("studybuddy-profiles-state")`. If found, parse and restore both `profiles` and `activeProfileId`. If not found, generate a default profile (`id: crypto.randomUUID(), name: "Default", tasks: []`) and set it as active. Set `isLoading(false)` at the end.
   - Add a second `useEffect` that writes `JSON.stringify({ profiles, activeProfileId })` to `localStorage.setItem("studybuddy-profiles-state", ...)` whenever `profiles` or `activeProfileId` changes. Guard with `if (profiles.length > 0)` to avoid overwriting on the initial empty render.
   - Add computed value: `const activeTasks = profiles.find(p => p.id === activeProfileId)?.tasks ?? []`.
   - Refactor all task handlers to update `profiles` state immutably:
     - `handleAddTask`: append new task to the matching profile's `tasks` array (create a locally-generated task with `id: crypto.randomUUID(), status: "todo", createdAt: new Date().toISOString()` — **no API call**).
     - `handleStatusChange`: update the matching task's `status` within the matching profile's `tasks`.
     - `handleDelete`: filter out the matching task from the matching profile's `tasks`. Keep the `confirm` dialog.
   - Add profile management handlers:
     - `handleCreateProfile(name: string)`: create new `Profile` with `crypto.randomUUID()`, append to `profiles`, set as active.
     - `handleDeleteProfile(id: string)`: show `window.confirm("Delete this profile and all its tasks?")`. On confirm, remove the profile and, if it was active, set `activeProfileId` to the first remaining profile's id.
     - `handleSwitchProfile(id: string)`: set `activeProfileId = id`.
   - Replace all references to `tasks` with `activeTasks` in `filteredTasks`, `sortedTasks`, and `stats`.
   - Remove `updatingTaskIds` state and the `setUpdatingTaskIds` calls — task operations are now synchronous (no API calls).
   - In the JSX, insert `<ProfileTabs ... />` inside the header `<div className="mx-auto flex max-w-5xl ...">` as a new row below the branding/stats row (or between the header and `<main>`). Pass all four profile props.
   - Run `pnpm run build` to verify no TypeScript errors.

5. **Rewrite `StudyDashboard` tests** — in `frontend/components/__tests__/study-dashboard.test.tsx`:
   - Remove all `jest.mock('@/lib/api')` references and `mockFetchTasks` setup.
   - Add `localStorage` helpers: in `beforeEach`, call `localStorage.clear()`. In `afterEach`, call `localStorage.clear()`.
   - Add `window.confirm = jest.fn().mockReturnValue(true)` in `beforeEach` for delete tests.
   - Rewrite or add tests to cover:
     - On first render with empty localStorage, a "Default" profile tab is visible.
     - Adding a task updates the active profile's task list (task title appears in the DOM).
     - Switching profiles shows only the tasks for that profile (task isolation).
     - Creating a new profile via `ProfileTabs` adds a tab; switching to it shows an empty task list.
     - Deleting a non-last profile removes its tab and switches to the first remaining profile.
     - Refreshing (unmount + remount with localStorage populated) restores profiles and active profile.
     - Stats (done/total count and estimated hours) reflect only the active profile's tasks.
   - Run `pnpm test -- --testPathPattern=study-dashboard` and verify all tests pass.
   - Run `pnpm test` (full suite) and verify total test count is ≥ 53 + new tests.

---

## Stacked PR Breakdown

| PR | Branch | Tasks | Merges into |
|----|--------|-------|-------------|
| PR 1 | `feature/add-todo-profiles/part-1-profile-tabs-component` | 1, 2, 3 | PR 2's branch |
| PR 2 | `feature/add-todo-profiles/part-2-dashboard-integration` | 4, 5 | `main` |

---

## Validation Gates

- `cd frontend && pnpm run build` — passing: exits 0 with no TypeScript errors
- `cd frontend && pnpm test -- --testPathPattern=profile-tabs` — passing: all new `ProfileTabs` tests pass
- `cd frontend && pnpm test -- --testPathPattern=study-dashboard` — passing: all rewritten dashboard tests pass
- `cd frontend && pnpm test` — passing: total test count ≥ original 53 plus all new tests, 0 failures
- Manual smoke test: open app, create two profiles, add tasks to each, switch between them, verify task isolation, refresh page, verify state is restored

---

## Completion Checklist

- [ ] `Profile` type added to `frontend/lib/types.ts`
- [ ] `frontend/components/profile-tabs.tsx` created with correct props interface
- [ ] `ProfileTabs` renders all tabs, active tab is highlighted
- [ ] New profile creation validates non-empty name ≤ 50 chars; shows inline error on failure
- [ ] Delete button is disabled when only one profile remains
- [ ] `frontend/components/__tests__/profile-tabs.test.tsx` created and all tests pass
- [ ] `frontend/components/study-dashboard.tsx` no longer imports or calls `fetchTasks`
- [ ] Dashboard initialises from `localStorage` on mount; creates "Default" profile if none exists
- [ ] Dashboard writes to `localStorage` whenever `profiles` or `activeProfileId` changes
- [ ] `activeTasks` is derived from the active profile and used for all task operations and stats
- [ ] `handleAddTask` creates tasks locally (no API call)
- [ ] `handleStatusChange` updates tasks within the active profile only
- [ ] `handleDelete` removes task from the active profile only
- [ ] `handleCreateProfile`, `handleSwitchProfile`, `handleDeleteProfile` implemented correctly
- [ ] `<ProfileTabs />` is rendered in the dashboard header/layout
- [ ] `frontend/components/__tests__/study-dashboard.test.tsx` fully rewritten; no stale `fetchTasks` mocks
- [ ] `pnpm run build` exits 0 (no TypeScript errors)
- [ ] `pnpm test` passes with 0 failures
