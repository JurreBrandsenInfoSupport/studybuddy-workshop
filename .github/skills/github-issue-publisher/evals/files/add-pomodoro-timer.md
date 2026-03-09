# Add Pomodoro Timer UI to Task Cards

## User Story
As a student,
I want to start a pomodoro or normal timer directly from a task card,
so that I can track focused study time for individual tasks without leaving the dashboard.

## Description
The backend already exposes `POST /api/tasks/{id}/timer/start` (accepting a `mode` of `"normal"` or `"pomodoro"`) and `POST /api/tasks/{id}/timer/stop`. This issue covers building the frontend timer UI that calls these endpoints and displays running time on the relevant task card.

## Acceptance Criteria
- [ ] Each task card shows a "Start Timer" button when no timer is active for that task
- [ ] Clicking "Start Timer" opens a mode selector (Normal / Pomodoro) and starts the timer via the API
- [ ] A running timer displays elapsed time in MM:SS format, updating every second
- [ ] An active timer card shows a "Stop Timer" button; clicking it stops the timer via the API
- [ ] Only one timer can run per task at a time; the button is disabled while another task's timer runs

## Technical Notes
- **Frontend changes:** `task-card.tsx` (add timer section), new `useTimer` hook in `hooks/`
- **Backend changes:** None (endpoints already exist)
- **Database:** None
- **Dependencies:** None

## Testing Considerations
- Unit tests: `useTimer` hook (start/stop logic, elapsed time calculation, interval cleanup)
- Integration tests: timer start and stop flow via mocked API calls on a rendered task card
- Edge cases: stopping a timer that was never started, simultaneous timers on multiple tasks, network error on timer start
