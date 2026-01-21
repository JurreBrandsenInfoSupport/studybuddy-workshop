# Add Pomodoro Timer to Study Tasks

## User Story
As a student using StudyBuddy+,
I want to use a pomodoro timer for each task,
so that I can maintain focus during study sessions and track my productivity with timed work intervals and breaks.

## Description
Implement a full-featured pomodoro timer system that follows the classic pomodoro technique (25-minute work sessions, 5-minute short breaks, 15-minute long breaks after 4 pomodoros). Each task should have its own independent timer using a **hybrid architecture**: active timer state managed client-side for responsiveness, with completed sessions and statistics persisted to the backend for permanent storage and cross-device access.

This approach provides the best of both worlds: accurate, lag-free timer countdown in the browser, while ensuring pomodoro completion data survives cache clearing and enables future analytics features.

**Architecture:**
- **Client-side**: Active timer countdown (React state + localStorage for page refresh)
- **Backend**: Permanent storage of completed sessions, statistics, and session history

## Acceptance Criteria

### Timer Functionality
- [ ] Each task has an independent pomodoro timer that can be started, paused, and stopped
- [ ] Timer follows the classic pomodoro pattern:
  - Work session: 25 minutes
  - Short break: 5 minutes (after pomodoros 1, 2, 3)
  - Long break: 15 minutes (after 4th pomodoro)
  - Cycle resets after long break
- [ ] Timer displays current time remaining in MM:SS format
- [ ] Timer updates every second when active
- [ ] Timer can be paused and resumed without losing progress
- [ ] Stop button resets the current session

### Persistence & State Management
- [ ] Active timer state persists in browser localStorage for page refresh (current time, session type)
- [ ] Timer continues counting down correctly after page refresh
- [ ] Completed pomodoro sessions are saved to backend immediately upon completion
- [ ] Pomodoro statistics (total count, session history) persist in backend database
- [ ] Clearing browser cache does NOT remove pomodoro history (stored in backend)
- [ ] Backend stats are loaded on page mount and after each completion
- [ ] Active timer state is isolated per task (multiple tasks can have timers, but only one active)

### Notifications
- [ ] Browser alert displays when work session completes ("Time for a break!")
- [ ] Browser alert displays when break completes ("Time to focus!")
- [ ] User can dismiss alerts and continue to next session
- [ ] Alert includes session type information (e.g., "Pomodoro complete! Time for a 5-minute break.")

### Statistics & Tracking
- [ ] Backend tracks number of completed pomodoros per task
- [ ] Backend stores session history with timestamps (start time, end time, session type)
- [ ] Pomodoro count displays on each task card (e.g., "🍅 3 completed")
- [ ] Statistics are fetched from backend on page load
- [ ] Statistics are updated in backend immediately when pomodoro completes
- [ ] Deleting a task removes all associated timer data from backend
- [ ] Total focus time is calculated from completed work sessions (25min × count)

### UI/UX Design
- [ ] Timer UI follows industry best practices for pomodoro apps
- [ ] Visual indication of current session type (work vs. break)
- [ ] Progress indicator shows current pomodoro in the cycle (e.g., "Pomodoro 2/4")
- [ ] Clear, intuitive controls (start/pause/stop buttons with icons)
- [ ] Timer is visually distinct when active vs. paused vs. idle
- [ ] Responsive design works on mobile and desktop
- [ ] Accessibility: keyboard controls and screen reader support

### Backend API Integration
- [ ] POST /api/tasks/{id}/timer/start endpoint logs session start
- [ ] POST /api/tasks/{id}/timer/complete endpoint records completed pomodoro
- [ ] GET /api/tasks/{id}/timer/stats endpoint returns pomodoro statistics
- [ ] API returns total completed pomodoros and total focus minutes per task
- [ ] Session history includes timestamps and session types
- [ ] API validation ensures only valid session types are recorded
- [ ] Backend handles concurrent session completions correctly

### Error Handling
- [ ] Timer handles browser tab being inactive/backgrounded
- [ ] Timer recovers gracefully from localStorage corruption
- [ ] Clear error messages if localStorage is unavailable
- [ ] Timer doesn't break if system time changes
- [ ] Failed API calls are retried (with exponential backoff)
- [ ] Timer continues working if backend is temporarily unavailable
- [ ] Pending completions are queued and synced when connection restores

## Technical Notes

### Frontend Changes
**New Components:**
- `components/pomodoro-timer.tsx` - Main timer component with controls and display
- `components/timer-stats.tsx` - Display pomodoro completion statistics

**Modified Components:**
- `components/task-card.tsx` - Integrate timer UI into each task card
- `components/study-dashboard.tsx` - Manage timer state in parent component if needed

**New Utilities:**
- `lib/timer-utils.ts` - Timer logic, localStorage management, pomodoro calculations
- `lib/hooks/use-pomodoro.ts` - Custom React hook for timer state management

**Type Definitions:**
- Add timer-related types to `lib/types.ts`:
  - `PomodoroSession`: work | short-break | long-break
  - `TimerState`: current session, time remaining, pomodoro count, isActive, isPaused
  - `PomodoroStats`: completed pomodoros, total time tracked

**Client Storage Schema (localStorage - temporary):**
```typescript
// Key: `pomodoro-active-${taskId}`
{
  sessionType: "work" | "short-break" | "long-break",
  timeRemaining: number, // seconds
  pomodoroCount: number, // 0-4 in current cycle
  isActive: boolean,
  isPaused: boolean,
  lastTick: number, // timestamp for drift calculation
  sessionStartedAt: string // ISO timestamp
}
```

**Backend Storage Schema (Database/In-Memory):**
```typescript
// Added to StudyTask model
interface StudyTask {
  // ... existing fields
  totalPomodoros?: number,
  totalFocusMinutes?: number,
  sessions?: PomodoroSession[]
}

interface PomodoroSession {
  id: string,
  taskId: string,
  sessionType: "work" | "short-break" | "long-break",
  startedAt: DateTime,
  completedAt: DateTime,
  durationMinutes: number
}
```

### Backend Changes
**New API Endpoints (Required):**
- `POST /api/tasks/{id}/timer/start` - Log session start (body: `{ sessionType: string }`)
- `POST /api/tasks/{id}/timer/complete` - Record completed session (body: `{ sessionType: string, durationMinutes: number }`)
- `GET /api/tasks/{id}/timer/stats` - Get statistics (returns: `{ totalPomodoros, totalFocusMinutes, recentSessions }`)
- `GET /api/tasks` - Update response to include `totalPomodoros` and `totalFocusMinutes` fields

**Service Layer Updates:**
- Add timer-related methods to `ITaskService` interface
- Implement session tracking in `InMemoryTaskService`
- Add `PomodoroSession` model with start/end timestamps
- Update `StudyTask` model to include timer statistics

**DTOs:**
- `StartTimerRequest`: `{ sessionType: string }`
- `CompleteTimerRequest`: `{ sessionType: string, durationMinutes: number }`
- `TimerStatsResponse`: `{ totalPomodoros: number, totalFocusMinutes: number, recentSessions: SessionDto[] }`
- Update `TaskResponse` to include timer fields

### Dependencies
- No new npm packages required (use built-in browser APIs)
- Consider `use-interval` pattern for timer ticks
- Use `window.localStorage` API for persistence
- Use `window.Notification` API for future enhancement (replace alerts)

### Browser Compatibility
- localStorage: Supported in all modern browsers
- Alert: Universal support
- Consider feature detection and graceful degradation

## Testing Considerations

### Unit Tests
- Timer countdown logic (decrements correctly, transitions between sessions)
- Pomodoro cycle progression (1→2→3→4→long break→reset)
- localStorage save/load functions
- Timer state calculations after page refresh
- Edge cases: 0 seconds, negative time, invalid session types

### Integration Tests
- Start timer → pause → resume → complete session → verify backend updated
- Complete 4 pomodoros → verify long break triggered and stats correct
- Refresh page mid-session → verify timer resumes correctly from localStorage
- Multiple tasks with independent timers and separate backend stats
- Delete task → verify timer data cleaned up in backend
- Complete pomodoro → verify API call succeeds → verify stats reload
- Network offline → complete pomodoro → verify queued → verify syncs when online
- Backend returns error → verify graceful handling and retry logic

### Manual Testing Scenarios
- [ ] Start timer, refresh page, verify it continues
- [ ] Complete full pomodoro cycle (4 work + 3 short breaks + 1 long break)
- [ ] Test with browser in background tab (timing accuracy)
- [ ] Clear localStorage and verify graceful degradation
- [ ] Test on mobile devices (touch interactions)
- [ ] Verify alerts appear at correct times
- [ ] Test with screen reader for accessibility

### Edge Cases
- System clock changes during active timer
- Browser tab suspended/throttled
- localStorage quota exceeded
- Rapid start/pause/stop interactions
- Task deleted while timer is active

## Implementation Phases

**Phase 1: Backend Foundation**
- Add timer models (`PomodoroSession`, updated `StudyTask`)
- Implement timer service methods in `TaskService`
- Create API endpoints (start, complete, stats)
- Write backend unit tests
- Update DTOs and mappers

**Phase 2: Frontend Core Timer**
- Basic timer component with countdown logic
- Start/pause/stop controls
- Display in MM:SS format
- React state management + localStorage for refresh
- Single 25-minute work session (MVP)

**Phase 3: Pomodoro Cycle & Integration**
- Add break sessions and full cycle logic (short/long breaks)
- Integrate with backend APIs (call on start/complete)
- Add alerts for session transitions
- Progress indicator (pomodoro 1/4)
- Display stats from backend on task cards

**Phase 4: Polish & Resilience**
- Retry logic and offline queue
- UI refinements and animations
- Accessibility improvements
- Comprehensive error handling
- Session history view (optional)

## Related Files
- Frontend: [components/task-card.tsx](../frontend/components/task-card.tsx)
- Frontend: [components/study-dashboard.tsx](../frontend/components/study-dashboard.tsx)
- Frontend: [lib/types.ts](../frontend/lib/types.ts)
- Backend: [Program.cs](../backend/StudyBuddy.Api/Program.cs) (for future API endpoints)
- Backend: [Services/TaskService.cs](../backend/StudyBuddy.Api/Services/TaskService.cs) (for future stats)

## Success Metrics
- Users can complete a full pomodoro cycle without interruption
- Timer state persists 100% of the time across page refreshes
- Zero timer drift over 25-minute session
- Notifications fire within 1 second of session completion
- 80%+ test coverage for timer logic

## Design References
- [Pomofocus](https://pomofocus.io/) - Clean, minimal design
- [Marinara Timer](https://www.marinaratimer.com/) - Progress visualization
- Standard pomodoro technique methodology
