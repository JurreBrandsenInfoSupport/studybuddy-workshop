# Add Pomodoro Timer UI to Task Cards

## User Story

As a student,
I want to start a pomodoro or normal timer directly from a task card,
so that I can track focused study time for individual tasks without leaving the dashboard.

## Description

The backend already exposes `POST /api/tasks/{id}/timer/start` (accepting a `mode` of `"normal"` or `"pomodoro"`) and `POST /api/tasks/{id}/timer/stop`. This issue covers building the frontend timer UI that calls these endpoints and displays the running time on the relevant task card.

## Acceptance Criteria

- [ ] Each task card shows a "Start Timer" button when no timer is active for that task
- [ ] Clicking "Start Timer" opens a mode selector (Normal / Pomodoro) and starts the timer via `POST /api/tasks/{id}/timer/start`
- [ ] A running timer displays elapsed time in `MM:SS` format, updating every second using a client-side interval
- [ ] An active timer card shows a "Stop Timer" button; clicking it stops the timer via `POST /api/tasks/{id}/timer/stop`
- [ ] In Pomodoro mode, the timer counts down from 25:00 and shows a visual indicator when the session ends
- [ ] In Normal mode, the timer counts up from 00:00 with no upper limit
- [ ] Only one timer can be active per task at a time (button is disabled/hidden while a timer is already running for that task)
- [ ] The timer display is accessible — elapsed/remaining time is readable by screen readers

## Technical Notes

- **Frontend changes only** — backend endpoints already exist
- Modify `frontend/components/task-card.tsx` to add the timer section below the existing action buttons
- Add `startTimer(id, mode)` and `stopTimer(id)` functions to `frontend/lib/api.ts` calling the backend endpoints
- Extract timer logic into a custom hook `frontend/hooks/useTimer.ts` to manage interval, elapsed time, and mode state
- Timer state is local to the component (no global state needed); mode can be `"normal" | "pomodoro"` matching the API contract
- Import any new types into `frontend/lib/types.ts` (e.g. `TimerMode = "normal" | "pomodoro"`)
- Use `lucide-react` icons (e.g. `Play`, `Square`, `Timer`) consistent with existing icon usage in `task-card.tsx`
- Clean up the `setInterval` in a `useEffect` return to avoid memory leaks

## Testing

- [ ] Unit tests for `useTimer` hook (start, stop, countdown, countup behaviour)
- [ ] Unit tests for new API functions `startTimer` and `stopTimer` in `frontend/lib/__tests__/api.test.ts`
- [ ] Component tests for `TaskCard` asserting timer button renders, mode selector appears on click, elapsed time updates, and stop button calls the API
- [ ] All existing frontend tests continue to pass (`pnpm test`)
