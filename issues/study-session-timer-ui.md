# Add Study Session Timer UI with Pomodoro Support

## User Story
As a student,
I want to track actual time spent on tasks with an integrated timer,
so that I can compare my actual time against estimates and improve my time management using proven techniques like Pomodoro.

## Description
The backend already has timer functionality implemented with both normal and Pomodoro modes (endpoints in [Program.cs](../backend/StudyBuddy.Api/Program.cs) lines 118-173). However, the frontend currently has no UI to interact with this timer system. This feature will bridge that gap by creating a complete timer interface that:

- Displays a visual timer when a student starts tracking time on a task
- Supports two timer modes: **Normal** (continuous) and **Pomodoro** (25-min work intervals with breaks)
- Shows accumulated time across multiple sessions for comparison with estimated time
- Implements the Pomodoro Technique: 25-minute work intervals with 5-minute breaks, and a 20-minute break after 4 intervals

**Key Context:**
- Backend timer endpoints already exist: `POST /api/tasks/{id}/timer/start`, `POST /api/tasks/{id}/timer/stop`, `GET /api/tasks/{id}/timer/active`, `GET /api/tasks/{id}/timer/sessions`
- Timer modes are defined in the backend: `Normal` and `Pomodoro` (case-insensitive)
- The Pomodoro Technique is a time management method using 25-minute focused work intervals ("pomodoros") separated by short breaks, with longer breaks after every 4 intervals

## Acceptance Criteria
- [ ] Add timer control buttons (Start/Stop) to each task card in [task-card.tsx](../frontend/components/task-card.tsx)
- [ ] Create a new `TaskTimer` component that displays:
  - Current timer state (running/stopped)
  - Elapsed time in the current session (MM:SS format)
  - Total accumulated time across all sessions for the task
  - Visual progress indicator for Pomodoro intervals (e.g., 1/4, 2/4, etc.)
- [ ] Add mode selector UI to choose between Normal and Pomodoro timer modes before starting
- [ ] Implement Pomodoro timer logic:
  - 25-minute work intervals
  - Automatic break notifications (5 min after intervals 1-3, 20 min after interval 4)
  - Visual and/or audio notification when a Pomodoro interval completes
  - Option to start the next interval or take a break
- [ ] Add API integration functions to [lib/api.ts](../frontend/lib/api.ts):
  - `startTimer(taskId: string, mode: 'normal' | 'pomodoro')`
  - `stopTimer(taskId: string)`
  - `getActiveTimer(taskId: string)`
  - `getTimerSessions(taskId: string)`
- [ ] Display comparison of total tracked time vs. estimated time on task cards
- [ ] Timer state persists across page refreshes by fetching active timer on component mount
- [ ] Add visual indicator when a timer is actively running (e.g., pulsing dot, colored border)

## Technical Notes

**Frontend Changes:**
- **Components to modify:**
  - [task-card.tsx](../frontend/components/task-card.tsx) - Add timer controls and display
  - Create new `components/task-timer.tsx` - Main timer UI component
- **API layer:** [lib/api.ts](../frontend/lib/api.ts) - Add timer-related API functions
- **Types:** [lib/types.ts](../frontend/lib/types.ts) - Add `TimerSession` and `TimerMode` types to match backend DTOs

**Backend (Already Implemented):**
- Timer endpoints exist in [Program.cs](../backend/StudyBuddy.Api/Program.cs)
- `TimerSession` model in [Models/TimerSession.cs](../backend/StudyBuddy.Api/Models/TimerSession.cs)
- `TimerMode` enum: `Normal` | `Pomodoro` in [Models/TimerMode.cs](../backend/StudyBuddy.Api/Models/TimerMode.cs)

**Pomodoro Implementation Details:**
- Use `setInterval` for counting elapsed seconds in the UI
- Store Pomodoro interval count in component state
- Use browser Notification API for break alerts (with permission)
- Calculate remaining time in interval: `25 * 60 - elapsedSeconds % (25 * 60)`

## Testing Considerations
- **Unit tests for new components:**
  - Timer display updates correctly every second
  - Start/Stop buttons trigger correct API calls
  - Pomodoro intervals transition correctly (work → break → work)
  - Break notifications appear at correct times
- **Integration scenarios:**
  - Starting a timer on one task stops any other active timers (backend behavior)
  - Timer continues running when navigating away and back (state fetch)
  - Multiple completed sessions accumulate time correctly
- **Edge cases:**
  - Page refresh during active timer (should restore state)
  - Network errors during start/stop (display error message)
  - User closes browser during active timer (timer continues on backend, stopped manually later)
  - Pomodoro break declined by user (continue to next interval or stop completely)

## Related Information
- **Pomodoro Technique:** Time management method using 25-min work intervals with structured breaks (5 min short breaks, 20 min long break after 4 intervals)
- **Backend Timer Documentation:** See [StudyBuddy.Api.http](../backend/StudyBuddy.Api/StudyBuddy.Api.http) for API usage examples
