# Test Plan: Issue #14 - Study Session Timer with Pomodoro Support

**Generated**: November 30, 2025

---

## Table of Contents

1. [Overview](#1-overview)
2. [Test Objectives & Strategy](#2-test-objectives--strategy)
3. [Test Scope](#3-test-scope)
4. [Test Types & Coverage](#4-test-types--coverage)
   - [4.1 Unit Tests](#41-unit-tests)
   - [4.2 Integration Tests](#42-integration-tests)
   - [4.3 API Integration Tests](#43-api-integration-tests)
   - [4.4 End-to-End / Manual Tests](#44-end-to-end--manual-tests)
5. [Test Data Strategy](#5-test-data-strategy)
6. [Execution Instructions](#6-execution-instructions)
7. [Entry & Exit Criteria](#7-entry--exit-criteria)
8. [Detailed Test Cases](#8-detailed-test-cases)
9. [Traceability Matrix](#9-traceability-matrix)
10. [Risk Assessment & Mitigation](#10-risk-assessment--mitigation)
11. [Known Issues & Limitations](#11-known-issues--limitations)
12. [Success Criteria Summary](#12-success-criteria-summary)
13. [References & Resources](#13-references--resources)

---

## 1. Overview

### Feature / Change Name
Integrated Study Session Timer with Pomodoro Support

### GitHub Issue Link
https://github.com/JurreBrandsenInfoSupport/studybuddy-workshop/issues/14

### Feature Branch
`copilot/implement-front-end-changes`

### Related Code Areas

**Frontend Changes:**
- `frontend/lib/types.ts` - Extended type definitions (TimerMode, TimerSession, TimerState, PomodoroPhase)
- `frontend/lib/api.ts` - New API methods (startTimer, stopTimer, getActiveTimer, fetchTaskById, getTimerSessions)
- `frontend/hooks/useTimer.ts` - NEW: Custom React hook for timer state management
- `frontend/components/task-timer.tsx` - NEW: Timer UI component with controls and display
- `frontend/components/task-card.tsx` - Integration point for timer component
- `frontend/components/study-dashboard.tsx` - Timer update callback handler
- `frontend/components/__tests__/task-card.test.tsx` - Updated test mocks
- `frontend/components/__tests__/study-dashboard.test.tsx` - Updated test mocks
- `frontend/components/__tests__/task-filters.test.tsx` - Updated test mocks
- `frontend/components/__tests__/add-task-form.test.tsx` - Updated test mocks

**Backend Dependencies:**
- `/api/tasks/{id}/timer/start` - POST endpoint
- `/api/tasks/{id}/timer/stop` - POST endpoint
- `/api/tasks/{id}/timer/active` - GET endpoint
- `/api/tasks/{id}/timer/sessions` - GET endpoint
- `/api/tasks/{id}` - GET endpoint (individual task fetch)

### Summary of Changes

The feature branch `copilot/implement-front-end-changes` implements the **frontend portion only** of the study session timer feature. This implementation adds:

1. **Type System Extensions**: New types for timer modes, sessions, states, and phases
2. **API Client Methods**: Four new API methods to interact with backend timer endpoints
3. **Custom React Hook (`useTimer`)**: Manages timer state with:
   - Idle/Running/Paused state machine
   - `Date.now()` based accuracy (prevents setInterval drift)
   - Automatic Pomodoro phase transitions (25min focus → 5min break)
   - Proper cleanup to prevent memory leaks
4. **Timer Component (`TaskTimer`)**: UI with:
   - Start/Pause/Resume/Stop controls
   - Normal/Pomodoro mode toggle (⏱️/🍅)
   - Visual progress bar for Pomodoro phases
   - Actual vs. estimated time display
   - Browser notifications on phase changes
5. **Integration**: Timer embedded in task cards with callback-based updates

**Critical Note**: The implementation assumes the backend API endpoints exist and are functional. This test plan covers **frontend-only testing** with appropriate mocking strategies.

---

## 2. Test Objectives & Strategy

### Primary Objectives

Map acceptance criteria from issue #14 to test coverage:

| Acceptance Criteria | Test Type | Coverage |
|---------------------|-----------|----------|
| Users can start/stop/pause a timer on tasks | Unit (hook) + Integration (component) | Core timer state transitions, UI button interactions |
| Pomodoro cycles (25/5 min intervals) are supported | Unit (hook logic) + Integration (phase transitions) | Pomodoro mode countdown, phase switching, interval counting |
| Actual versus estimated time is displayed for tasks | Integration (component rendering) | UI display of actualMinutes vs estimatedMinutes |
| Timer integrates into current task workflow UI | Integration (component hierarchy) | TaskCard embedding, props passing, update callbacks |
| User receives break and focus period notifications | Integration (browser API) + Manual | Notification.requestPermission(), new Notification() calls |

### Testing Strategy

**Automated Testing:**
- **Unit Tests**: `useTimer` hook logic (state management, Pomodoro calculations, cleanup)
- **Component Tests**: `TaskTimer` component (rendering, user interactions, API integration)
- **Integration Tests**: `TaskCard` and `StudyDashboard` timer integration

**Manual Testing:**
- Browser notification permissions and display
- Timer accuracy over longer durations
- Tab visibility/backgrounding behavior
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

**Mocking Strategy:**
- **API Calls**: Mock `startTimer`, `stopTimer`, `fetchTaskById` with jest.spyOn
- **Time**: Use `jest.useFakeTimers()` for controlled time advancement
- **Browser APIs**: Mock `Notification` API for permission and display testing
- **Backend Responses**: Mock successful/error responses from timer endpoints

---

## 3. Test Scope

### In-Scope

**Functional Testing:**
- Timer state machine (idle → running → paused → idle)
- Normal mode (count-up, unlimited)
- Pomodoro mode (25min focus, 5min break, phase transitions)
- Time formatting (MM:SS, HH:MM:SS)
- Progress bar calculation and display (Pomodoro only)
- Actual vs. estimated time comparison
- Mode toggle (normal ↔ Pomodoro)
- Browser notifications (permission request, display on phase change)
- API integration (start/stop/fetch calls)
- Timer update callback propagation to parent components

**Non-Functional Testing:**
- Timer accuracy (`Date.now()` comparison vs. `setInterval` drift)
- Memory leak prevention (interval cleanup)
- React hook dependencies (useEffect, useCallback)
- Component re-render optimization

### Out-of-Scope

**Explicitly NOT Covered in Frontend Implementation:**
- Backend timer endpoint implementation (assumes working backend)
- Timer state persistence across browser close/reopen (not implemented)
- Multiple simultaneous timers (backend constraint)
- Timer synchronization across tabs/devices
- Offline timer functionality
- Custom Pomodoro durations (hardcoded to 25/5 minutes)

---

## 4. Test Types & Coverage

### 4.1 Unit Tests

#### Hook: `useTimer.ts`

**File**: `frontend/hooks/__tests__/useTimer.test.ts` (TO BE CREATED)

**Test Categories:**

1. **Initialization**
   - `it("should initialize with idle state and zero seconds")`
   - `it("should initialize with focus phase for Pomodoro mode")`
   - `it("should calculate correct target duration for normal mode (0)")`
   - `it("should calculate correct target duration for Pomodoro focus (1500s)")`
   - `it("should calculate correct target duration for Pomodoro break (300s)")`

2. **State Transitions**
   - `it("should transition from idle to running when start is called")`
   - `it("should transition from running to paused when pause is called")`
   - `it("should transition from paused to running when start is called again")`
   - `it("should transition from running/paused to idle when stop is called")`
   - `it("should reset seconds to zero when stop is called")`

3. **Timer Counting (Normal Mode)**
   - `it("should increment seconds correctly in normal mode")`
   - `it("should continue counting indefinitely in normal mode")`
   - `it("should maintain elapsed time when paused and resumed")`
   - `it("should use Date.now() for accurate time tracking")`

4. **Pomodoro Phase Logic**
   - `it("should transition from focus to break after 25 minutes")`
   - `it("should increment intervals counter when focus ends")`
   - `it("should call onPhaseChange callback with 'break' when focus ends")`
   - `it("should transition from break to focus after 5 minutes")`
   - `it("should call onPhaseChange callback with 'focus' when break ends")`
   - `it("should reset seconds counter on phase transition")`
   - `it("should not increment intervals when break ends (only on focus completion)")`

5. **Cleanup & Memory Leaks**
   - `it("should clear interval when component unmounts")`
   - `it("should clear interval when paused")`
   - `it("should clear interval when stopped")`
   - `it("should not leak memory on multiple start/stop cycles")`

6. **Edge Cases**
   - `it("should handle mode change while timer is running")`
   - `it("should handle rapid start/stop calls")`
   - `it("should handle negative time offsets gracefully")`

**Key Test Utilities:**
```typescript
// Use fake timers for controlled time advancement
jest.useFakeTimers()

// Advance time by specific amount
act(() => {
  jest.advanceTimersByTime(1500000) // 25 minutes
})

// Verify callback invocations
expect(onPhaseChange).toHaveBeenCalledWith('break')
expect(onPhaseChange).toHaveBeenCalledTimes(1)
```

---

#### Component: `task-timer.tsx`

**File**: `frontend/components/__tests__/task-timer.test.tsx` (TO BE CREATED)

**Test Categories:**

1. **Rendering States**
   - `it("should render Start button when timer is idle")`
   - `it("should render mode toggle button when idle")`
   - `it("should render Pause and Stop buttons when timer is running")`
   - `it("should render Resume and Stop buttons when timer is paused")`
   - `it("should display formatted time correctly (MM:SS)")`
   - `it("should display formatted time with hours (HH:MM:SS)")`
   - `it("should display timer icon"`
   - `it("should display actual vs estimated when actualMinutes > 0")`
   - `it("should not display actual vs estimated when actualMinutes is 0")`

2. **Pomodoro Mode Display**
   - `it("should display phase indicator (Focus/Break) in Pomodoro mode")`
   - `it("should display intervals count in Pomodoro mode")`
   - `it("should display progress bar in Pomodoro mode when not idle")`
   - `it("should not display progress bar in normal mode")`
   - `it("should show blue progress bar during focus phase")`
   - `it("should show green progress bar during break phase")`
   - `it("should calculate progress percentage correctly")`

3. **User Interactions**
   - `it("should call startTimer API when Start button is clicked")`
   - `it("should call useTimer.start() after successful API call")`
   - `it("should log error when startTimer API fails")`
   - `it("should call useTimer.pause() when Pause button is clicked")`
   - `it("should call stopTimer API when Stop button is clicked")`
   - `it("should call useTimer.stop() after successful stop API call")`
   - `it("should call onTimerUpdate callback after stopping timer")`
   - `it("should log error when stopTimer API fails")`
   - `it("should toggle mode from normal to Pomodoro")`
   - `it("should toggle mode from Pomodoro to normal")`
   - `it("should display correct emoji for current mode (⏱️/🍅)")`

4. **Notifications**
   - `it("should request notification permission on mount")`
   - `it("should not request permission if already granted")`
   - `it("should show notification on phase change if permission granted")`
   - `it("should not show notification if permission denied")`
   - `it("should display correct notification title for break phase")`
   - `it("should display correct notification body for break phase")`
   - `it("should display correct notification title for focus phase")`
   - `it("should display correct notification body for focus phase")`

5. **Integration with useTimer Hook**
   - `it("should receive state updates from useTimer hook")`
   - `it("should receive seconds updates from useTimer hook")`
   - `it("should receive phase updates from useTimer hook")`
   - `it("should pass mode to useTimer hook")`
   - `it("should pass taskId to useTimer hook")`

**Mock Strategy:**
```typescript
// Mock API methods
jest.mock('@/lib/api', () => ({
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
}))

// Mock Notification API
global.Notification = {
  permission: 'default',
  requestPermission: jest.fn().mockResolvedValue('granted'),
} as any

// Mock useTimer hook
jest.mock('@/hooks/useTimer', () => ({
  useTimer: jest.fn(() => ({
    state: 'idle',
    seconds: 0,
    phase: 'focus',
    intervals: 0,
    targetDuration: 1500,
    start: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
}))
```

---

### 4.2 Integration Tests

#### Component Integration: `task-card.tsx` + `task-timer.tsx`

**File**: `frontend/components/__tests__/task-card.test.tsx` (TO BE UPDATED)

**Test Cases:**

1. **Timer Embedding**
   - `TC-101`: TaskCard renders TaskTimer component
     - **Preconditions**: TaskCard mounted with valid task
     - **Steps**: Render TaskCard, query for timer elements
     - **Expected**: Timer controls visible within card

   - `TC-102`: TaskCard passes task prop to TaskTimer
     - **Preconditions**: TaskCard with task containing actualMinutes and timerSessions
     - **Steps**: Render and inspect props
     - **Expected**: TaskTimer receives correct task object

   - `TC-103`: TaskCard passes onTimerUpdate callback to TaskTimer
     - **Preconditions**: TaskCard with onTimerUpdate mock
     - **Steps**: Trigger timer stop, verify callback called
     - **Expected**: onTimerUpdate invoked with correct taskId

2. **Visual Integration**
   - `TC-104`: Timer appears below task actions
     - **Preconditions**: TaskCard rendered
     - **Steps**: Query DOM structure
     - **Expected**: Timer section after task status buttons

   - `TC-105`: Timer has visual separator from task content
     - **Preconditions**: TaskCard rendered
     - **Steps**: Check for border-top class
     - **Expected**: `border-t border-slate-100` classes present

---

#### Dashboard Integration: `study-dashboard.tsx`

**File**: `frontend/components/__tests__/study-dashboard.test.tsx` (TO BE UPDATED)

**Test Cases:**

1. **Timer Update Flow**
   - `TC-201`: handleTimerUpdate fetches updated task
     - **Preconditions**: Dashboard with tasks, timer stopped
     - **Steps**: Call handleTimerUpdate, mock fetchTaskById
     - **Expected**: fetchTaskById called with correct id

   - `TC-202`: Task list updates after timer update
     - **Preconditions**: Dashboard with task (id=1, actualMinutes=0)
     - **Steps**: Mock fetchTaskById returning actualMinutes=25, call handleTimerUpdate
     - **Expected**: Task in list updated with actualMinutes=25

   - `TC-203`: Other tasks unaffected by timer update
     - **Preconditions**: Dashboard with 3 tasks
     - **Steps**: Update timer for task 1
     - **Expected**: Tasks 2 and 3 unchanged

2. **Error Handling**
   - `TC-204`: Logs error when fetchTaskById fails
     - **Preconditions**: Mock fetchTaskById rejection
     - **Steps**: Call handleTimerUpdate, check console.error
     - **Expected**: Error logged, UI stable

---

### 4.3 API Integration Tests

**File**: `frontend/lib/__tests__/api.test.ts` (TO BE UPDATED)

**Test Cases:**

1. **fetchTaskById**
   - `TC-301`: Successful task fetch
     - **Input**: `fetchTaskById("1")`
     - **Mock Response**: 200 OK, `{ id: "1", title: "Test", actualMinutes: 10, ... }`
     - **Expected**: Resolves with StudyTask object

   - `TC-302`: Failed task fetch
     - **Input**: `fetchTaskById("999")`
     - **Mock Response**: 404 Not Found
     - **Expected**: Rejects with "Failed to fetch task"

2. **startTimer**
   - `TC-303`: Start timer in normal mode
     - **Input**: `startTimer("1", "normal")`
     - **Mock Request**: POST `/api/tasks/1/timer/start`, body: `{ mode: "normal" }`
     - **Mock Response**: 200 OK, `{ id: "s1", taskId: "1", mode: "normal", ... }`
     - **Expected**: Resolves with TimerSession object

   - `TC-304`: Start timer in Pomodoro mode
     - **Input**: `startTimer("1", "pomodoro")`
     - **Mock Request**: POST `/api/tasks/1/timer/start`, body: `{ mode: "pomodoro" }`
     - **Mock Response**: 200 OK, `{ id: "s1", taskId: "1", mode: "pomodoro", ... }`
     - **Expected**: Resolves with TimerSession

   - `TC-305`: Start timer API failure
     - **Input**: `startTimer("1", "normal")`
     - **Mock Response**: 500 Internal Server Error
     - **Expected**: Rejects with "Failed to start timer"

3. **stopTimer**
   - `TC-306`: Stop timer successfully
     - **Input**: `stopTimer("1")`
     - **Mock Request**: POST `/api/tasks/1/timer/stop`
     - **Mock Response**: 200 OK, `{ id: "s1", endedAt: "2024-01-01T00:25:00Z", durationSeconds: 1500, ... }`
     - **Expected**: Resolves with completed TimerSession

   - `TC-307`: Stop timer when no active timer
     - **Input**: `stopTimer("1")`
     - **Mock Response**: 404 Not Found
     - **Expected**: Rejects with "Failed to stop timer"

4. **getActiveTimer**
   - `TC-308`: Get active timer when exists
     - **Input**: `getActiveTimer("1")`
     - **Mock Response**: 200 OK, `{ id: "s1", taskId: "1", startedAt: "...", endedAt: null, ... }`
     - **Expected**: Resolves with TimerSession

   - `TC-309`: Get active timer when none exists
     - **Input**: `getActiveTimer("1")`
     - **Mock Response**: 404 Not Found
     - **Expected**: Resolves with null (not rejection)

5. **getTimerSessions**
   - `TC-310`: Get timer sessions list
     - **Input**: `getTimerSessions("1")`
     - **Mock Response**: 200 OK, `[{ id: "s1", ... }, { id: "s2", ... }]`
     - **Expected**: Resolves with TimerSession array

   - `TC-311`: Get timer sessions when none exist
     - **Input**: `getTimerSessions("1")`
     - **Mock Response**: 200 OK, `[]`
     - **Expected**: Resolves with empty array

---

### 4.4 End-to-End / Manual Tests

**Manual Testing Checklist:**

#### Normal Timer Mode

- [ ] **TC-401**: Start timer in normal mode
  - **Steps**: Click task card, click Start button
  - **Expected**: Timer starts counting up (0:00, 0:01, 0:02, ...)
  - **Validation**: API call to `/api/tasks/{id}/timer/start` with `mode: "normal"`

- [ ] **TC-402**: Pause timer in normal mode
  - **Steps**: Start timer, wait 10 seconds, click Pause
  - **Expected**: Timer stops at ~0:10, displays Resume button
  - **Validation**: Seconds value frozen

- [ ] **TC-403**: Resume timer in normal mode
  - **Steps**: Pause timer at 0:10, click Resume
  - **Expected**: Timer continues from 0:10 (0:11, 0:12, ...)
  - **Validation**: No time lost during pause

- [ ] **TC-404**: Stop timer in normal mode
  - **Steps**: Start timer, wait 30 seconds, click Stop
  - **Expected**: Timer resets to 0:00, shows Start button, actualMinutes updates in task card
  - **Validation**: API call to `/api/tasks/{id}/timer/stop`, task refreshed

- [ ] **TC-405**: Timer displays hours correctly
  - **Steps**: Mock seconds=3665 (1 hour, 1 minute, 5 seconds)
  - **Expected**: Displays "1:01:05"

#### Pomodoro Mode

- [ ] **TC-501**: Toggle to Pomodoro mode
  - **Steps**: Click mode toggle button (⏱️)
  - **Expected**: Button shows 🍅, timer displays "Focus • 0 intervals"

- [ ] **TC-502**: Pomodoro focus countdown
  - **Steps**: Start Pomodoro timer, observe for 5 seconds
  - **Expected**: Progress bar appears (blue), time counts up, progress bar fills

- [ ] **TC-503**: Pomodoro focus → break transition
  - **Steps**: Fast-forward to 25:00 (use Date.now() mock or wait)
  - **Expected**:
    - Notification "Break Time! 🎉" appears
    - Phase changes to "Break"
    - Intervals increments to 1
    - Timer resets to 0:00
    - Progress bar turns green

- [ ] **TC-504**: Pomodoro break → focus transition
  - **Steps**: Complete break phase (5:00)
  - **Expected**:
    - Notification "Focus Time! 📚" appears
    - Phase changes to "Focus"
    - Intervals remains at 1
    - Timer resets to 0:00
    - Progress bar turns blue

- [ ] **TC-505**: Stop timer during Pomodoro focus
  - **Steps**: Start Pomodoro, stop at 10:00 during focus
  - **Expected**: Timer stops, resets, actualMinutes updated with ~10 minutes

- [ ] **TC-506**: Toggle mode during active timer
  - **Steps**: Start normal timer, toggle to Pomodoro while running
  - **Expected**: (Implementation-dependent - document observed behavior)

#### Actual vs. Estimated Time Display

- [ ] **TC-601**: No display when actualMinutes is 0
  - **Steps**: View task with estimatedMinutes=60, actualMinutes=0
  - **Expected**: No "X / Y min" text visible

- [ ] **TC-602**: Display appears after timer stopped
  - **Steps**: Run timer for 30 seconds, stop
  - **Expected**: "0 / 60 min" or "1 / 60 min" appears (depends on rounding)

- [ ] **TC-603**: Display updates on subsequent timer sessions
  - **Steps**: Run timer twice (10 min each), stop both
  - **Expected**: "20 / 60 min" or similar

#### Notifications

- [ ] **TC-701**: Permission request on first load
  - **Steps**: Load app, open task with timer
  - **Expected**: Browser prompts for notification permission

- [ ] **TC-702**: No notification if permission denied
  - **Steps**: Deny permission, complete Pomodoro focus phase
  - **Expected**: No notification shown, timer still transitions

- [ ] **TC-703**: Notification content for break
  - **Steps**: Grant permission, complete focus phase
  - **Expected**: Notification title "Break Time! 🎉", body "Take a 5-minute break"

- [ ] **TC-704**: Notification content for focus
  - **Steps**: Complete break phase
  - **Expected**: Notification title "Focus Time! 📚", body "Time to focus for 25 minutes"

#### Edge Cases & Error Handling

- [ ] **TC-801**: Backend API unavailable
  - **Steps**: Stop backend, try to start timer
  - **Expected**: Error logged in console, timer doesn't start, user sees no broken UI

- [ ] **TC-802**: Browser tab hidden during timer
  - **Steps**: Start timer, switch to another tab for 1 minute, return
  - **Expected**: Timer continues counting (may have minor drift warning)

- [ ] **TC-803**: Browser refresh during active timer
  - **Steps**: Start timer, refresh page
  - **Expected**: Timer resets to idle (no persistence implemented)

- [ ] **TC-804**: Rapid start/stop clicks
  - **Steps**: Click Start/Stop 10 times rapidly
  - **Expected**: No errors, timer handles state correctly

- [ ] **TC-805**: Delete task with active timer
  - **Steps**: Start timer, delete task
  - **Expected**: Task removed, no errors

---

## 5. Test Data Strategy

### Mock Task Data

**Basic Task (Idle Timer):**
```typescript
const mockTask: StudyTask = {
  id: "1",
  title: "Study React Hooks",
  subject: "Computer Science",
  estimatedMinutes: 120,
  status: "in-progress",
  createdAt: "2024-01-01T00:00:00Z",
  actualMinutes: 0,
  timerSessions: [],
}
```

**Task with Actual Time:**
```typescript
const mockTaskWithTime: StudyTask = {
  id: "2",
  title: "Complete Math Assignment",
  subject: "Mathematics",
  estimatedMinutes: 60,
  status: "in-progress",
  createdAt: "2024-01-01T00:00:00Z",
  actualMinutes: 45,
  timerSessions: [
    {
      id: "s1",
      taskId: "2",
      startedAt: "2024-01-01T10:00:00Z",
      endedAt: "2024-01-01T10:30:00Z",
      durationSeconds: 1800,
      mode: "normal",
      pomodoroIntervals: 0,
    },
    {
      id: "s2",
      taskId: "2",
      startedAt: "2024-01-01T11:00:00Z",
      endedAt: "2024-01-01T11:15:00Z",
      durationSeconds: 900,
      mode: "pomodoro",
      pomodoroIntervals: 1,
    },
  ],
}
```

**Active Timer Session:**
```typescript
const mockActiveSession: TimerSession = {
  id: "s3",
  taskId: "1",
  startedAt: "2024-01-01T12:00:00Z",
  endedAt: null,
  durationSeconds: 0,
  mode: "normal",
  pomodoroIntervals: 0,
}
```

### Test Fixtures

No database or seed data required (frontend-only testing). All data mocked via Jest.

**Reusable Mocks:**
- `mockFetchTaskById(taskId, overrides)` - Returns customizable StudyTask
- `mockStartTimerResponse(mode)` - Returns TimerSession
- `mockStopTimerResponse(durationSeconds)` - Returns completed TimerSession
- `mockNotificationAPI(permission)` - Mocks Notification with given permission state

**Mock Reset Strategy:**
Between tests:
```typescript
beforeEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
  mockFetch.mockReset()
})
```

---

## 6. Execution Instructions

### Unit Tests

**Command:**
```powershell
cd frontend
pnpm test hooks/useTimer.test.ts components/task-timer.test.tsx
```

**What it validates:**
- Timer hook logic (state machine, Pomodoro calculations)
- Timer component rendering and interactions
- Notification permission handling

**Expected outcome:**
- All tests pass with 100% coverage for hook and component
- No console errors or warnings
- Test execution time < 5 seconds

---

### Integration Tests

**Command:**
```powershell
cd frontend
pnpm test components/__tests__/task-card.test.tsx components/__tests__/study-dashboard.test.tsx
```

**What it validates:**
- Timer integration into TaskCard
- Dashboard timer update flow
- Props passing and callback invocation

**Expected outcome:**
- All existing tests + new timer integration tests pass
- No regressions in task card or dashboard functionality

---

### API Client Tests

**Command:**
```powershell
cd frontend
pnpm test lib/__tests__/api.test.ts
```

**What it validates:**
- HTTP requests to timer endpoints
- Request body formatting
- Response parsing
- Error handling

**Expected outcome:**
- All 11 API test cases pass
- Correct fetch() calls with proper headers and payloads

---

### Full Test Suite

**Command:**
```powershell
cd frontend
pnpm test
```

**What it validates:**
- All unit tests
- All component tests
- All integration tests
- No TypeScript errors

**Expected outcome:**
- All tests pass (frontend should have ~50+ tests total after additions)
- Test coverage > 80% for new code
- No failing snapshots

---

### Linting & Static Analysis

**Commands:**
```powershell
cd frontend
pnpm lint
npm run type-check  # Or: npx tsc --noEmit
```

**What it validates:**
- ESLint rules compliance
- TypeScript type safety
- No unused variables or imports

**Expected outcome:**
- 0 linting errors
- 0 TypeScript compilation errors

---

### Manual Testing

**Prerequisite: Start Backend**
```powershell
cd backend
dotnet run --project StudyBuddy.Api
```
*Backend must be running with timer endpoints implemented at http://localhost:3001*

**Start Frontend:**
```powershell
cd frontend
pnpm dev
```
*Frontend runs at http://localhost:3000*

**Execution:**
Execute manual test cases TC-401 through TC-805 listed in section 4.4 above. Use browser DevTools for:
- Network tab: Verify API calls
- Console: Check for errors
- Application tab: Inspect Notification permission

---

## 7. Entry & Exit Criteria

### Test Entry Criteria

**Required Setup:**
- [x] Feature branch `copilot/implement-front-end-changes` checked out
- [x] `pnpm install` completed successfully
- [x] Backend API running with timer endpoints implemented
- [x] Environment variable `NEXT_PUBLIC_API_URL` set (or defaults to http://localhost:3001)

**Code Completeness:**
- [x] All TypeScript files compile without errors
- [x] No placeholder comments like `// TODO: implement`
- [x] All imports resolve correctly

---

### Test Exit Criteria

**Automated Tests:**
- [ ] All new unit tests pass (useTimer hook: minimum 20 tests)
- [ ] All new component tests pass (TaskTimer: minimum 15 tests)
- [ ] All integration tests pass (TaskCard + Dashboard updates)
- [ ] All API tests pass (5 new API methods tested)
- [ ] No regressions in existing tests
- [ ] Test coverage > 80% for new code

**Quality Gates:**
- [ ] ESLint passes with 0 errors
- [ ] TypeScript compilation successful
- [ ] No console errors during test execution
- [ ] All mocks properly cleaned up (no memory leaks)

**Acceptance Criteria Coverage:**
- [ ] AC1: Users can start/stop/pause timer - VERIFIED (unit + component tests)
- [ ] AC2: Pomodoro cycles supported - VERIFIED (hook logic + phase transition tests)
- [ ] AC3: Actual vs. estimated displayed - VERIFIED (component rendering tests)
- [ ] AC4: Timer integrates into workflow - VERIFIED (integration tests)
- [ ] AC5: Notifications sent - PARTIALLY VERIFIED (mocked in tests, requires manual verification)

**Manual Testing:**
- [ ] All critical paths tested (TC-401 through TC-506)
- [ ] Notifications work in at least 1 browser
- [ ] No visual regressions in task cards or dashboard
- [ ] Timer accuracy verified over 5+ minutes

**Defect Resolution:**
- [ ] No P0 (blocker) or P1 (critical) defects open
- [ ] All P2 (major) defects documented with workarounds

---

## 8. Detailed Test Cases

Below is a comprehensive table of all test cases with full details:

| TC ID | Title | Type | Related AC | Preconditions | Steps | Input Data | Expected Result | Priority | Notes |
|-------|-------|------|------------|---------------|-------|------------|-----------------|----------|-------|
| TC-101 | TaskCard renders TaskTimer component | Integration | AC4 | TaskCard with valid task | 1. Render TaskCard<br>2. Query for timer elements | `task = { id: "1", actualMinutes: 0, ... }` | Timer controls visible, Start button present | P0 | Core integration |
| TC-102 | TaskCard passes task prop correctly | Integration | AC4 | TaskCard with task | 1. Render TaskCard<br>2. Inspect TaskTimer props | `task = mockTaskWithTime` | TaskTimer receives actualMinutes=45 | P1 | Data flow |
| TC-103 | onTimerUpdate callback invoked | Integration | AC4 | TaskCard with callback | 1. Mount TaskCard<br>2. Start timer<br>3. Stop timer | `onTimerUpdate = jest.fn()` | Callback called with task.id | P1 | Update mechanism |
| TC-201 | Dashboard fetches updated task | Integration | AC3 | Dashboard with tasks | 1. Call handleTimerUpdate<br>2. Mock fetchTaskById | `taskId = "1"` | fetchTaskById called with "1" | P1 | Refresh logic |
| TC-202 | Task list updates after fetch | Integration | AC3 | Task with actualMinutes=0 | 1. Mock API returning actualMinutes=25<br>2. handleTimerUpdate<br>3. Check state | `taskId = "1"` | Task in list has actualMinutes=25 | P0 | State update |
| TC-301 | fetchTaskById success | Unit | - | Valid task ID | 1. Call fetchTaskById<br>2. Mock 200 response | `id = "1"` | Resolves with StudyTask | P1 | API integration |
| TC-303 | startTimer in normal mode | Unit | AC1 | Valid task ID | 1. Call startTimer<br>2. Verify POST request | `taskId = "1", mode = "normal"` | POST to /api/tasks/1/timer/start, body { mode: "normal" } | P0 | Core API |
| TC-304 | startTimer in Pomodoro mode | Unit | AC2 | Valid task ID | 1. Call startTimer<br>2. Verify request body | `taskId = "1", mode = "pomodoro"` | POST with { mode: "pomodoro" } | P0 | Pomodoro support |
| TC-306 | stopTimer success | Unit | AC1 | Active timer | 1. Call stopTimer<br>2. Mock 200 response | `taskId = "1"` | Resolves with completed TimerSession | P0 | Core API |
| TC-309 | getActiveTimer returns null when none | Unit | - | No active timer | 1. Call getActiveTimer<br>2. Mock 404 response | `taskId = "1"` | Resolves with null (not rejection) | P1 | Edge case handling |
| TC-401 | Start timer (normal mode) | Manual | AC1 | Task displayed | 1. Click Start button<br>2. Observe timer | Task in "in-progress" status | Timer counts up: 0:00, 0:01, 0:02... | P0 | End-to-end flow |
| TC-402 | Pause timer | Manual | AC1 | Timer running | 1. Start timer<br>2. Wait 10s<br>3. Click Pause | Timer at ~0:10 | Timer frozen at 0:10, Resume button visible | P0 | Pause functionality |
| TC-403 | Resume timer | Manual | AC1 | Timer paused at 0:10 | 1. Click Resume<br>2. Observe | Timer paused | Timer continues from 0:10 | P0 | Resume functionality |
| TC-404 | Stop timer and update task | Manual | AC1, AC3 | Timer at 0:30 | 1. Click Stop<br>2. Check API call<br>3. Verify task update | Timer running | Timer resets to 0:00, actualMinutes += 0 or 1 (depends on rounding) | P0 | Full cycle |
| TC-501 | Toggle to Pomodoro mode | Manual | AC2 | Timer idle | 1. Click mode toggle (⏱️) | Timer idle | Button shows 🍅, displays "Focus • 0 intervals" | P0 | Mode switching |
| TC-502 | Pomodoro countdown and progress | Manual | AC2 | Pomodoro timer started | 1. Start Pomodoro<br>2. Observe for 10s | Focus phase | Blue progress bar fills, time increments | P0 | Visual feedback |
| TC-503 | Focus → Break transition | Manual | AC2, AC5 | Pomodoro at 25:00 | 1. Wait or fast-forward to 25:00<br>2. Observe | Focus at 25:00 | Notification appears, phase="Break", intervals=1, timer resets, green bar | P0 | Critical transition |
| TC-504 | Break → Focus transition | Manual | AC2, AC5 | Break at 5:00 | 1. Complete break phase | Break at 5:00 | Notification appears, phase="Focus", timer resets, blue bar | P0 | Critical transition |
| TC-601 | No display when actualMinutes=0 | Manual | AC3 | New task | 1. View task with estimatedMinutes=60 | actualMinutes=0 | No "X / Y min" text visible | P1 | Conditional display |
| TC-602 | Display after first session | Manual | AC3 | Timer stopped after 30s | 1. Run timer 30s<br>2. Stop<br>3. Check display | actualMinutes=0 initially | "0 / 60 min" or "1 / 60 min" appears | P0 | Validation |
| TC-701 | Notification permission request | Manual | AC5 | First app load | 1. Open task<br>2. Check browser prompt | None | Browser requests notification permission | P1 | Permission flow |
| TC-702 | No notification if denied | Manual | AC5 | Permission denied | 1. Deny permission<br>2. Complete focus phase | Permission=denied | No notification shown, timer still works | P2 | Graceful degradation |
| TC-703 | Break notification content | Manual | AC5 | Permission granted, focus complete | 1. Complete 25min focus | Permission=granted | Notification: "Break Time! 🎉", body: "Take a 5-minute break" | P1 | Content validation |
| TC-801 | Backend unavailable | Manual | - | Backend stopped | 1. Stop backend<br>2. Try to start timer | Backend down | Error logged, timer doesn't start, UI stable | P2 | Error handling |
| TC-802 | Tab backgrounding | Manual | - | Timer running | 1. Start timer<br>2. Switch tabs for 60s<br>3. Return | Timer at 0:10 | Timer at ~1:10 (may have minor drift) | P2 | Background behavior |
| TC-803 | Browser refresh | Manual | - | Timer running | 1. Start timer<br>2. Refresh page | Timer at 0:15 | Timer resets to idle (no persistence) | P2 | Documented limitation |

---

## 9. Traceability Matrix

| Acceptance Criterion | Test Cases Covering | Pass Criteria |
|----------------------|---------------------|---------------|
| **AC1**: Users can start/stop/pause a timer on tasks | TC-101, TC-103, TC-303, TC-306, TC-401, TC-402, TC-403, TC-404 | All 8 tests pass |
| **AC2**: Pomodoro cycles (25/5 min intervals) are supported | TC-304, TC-501, TC-502, TC-503, TC-504 + Hook unit tests | 5+ tests pass, phase transitions work |
| **AC3**: Actual versus estimated time is displayed for tasks | TC-202, TC-601, TC-602 | Display updates correctly after timer stops |
| **AC4**: Timer integrates into current task workflow UI | TC-101, TC-102, TC-103, TC-201 | Timer embedded in TaskCard, callbacks work |
| **AC5**: User receives break and focus period notifications | TC-503, TC-504, TC-701, TC-702, TC-703 | Notifications appear on phase change (manual verification) |

---

## 10. Risk Assessment & Mitigation

### High-Risk Areas

1. **Timer Accuracy Drift**
   - **Risk**: `setInterval` can drift over long periods (browser throttling)
   - **Mitigation**: Implementation uses `Date.now()` comparison for accuracy
   - **Test Coverage**: Manual testing over 5+ minutes (TC-802)

2. **Notification Permissions**
   - **Risk**: Users may deny permissions, breaking UX expectations
   - **Mitigation**: Notifications are optional, timer works without them
   - **Test Coverage**: TC-702 verifies graceful degradation

3. **Backend API Failures**
   - **Risk**: Backend down or endpoints not implemented
   - **Mitigation**: Frontend handles errors, logs to console
   - **Test Coverage**: TC-305, TC-307, TC-801 test error paths

4. **Memory Leaks**
   - **Risk**: Intervals not cleared on unmount/stop
   - **Mitigation**: useEffect cleanup functions implemented
   - **Test Coverage**: Hook cleanup tests verify interval clearing

5. **State Synchronization**
   - **Risk**: Frontend timer state out of sync with backend
   - **Mitigation**: Backend is source of truth for actualMinutes
   - **Test Coverage**: TC-202 verifies task refresh after stop

### Medium-Risk Areas

- **Cross-Browser Compatibility**: Notifications behave differently in Safari vs Chrome
  - **Mitigation**: Manual testing in multiple browsers (Edge, Chrome, Firefox)

- **Tab Backgrounding**: Browsers throttle timers in background tabs
  - **Mitigation**: Documented limitation, minor drift acceptable
  - **Test Coverage**: TC-802 verifies behavior

### Low-Risk Areas

- **Styling Conflicts**: Timer CSS may clash with existing task card styles
  - **Mitigation**: Uses existing Tailwind utility classes
  - **Test Coverage**: Visual regression checks during manual testing

---

## 11. Known Issues & Limitations

### Implementation Limitations (Not Defects)

1. **No Timer Persistence**: Refreshing browser resets timer to idle (TC-803)
   - **Reason**: Frontend-only implementation, no localStorage
   - **Workaround**: None; document as known limitation

2. **Single Active Timer per Task**: Backend limitation (assumed)
   - **Impact**: Cannot run multiple timers simultaneously
   - **Workaround**: Stop previous timer before starting new one

3. **Fixed Pomodoro Durations**: Hardcoded to 25min/5min
   - **Reason**: Simplicity, matches standard Pomodoro technique
   - **Future Enhancement**: Allow user customization

4. **No Offline Support**: Timer requires backend API connectivity
   - **Impact**: Timer won't start if backend is down
   - **Workaround**: None; backend must be available

### Browser-Specific Considerations

- **Safari**: Notification permission prompt may behave differently
- **Firefox**: May throttle timers more aggressively in background tabs
- **Mobile Browsers**: Not explicitly tested (future work)

---

## 12. Success Criteria Summary

The test plan is successfully executed when:

**Automated Testing:**
✅ All 50+ unit/component/integration tests pass
✅ Test coverage ≥ 80% for new code (useTimer.ts, TaskTimer.tsx, API methods)
✅ No TypeScript errors
✅ No ESLint errors
✅ No console errors during test execution

**Manual Testing:**
✅ All P0 and P1 manual test cases executed and passed
✅ Notifications verified in at least 2 browsers
✅ Timer accuracy validated over 5+ minute session
✅ Visual appearance matches existing UI patterns

**Acceptance Criteria:**
✅ AC1-AC4 fully automated and passing
✅ AC5 manually verified with notifications working

**Quality:**
✅ No P0/P1 defects remaining open
✅ All code reviewed and approved
✅ Documentation updated (if needed)

---

## 13. References & Resources

### Implementation Documentation

- **GitHub Issue**: https://github.com/JurreBrandsenInfoSupport/studybuddy-workshop/issues/14
- **Pull Request**: https://github.com/JurreBrandsenInfoSupport/studybuddy-workshop/pull/16
- **Implementation Plan (Comment)**: https://github.com/JurreBrandsenInfoSupport/studybuddy-workshop/issues/14#issuecomment-3591550473

### Technical References

- **React useEffect Cleanup**: https://react.dev/reference/react/useEffect#connecting-to-an-external-system
- **Notifications API**: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
- **Jest Fake Timers**: https://jestjs.io/docs/timer-mocks
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Pomodoro Technique**: https://en.wikipedia.org/wiki/Pomodoro_Technique

### Project-Specific Documentation

- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Frontend README**: `frontend/README.md`
- **Backend README**: `backend/README.md`

---

**END OF TEST PLAN**

*This test plan is ready for execution by QA engineers or automated testing agents. All test cases are detailed enough to execute without additional context.*
