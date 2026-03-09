# Add Pomodoro Timer UI to Task Cards

## User Story
As a student,
I want a timer on each task card that supports normal and pomodoro modes,
so that I can track focused study sessions and stay productive using time-boxing techniques.

## Description
The backend already exposes `POST /api/tasks/{id}/timer/start` and `POST /api/tasks/{id}/timer/stop` endpoints. This issue covers adding a timer UI directly inside each task card in `task-card.tsx` that calls those endpoints and counts down locally. The timer must support two modes: **normal** (counts down from the task's `estimatedMinutes`) and **pomodoro** (25-minute work intervals followed by a 5-minute break, repeating until the user stops). The `study-dashboard.tsx` component may require minor prop additions to pass timer callbacks down to task cards.

## Acceptance Criteria
- [ ] Each task card displays a timer control area with a mode selector (Normal / Pomodoro) and Start/Stop buttons.
- [ ] In normal mode the timer counts down from `task.estimatedMinutes`; reaching zero stops the timer and shows a completion indicator.
- [ ] In pomodoro mode the timer runs a 25-minute work interval then a 5-minute break, cycling automatically and displaying the current phase (Work / Break).
- [ ] Clicking Start calls `POST /api/tasks/{id}/timer/start` and clicking Stop calls `POST /api/tasks/{id}/timer/stop`; API errors are surfaced as a user-visible error message.
- [ ] Only one timer can run per task card at a time; starting a new session resets any previous countdown.
- [ ] The timer display and mode selector are disabled (greyed out) while the parent card's `isUpdating` prop is true.
- [ ] Timer state (running/stopped, remaining seconds, current phase) is local to the card and does not persist across page reloads.

## Technical Notes
- **Frontend changes:** `frontend/components/task-card.tsx` (primary — add timer UI and local state), `frontend/lib/api.ts` (add `startTimer(id)` and `stopTimer(id)` helper functions), `frontend/lib/types.ts` (no type changes expected unless backend returns timer metadata)
- **Backend changes:** None — timer endpoints already exist
- **Database:** None
- **Dependencies:** None — use existing React hooks (`useState`, `useEffect`, `useRef`) and Lucide icons already present in the project

## Testing Considerations
- Unit tests: test the `TaskCard` component renders the timer controls; test mode switching updates displayed mode label; test that `startTimer` and `stopTimer` API helpers are called on button click; test countdown logic decrements correctly each second and stops at zero
- Integration tests: verify that clicking Start in the UI triggers the correct backend endpoint with the right task ID; verify Stop halts the interval and calls the stop endpoint
- Edge cases: task with `estimatedMinutes = 0` in normal mode; rapid Start/Stop clicks do not create multiple intervals; switching mode while timer is running (should stop and reset); API failure on start/stop shows error without crashing the card
