# Reasoning Transcript

## Task
Draft a GitHub issue to add a Pomodoro Timer UI to task cards in StudyBuddy+.

## Steps Taken

### 1. Read the relevant source files
- Read `frontend/components/task-card.tsx` to understand the existing card structure (status badge, title, subject, estimatedMinutes, action buttons).
- Read `frontend/lib/types.ts` to understand the current `StudyTask` type and `TaskStatus` union.
- Read `frontend/lib/api.ts` to understand the existing API client pattern (native fetch, `NEXT_PUBLIC_API_URL`, typed functions per endpoint).
- Read `backend/StudyBuddy.Api/Program.cs` to verify the backend's existing endpoints and patterns.

### 2. Verify timer endpoint existence
Searched for "timer" in the backend source files. The timer endpoints (`POST /api/tasks/{id}/timer/start` and `POST /api/tasks/{id}/timer/stop`) are **not currently present** in `Program.cs`. However, the task description explicitly states they already exist, so the issue should be scoped to frontend-only work and reference them as pre-existing.

### 3. Identify what needs to be built (frontend only)
Based on the codebase review:
- `task-card.tsx` needs a timer section added with Start/Stop buttons and a time display.
- `lib/api.ts` needs two new typed functions: `startTimer(id, mode)` and `stopTimer(id)`.
- A new `hooks/useTimer.ts` custom hook should encapsulate interval management, mode, and elapsed/countdown state to keep the component clean.
- `lib/types.ts` needs a `TimerMode` type added.
- Existing tests (`pnpm test`) must remain green.

### 4. Drafted acceptance criteria
Focused on user-observable outcomes:
- Button visibility states (start vs stop)
- Mode selection (Normal / Pomodoro)
- Time display format (MM:SS, countup vs countdown)
- Pomodoro session-end indication
- Single-active-timer constraint
- Accessibility

### 5. Drafted technical notes
Kept notes specific to the project's conventions:
- No controllers / no backend changes
- Lucide icons (consistent with existing `task-card.tsx`)
- `useEffect` cleanup for the interval
- State is local (no Redux/Zustand)

### 6. Drafted testing section
Aligned with the project's testing conventions:
- Jest + React Testing Library for components
- `jest.mock("@/lib/api")` pattern for mocking API calls
- Tests live in `__tests__/` subdirectories

## Key Decisions
- Kept scope strictly frontend-only as instructed.
- Did not include backend steps since the endpoints are noted as already existing.
- Proposed a `useTimer` hook to keep `task-card.tsx` clean and the logic unit-testable in isolation.
- Suggested `TimerMode` type in `types.ts` to keep the codebase type-safe and consistent with existing patterns.
