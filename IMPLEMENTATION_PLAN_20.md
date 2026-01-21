# Implementation Plan: Add Pomodoro Timer to Study Tasks

**GitHub Issue:** [#20 - Add Pomodoro Timer to Study Tasks](https://github.com/JurreBrandsenInfoSupport/studybuddy-workshop/issues/20)

## 1. Overview

### Summary
Implement a full-featured pomodoro timer system following the classic technique (25min work, 5min short break, 15min long break after 4 pomodoros). Each task will have an independent timer using a **hybrid architecture**: client-side countdown for responsiveness with backend persistence for completed sessions and statistics.

### High-Level Approach
1. **Phase 1 - Backend Foundation**: Add timer models, service methods, and API endpoints
2. **Phase 2 - Frontend Core Timer**: Build timer component with countdown logic and localStorage
3. **Phase 3 - Pomodoro Cycle & Integration**: Implement full cycle logic and backend sync
4. **Phase 4 - Polish & Resilience**: Add retry logic, animations, and comprehensive error handling

### Key Design Decisions
- **Hybrid Architecture**: Active timer in browser (no lag), completed sessions in backend (permanent data)
- **localStorage for Refresh**: Timer survives page reload without losing current progress
- **Backend for History**: All completed pomodoros stored permanently for analytics
- **Per-Task Timers**: Each task has independent timer state
- **Simple Alerts**: Browser `window.alert()` for MVP (can enhance later with toast notifications)

---

## 2. Context & References

### Work Item Type
**Feature** - New functionality requiring both frontend UI and backend API additions

### Component Type
- **Backend**: REST API endpoints + service layer methods + in-memory data models
- **Frontend**: React components + custom hooks + localStorage utilities

### Documentation Links
- [React useEffect Documentation](https://react.dev/reference/react/useEffect) - Timer interval management
- [React Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) - Effect cleanup patterns
- [MDN localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Browser storage
- [MDN setTimeout/clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) - Timer implementation
- [Pomofocus](https://pomofocus.io/) - Design reference for UI/UX

### Code Examples from Codebase

**Backend API Endpoint Pattern** ([Program.cs](backend/StudyBuddy.Api/Program.cs#L40-L56)):
```csharp
app.MapGet("/api/tasks/{id}", (string id, ITaskService taskService) =>
{
    var task = taskService.GetTaskById(id);
    if (task == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }
    return Results.Ok(task.ToResponse());
})
.WithName("GetTaskById")
.WithOpenApi();
```

**Backend POST Endpoint Pattern** ([Program.cs](backend/StudyBuddy.Api/Program.cs#L59-L74)):
```csharp
app.MapPost("/api/tasks", ([FromBody] CreateTaskRequest request, ITaskService taskService) =>
{
    if (string.IsNullOrWhiteSpace(request.Title) ||
        string.IsNullOrWhiteSpace(request.Subject))
    {
        return Results.BadRequest(new { error = "Missing required fields" });
    }

    var task = taskService.CreateTask(request);
    return Results.Created($"/api/tasks/{task.Id}", task.ToResponse());
})
.WithName("CreateTask")
.WithOpenApi();
```

**Service Layer Pattern** ([TaskService.cs](backend/StudyBuddy.Api/Services/TaskService.cs#L87-L100)):
```csharp
public StudyTask CreateTask(CreateTaskRequest request)
{
    lock (_lock)
    {
        var task = new StudyTask
        {
            Id = _nextId.ToString(),
            Title = request.Title,
            Subject = request.Subject,
            EstimatedMinutes = request.EstimatedMinutes,
            Status = StudyTaskStatus.Todo,
            CreatedAt = DateTime.UtcNow
        };

        _nextId++;
        _tasks.Add(task);
        return task;
    }
}
```

**Frontend API Call Pattern** ([api.ts](frontend/lib/api.ts#L15-L29)):
```typescript
export async function createTask(input: CreateTaskInput): Promise<StudyTask> {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error("Failed to create task")
  }

  return res.json()
}
```

**Frontend Component Pattern** ([task-card.tsx](frontend/components/task-card.tsx#L1-L25)):
```tsx
"use client"
import type { StudyTask, TaskStatus } from "@/lib/types"

interface TaskCardProps {
  task: StudyTask
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isUpdating: boolean
}

export function TaskCard({ task, onStatusChange, onDelete, isUpdating }: TaskCardProps) {
  const statusColors = {
    todo: "bg-white border-slate-200 hover:border-indigo-300",
    "in-progress": "bg-blue-50/50 border-blue-200 hover:border-blue-300",
    done: "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300",
  }

  // Component implementation...
}
```

### Architectural Patterns

**Backend Patterns:**
- **Minimal APIs**: No controllers, all endpoints in `Program.cs` using `app.MapGet/Post/Patch/Delete`
- **Service Layer**: Business logic in `ITaskService` interface, implemented by `InMemoryTaskService`
- **Singleton Services**: Services registered as `AddSingleton<ITaskService, InMemoryTaskService>()` for in-memory storage
- **DTOs vs Models**: Services use `StudyTask` model, API returns `TaskResponse` DTO via `.ToResponse()` mapper
- **Error Responses**: Return `{ error: "message" }` objects, not plain strings
- **Thread Safety**: Use `lock (_lock)` for all list operations in `InMemoryTaskService`

**Frontend Patterns:**
- **Client Components**: All interactive components have `"use client"` directive at top
- **API Client**: All API calls go through functions in `lib/api.ts`, never inline fetch
- **Type Safety**: Types defined in `lib/types.ts`, imported across components
- **State Management**: React `useState` only - no Redux/Zustand
- **Error Handling**: User-friendly messages in UI, technical details in console.error
- **UI Library**: Radix UI primitives + Tailwind CSS (no custom component library)

**Testing Patterns:**
- **Backend**: `WebApplicationFactory<Program>` for integration tests, FluentAssertions for assertions
- **Frontend**: `jest.mock()` to mock `lib/api.ts`, `@testing-library/react` for component testing
- **Test Reset**: Backend tests call `_taskService.Reset()` before/after each test
- **Test Coverage**: Target **minimum 80% line coverage** for all new/modified code

### Integration Points

**Backend ↔ Frontend API Contract:**
- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:5000` dev, `http://localhost:3001` docker)
- **CORS**: Backend allows all origins via `AddCors()` in `Program.cs`
- **Data Format**: JSON request/response bodies
- **Status Codes**: Use proper HTTP codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found)
- **Error Format**: `{ error: "message" }` objects

**localStorage Schema:**
```typescript
// Key pattern: `pomodoro-active-${taskId}`
{
  sessionType: "work" | "short-break" | "long-break",
  timeRemaining: number,        // seconds
  pomodoroCount: number,         // 0-4 (position in cycle)
  isActive: boolean,
  isPaused: boolean,
  lastTick: number,             // timestamp for drift calculation
  sessionStartedAt: string      // ISO timestamp
}
```

**Backend Storage Schema:**
```csharp
// Added to StudyTask model
public int? TotalPomodoros { get; set; }
public int? TotalFocusMinutes { get; set; }
public List<PomodoroSession> Sessions { get; set; } = new();

// New model
public class PomodoroSession
{
    public string Id { get; set; }
    public string TaskId { get; set; }
    public string SessionType { get; set; }  // work, short-break, long-break
    public DateTime StartedAt { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
}
```

### Related Work Items
None - This is a standalone feature

### Known Issues
- **Timer Drift**: Browser tabs throttle intervals when backgrounded - mitigate by calculating elapsed time from timestamps
- **localStorage Quota**: Default 5-10MB limit - minimal risk for timer data, but include error handling
- **Strict Mode**: React 19 runs effects twice in dev - ensure cleanup functions work correctly
- **Time Zone Changes**: Use `DateTime.UtcNow` in backend, ISO strings in frontend to avoid timezone issues
- **Concurrent Completions**: Backend must handle race conditions if user completes pomodoro multiple times quickly

---

## 3. Implementation Steps

### PHASE 1: Backend Foundation

#### Step 1.1: Create Timer Models

**File:** `backend/StudyBuddy.Api/Models/SessionType.cs` (NEW)
```csharp
namespace StudyBuddy.Api.Models;

public enum SessionType
{
    Work,
    ShortBreak,
    LongBreak
}
```

**Pattern Note:** Follow existing `TaskStatus` enum pattern - PascalCase enum values, lowercase-with-hyphens in API strings

**File:** `backend/StudyBuddy.Api/Models/PomodoroSession.cs` (NEW)
```csharp
namespace StudyBuddy.Api.Models;

public class PomodoroSession
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public SessionType SessionType { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
}
```

**File:** `backend/StudyBuddy.Api/Models/StudyTask.cs` (MODIFY)
- Add properties: `TotalPomodoros`, `TotalFocusMinutes`, `Sessions`
```csharp
public int TotalPomodoros { get; set; } = 0;
public int TotalFocusMinutes { get; set; } = 0;
public List<PomodoroSession> Sessions { get; set; } = new();
```

#### Step 1.2: Create Request/Response DTOs

**File:** `backend/StudyBuddy.Api/DTOs/StartTimerRequest.cs` (NEW)
```csharp
namespace StudyBuddy.Api.DTOs;

public class StartTimerRequest
{
    public string SessionType { get; set; } = string.Empty;
}
```

**File:** `backend/StudyBuddy.Api/DTOs/CompleteTimerRequest.cs` (NEW)
```csharp
namespace StudyBuddy.Api.DTOs;

public class CompleteTimerRequest
{
    public string SessionType { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
}
```

**File:** `backend/StudyBuddy.Api/DTOs/SessionDto.cs` (NEW)
```csharp
namespace StudyBuddy.Api.DTOs;

public class SessionDto
{
    public string Id { get; set; } = string.Empty;
    public string SessionType { get; set; } = string.Empty;
    public string StartedAt { get; set; } = string.Empty;
    public string CompletedAt { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
}
```

**File:** `backend/StudyBuddy.Api/DTOs/TimerStatsResponse.cs` (NEW)
```csharp
namespace StudyBuddy.Api.DTOs;

public class TimerStatsResponse
{
    public int TotalPomodoros { get; set; }
    public int TotalFocusMinutes { get; set; }
    public List<SessionDto> RecentSessions { get; set; } = new();
}
```

**File:** `backend/StudyBuddy.Api/DTOs/TaskResponse.cs` (MODIFY)
- Add timer fields to DTO
```csharp
public int TotalPomodoros { get; set; }
public int TotalFocusMinutes { get; set; }
```

**File:** `backend/StudyBuddy.Api/DTOs/TaskMapper.cs` (MODIFY)
- Update `.ToResponse()` to include timer fields
```csharp
public static TaskResponse ToResponse(this StudyTask task)
{
    return new TaskResponse
    {
        Id = task.Id,
        Title = task.Title,
        Subject = task.Subject,
        EstimatedMinutes = task.EstimatedMinutes,
        Status = task.Status.ToApiString(),
        CreatedAt = task.CreatedAt.ToString("o"),
        TotalPomodoros = task.TotalPomodoros,
        TotalFocusMinutes = task.TotalFocusMinutes
    };
}
```

#### Step 1.3: Add Helper for Session Type Conversion

**File:** `backend/StudyBuddy.Api/Helpers/SessionTypeHelper.cs` (NEW)
```csharp
using StudyBuddy.Api.Models;

namespace StudyBuddy.Api.Helpers;

public static class SessionTypeHelper
{
    public static bool TryParseSessionType(string sessionType, out SessionType result)
    {
        result = SessionType.Work;

        return sessionType.ToLowerInvariant() switch
        {
            "work" => SetResult(SessionType.Work, out result),
            "short-break" => SetResult(SessionType.ShortBreak, out result),
            "long-break" => SetResult(SessionType.LongBreak, out result),
            _ => false
        };
    }

    public static string ToApiString(this SessionType sessionType)
    {
        return sessionType switch
        {
            SessionType.Work => "work",
            SessionType.ShortBreak => "short-break",
            SessionType.LongBreak => "long-break",
            _ => "work"
        };
    }

    private static bool SetResult(SessionType sessionType, out SessionType result)
    {
        result = sessionType;
        return true;
    }
}
```

**Pattern to Follow:** Exact same pattern as `TaskStatusHelper.cs` - `TryParse` for string → enum, `ToApiString` for enum → string

#### Step 1.4: Update Service Interface

**File:** `backend/StudyBuddy.Api/Services/TaskService.cs` (MODIFY)
- Add timer methods to `ITaskService` interface:
```csharp
public interface ITaskService
{
    // Existing methods...
    IEnumerable<StudyTask> GetAllTasks();
    StudyTask? GetTaskById(string id);
    StudyTask CreateTask(CreateTaskRequest request);
    StudyTask? UpdateTask(string id, StudyTaskStatus status);
    bool DeleteTask(string id);
    void Reset();

    // NEW: Timer methods
    void StartTimerSession(string taskId, SessionType sessionType);
    void CompleteTimerSession(string taskId, SessionType sessionType, int durationMinutes);
    TimerStatsResponse GetTimerStats(string taskId);
}
```

#### Step 1.5: Implement Service Methods

**File:** `backend/StudyBuddy.Api/Services/TaskService.cs` (MODIFY)
- Add to `InMemoryTaskService` class:

```csharp
private int _nextSessionId = 1;

public void StartTimerSession(string taskId, SessionType sessionType)
{
    lock (_lock)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task == null) return;

        var session = new PomodoroSession
        {
            Id = _nextSessionId.ToString(),
            TaskId = taskId,
            SessionType = sessionType,
            StartedAt = DateTime.UtcNow,
            CompletedAt = DateTime.MinValue, // Not completed yet
            DurationMinutes = 0
        };

        task.Sessions.Add(session);
        _nextSessionId++;
    }
}

public void CompleteTimerSession(string taskId, SessionType sessionType, int durationMinutes)
{
    lock (_lock)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task == null) return;

        // Find the most recent incomplete session of this type
        var session = task.Sessions
            .Where(s => s.TaskId == taskId &&
                       s.SessionType == sessionType &&
                       s.CompletedAt == DateTime.MinValue)
            .OrderByDescending(s => s.StartedAt)
            .FirstOrDefault();

        if (session != null)
        {
            session.CompletedAt = DateTime.UtcNow;
            session.DurationMinutes = durationMinutes;
        }
        else
        {
            // No session was started - create and complete in one go
            session = new PomodoroSession
            {
                Id = _nextSessionId.ToString(),
                TaskId = taskId,
                SessionType = sessionType,
                StartedAt = DateTime.UtcNow.AddMinutes(-durationMinutes),
                CompletedAt = DateTime.UtcNow,
                DurationMinutes = durationMinutes
            };
            task.Sessions.Add(session);
            _nextSessionId++;
        }

        // Update aggregated stats (only count work sessions for pomodoros)
        if (sessionType == SessionType.Work)
        {
            task.TotalPomodoros++;
            task.TotalFocusMinutes += durationMinutes;
        }
    }
}

public TimerStatsResponse GetTimerStats(string taskId)
{
    lock (_lock)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task == null)
        {
            return new TimerStatsResponse
            {
                TotalPomodoros = 0,
                TotalFocusMinutes = 0,
                RecentSessions = new List<SessionDto>()
            };
        }

        var recentSessions = task.Sessions
            .Where(s => s.CompletedAt != DateTime.MinValue)
            .OrderByDescending(s => s.CompletedAt)
            .Take(10)
            .Select(s => new SessionDto
            {
                Id = s.Id,
                SessionType = s.SessionType.ToApiString(),
                StartedAt = s.StartedAt.ToString("o"),
                CompletedAt = s.CompletedAt.ToString("o"),
                DurationMinutes = s.DurationMinutes
            })
            .ToList();

        return new TimerStatsResponse
        {
            TotalPomodoros = task.TotalPomodoros,
            TotalFocusMinutes = task.TotalFocusMinutes,
            RecentSessions = recentSessions
        };
    }
}
```

**Pattern Note:** Follow existing `InMemoryTaskService` patterns - use `lock (_lock)` for thread safety, `_nextId` pattern for ID generation

#### Step 1.6: Create API Endpoints

**File:** `backend/StudyBuddy.Api/Program.cs` (MODIFY)
- Add endpoints BEFORE `app.Run();`:

```csharp
// Start timer session
app.MapPost("/api/tasks/{id}/timer/start", (
    [FromRoute] string id,
    [FromBody] StartTimerRequest request,
    ITaskService taskService) =>
{
    if (!SessionTypeHelper.TryParseSessionType(request.SessionType, out var sessionType))
    {
        return Results.BadRequest(new { error = "Invalid session type. Must be 'work', 'short-break', or 'long-break'" });
    }

    var task = taskService.GetTaskById(id);
    if (task == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    taskService.StartTimerSession(id, sessionType);
    return Results.Ok(new { message = "Timer session started" });
})
.WithName("StartTimerSession")
.WithOpenApi();

// Complete timer session
app.MapPost("/api/tasks/{id}/timer/complete", (
    [FromRoute] string id,
    [FromBody] CompleteTimerRequest request,
    ITaskService taskService) =>
{
    if (!SessionTypeHelper.TryParseSessionType(request.SessionType, out var sessionType))
    {
        return Results.BadRequest(new { error = "Invalid session type" });
    }

    if (request.DurationMinutes <= 0 || request.DurationMinutes > 180)
    {
        return Results.BadRequest(new { error = "Duration must be between 1 and 180 minutes" });
    }

    var task = taskService.GetTaskById(id);
    if (task == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    taskService.CompleteTimerSession(id, sessionType, request.DurationMinutes);
    return Results.Ok(new { message = "Timer session completed" });
})
.WithName("CompleteTimerSession")
.WithOpenApi();

// Get timer stats
app.MapGet("/api/tasks/{id}/timer/stats", (
    [FromRoute] string id,
    ITaskService taskService) =>
{
    var task = taskService.GetTaskById(id);
    if (task == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    var stats = taskService.GetTimerStats(id);
    return Results.Ok(stats);
})
.WithName("GetTimerStats")
.WithOpenApi();
```

**Pattern Note:** Follow existing endpoint patterns - validate inputs, check task exists, return proper HTTP status codes

#### Step 1.7: Update Delete Endpoint to Clean Up Timer Data

**File:** `backend/StudyBuddy.Api/Program.cs` (MODIFY)
- Delete endpoint already removes task from list, which cascades to timer data (no change needed)

#### Step 1.8: Write Backend Tests

**File:** `backend/StudyBuddy.Api.Tests/ApiEndpointsTests.cs` (MODIFY)
- Add test class section:

```csharp
#region Timer Endpoint Tests

[Fact]
public async Task StartTimerSession_ShouldReturn200_WhenValidRequest()
{
    // Arrange
    var request = new { sessionType = "work" };

    // Act
    var response = await _client.PostAsJsonAsync("/api/tasks/1/timer/start", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}

[Fact]
public async Task StartTimerSession_ShouldReturn404_WhenTaskNotFound()
{
    // Arrange
    var request = new { sessionType = "work" };

    // Act
    var response = await _client.PostAsJsonAsync("/api/tasks/999/timer/start", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.NotFound);
}

[Fact]
public async Task StartTimerSession_ShouldReturn400_WhenInvalidSessionType()
{
    // Arrange
    var request = new { sessionType = "invalid-type" };

    // Act
    var response = await _client.PostAsJsonAsync("/api/tasks/1/timer/start", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    var content = await response.Content.ReadAsStringAsync();
    content.Should().Contain("Invalid session type");
}

[Fact]
public async Task CompleteTimerSession_ShouldUpdateStats_WhenWorkSession()
{
    // Arrange
    var startRequest = new { sessionType = "work" };
    await _client.PostAsJsonAsync("/api/tasks/1/timer/start", startRequest);

    var completeRequest = new { sessionType = "work", durationMinutes = 25 };

    // Act
    var response = await _client.PostAsJsonAsync("/api/tasks/1/timer/complete", completeRequest);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);

    // Verify stats updated
    var statsResponse = await _client.GetAsync("/api/tasks/1/timer/stats");
    var stats = await statsResponse.Content.ReadFromJsonAsync<TimerStatsResponse>();
    stats.Should().NotBeNull();
    stats!.TotalPomodoros.Should().Be(1);
    stats.TotalFocusMinutes.Should().Be(25);
}

[Fact]
public async Task CompleteTimerSession_ShouldNotIncrementPomodoros_WhenBreakSession()
{
    // Arrange
    var completeRequest = new { sessionType = "short-break", durationMinutes = 5 };

    // Act
    await _client.PostAsJsonAsync("/api/tasks/1/timer/complete", completeRequest);

    // Assert
    var statsResponse = await _client.GetAsync("/api/tasks/1/timer/stats");
    var stats = await statsResponse.Content.ReadFromJsonAsync<TimerStatsResponse>();
    stats.Should().NotBeNull();
    stats!.TotalPomodoros.Should().Be(0); // Breaks don't count as pomodoros
    stats.TotalFocusMinutes.Should().Be(0);
}

[Fact]
public async Task GetTimerStats_ShouldReturn404_WhenTaskNotFound()
{
    // Act
    var response = await _client.GetAsync("/api/tasks/999/timer/stats");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.NotFound);
}

[Fact]
public async Task GetTimerStats_ShouldReturnEmptyStats_WhenNoSessionsCompleted()
{
    // Act
    var response = await _client.GetAsync("/api/tasks/1/timer/stats");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var stats = await response.Content.ReadFromJsonAsync<TimerStatsResponse>();
    stats.Should().NotBeNull();
    stats!.TotalPomodoros.Should().Be(0);
    stats.TotalFocusMinutes.Should().Be(0);
    stats.RecentSessions.Should().BeEmpty();
}

[Fact]
public async Task GetAllTasks_ShouldIncludeTimerFields()
{
    // Arrange - Complete a session
    var completeRequest = new { sessionType = "work", durationMinutes = 25 };
    await _client.PostAsJsonAsync("/api/tasks/1/timer/complete", completeRequest);

    // Act
    var response = await _client.GetAsync("/api/tasks");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var tasks = await response.Content.ReadFromJsonAsync<List<TaskResponse>>();
    tasks.Should().NotBeNull();
    var task1 = tasks!.FirstOrDefault(t => t.Id == "1");
    task1.Should().NotBeNull();
    task1!.TotalPomodoros.Should().BeGreaterThanOrEqualTo(0);
    task1.TotalFocusMinutes.Should().BeGreaterThanOrEqualTo(0);
}

#endregion
```

**Test Coverage Target:** Minimum 80% coverage for all new timer code

#### Step 1.9: Run Backend Tests

```bash
cd backend
dotnet test
```

**Validation:** All tests must pass (existing 34 + new ~9 = 43 total)

---

### PHASE 2: Frontend Core Timer

#### Step 2.1: Add Timer Types

**File:** `frontend/lib/types.ts` (MODIFY)
- Add at end of file:

```typescript
// Timer types
export type SessionType = "work" | "short-break" | "long-break"

export type TimerState = {
  sessionType: SessionType
  timeRemaining: number // seconds
  pomodoroCount: number // 0-4 (position in cycle)
  isActive: boolean
  isPaused: boolean
  lastTick: number // timestamp
  sessionStartedAt: string
}

export type PomodoroStats = {
  totalPomodoros: number
  totalFocusMinutes: number
  recentSessions: SessionDto[]
}

export type SessionDto = {
  id: string
  sessionType: string
  startedAt: string
  completedAt: string
  durationMinutes: number
}

export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  createdAt: string
  totalPomodoros: number     // NEW
  totalFocusMinutes: number  // NEW
}
```

#### Step 2.2: Create Timer Utilities

**File:** `frontend/lib/timer-utils.ts` (NEW)
```typescript
import type { TimerState, SessionType } from "./types"

// Timer constants
export const TIMER_DURATIONS = {
  work: 25 * 60,        // 25 minutes in seconds
  "short-break": 5 * 60, // 5 minutes
  "long-break": 15 * 60  // 15 minutes
} as const

export const POMODOROS_BEFORE_LONG_BREAK = 4

// localStorage key helper
export function getTimerStorageKey(taskId: string): string {
  return `pomodoro-active-${taskId}`
}

// Load timer state from localStorage
export function loadTimerState(taskId: string): TimerState | null {
  if (typeof window === "undefined") return null

  try {
    const key = getTimerStorageKey(taskId)
    const data = localStorage.getItem(key)
    if (!data) return null

    const state = JSON.parse(data) as TimerState

    // Calculate elapsed time if timer was active
    if (state.isActive && !state.isPaused) {
      const now = Date.now()
      const elapsed = Math.floor((now - state.lastTick) / 1000)
      state.timeRemaining = Math.max(0, state.timeRemaining - elapsed)
      state.lastTick = now
    }

    return state
  } catch (error) {
    console.error("Failed to load timer state:", error)
    return null
  }
}

// Save timer state to localStorage
export function saveTimerState(taskId: string, state: TimerState): void {
  if (typeof window === "undefined") return

  try {
    const key = getTimerStorageKey(taskId)
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error("Failed to save timer state:", error)
  }
}

// Clear timer state from localStorage
export function clearTimerState(taskId: string): void {
  if (typeof window === "undefined") return

  try {
    const key = getTimerStorageKey(taskId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to clear timer state:", error)
  }
}

// Get initial state for a new timer
export function getInitialTimerState(): TimerState {
  return {
    sessionType: "work",
    timeRemaining: TIMER_DURATIONS.work,
    pomodoroCount: 0,
    isActive: false,
    isPaused: false,
    lastTick: Date.now(),
    sessionStartedAt: new Date().toISOString()
  }
}

// Determine next session type based on current pomodoro count
export function getNextSessionType(currentCount: number): SessionType {
  if (currentCount >= POMODOROS_BEFORE_LONG_BREAK) {
    return "long-break"
  }
  return "short-break"
}

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Get duration for a session type
export function getSessionDuration(sessionType: SessionType): number {
  return TIMER_DURATIONS[sessionType]
}
```

**Pattern Note:** Pure utility functions, no React dependencies, safe for server-side rendering

#### Step 2.3: Add Timer API Functions

**File:** `frontend/lib/api.ts` (MODIFY)
- Add at end of file:

```typescript
// Timer API functions
export async function startTimerSession(taskId: string, sessionType: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionType }),
  })

  if (!res.ok) {
    throw new Error("Failed to start timer session")
  }
}

export async function completeTimerSession(
  taskId: string,
  sessionType: string,
  durationMinutes: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionType, durationMinutes }),
  })

  if (!res.ok) {
    throw new Error("Failed to complete timer session")
  }
}

export async function getTimerStats(taskId: string): Promise<PomodoroStats> {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/timer/stats`)

  if (!res.ok) {
    throw new Error("Failed to fetch timer stats")
  }

  return res.json()
}
```

**Pattern Note:** Follow existing API patterns - return promises, throw on error, use template literals for URLs

#### Step 2.4: Create Pomodoro Hook

**File:** `frontend/lib/hooks/use-pomodoro.ts` (NEW)
```typescript
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TimerState, SessionType } from "../types"
import {
  loadTimerState,
  saveTimerState,
  clearTimerState,
  getInitialTimerState,
  getNextSessionType,
  getSessionDuration,
  POMODOROS_BEFORE_LONG_BREAK,
} from "../timer-utils"
import { startTimerSession, completeTimerSession } from "../api"

export function usePomodoro(taskId: string) {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    return loadTimerState(taskId) || getInitialTimerState()
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const completionCallbackRef = useRef<(() => void) | null>(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (timerState.isActive || timerState.isPaused) {
      saveTimerState(taskId, timerState)
    }
  }, [taskId, timerState])

  // Countdown effect
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        const now = Date.now()
        const newTimeRemaining = prev.timeRemaining - 1

        if (newTimeRemaining <= 0) {
          // Session complete
          if (completionCallbackRef.current) {
            completionCallbackRef.current()
          }
          return prev
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          lastTick: now,
        }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState.isActive, timerState.isPaused])

  const start = useCallback(async () => {
    try {
      await startTimerSession(taskId, timerState.sessionType)

      setTimerState((prev) => ({
        ...prev,
        isActive: true,
        isPaused: false,
        lastTick: Date.now(),
        sessionStartedAt: new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Failed to start timer:", error)
      alert("Failed to start timer. Please try again.")
    }
  }, [taskId, timerState.sessionType])

  const pause = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: true,
    }))
  }, [])

  const resume = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: false,
      lastTick: Date.now(),
    }))
  }, [])

  const stop = useCallback(() => {
    setTimerState(getInitialTimerState())
    clearTimerState(taskId)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [taskId])

  const complete = useCallback(
    async (sessionType: SessionType, durationMinutes: number) => {
      try {
        await completeTimerSession(taskId, sessionType, durationMinutes)
      } catch (error) {
        console.error("Failed to record completed session:", error)
        // Don't block the UI - session is complete locally
      }
    },
    [taskId]
  )

  const handleSessionComplete = useCallback(async () => {
    const { sessionType, pomodoroCount } = timerState
    const duration = Math.ceil(getSessionDuration(sessionType) / 60) // Convert to minutes

    // Record completion in backend
    await complete(sessionType, duration)

    // Determine next session
    let nextSessionType: SessionType
    let nextPomodoroCount = pomodoroCount

    if (sessionType === "work") {
      nextPomodoroCount++
      nextSessionType = getNextSessionType(nextPomodoroCount)
    } else if (sessionType === "long-break") {
      nextPomodoroCount = 0
      nextSessionType = "work"
    } else {
      nextSessionType = "work"
    }

    // Show alert
    if (sessionType === "work") {
      const breakType = nextSessionType === "long-break" ? "long" : "short"
      alert(`Pomodoro complete! Time for a ${breakType} break.`)
    } else {
      alert("Break complete! Time to focus.")
    }

    // Update state for next session
    setTimerState({
      sessionType: nextSessionType,
      timeRemaining: getSessionDuration(nextSessionType),
      pomodoroCount: nextPomodoroCount,
      isActive: false,
      isPaused: false,
      lastTick: Date.now(),
      sessionStartedAt: new Date().toISOString(),
    })
  }, [timerState, complete])

  // Set completion callback
  useEffect(() => {
    completionCallbackRef.current = handleSessionComplete
  }, [handleSessionComplete])

  return {
    timerState,
    start,
    pause,
    resume,
    stop,
  }
}
```

**Pattern Note:** Follow React hooks best practices - cleanup intervals in useEffect, use useCallback for stable function references

#### Step 2.5: Create Pomodoro Timer Component

**File:** `frontend/components/pomodoro-timer.tsx` (NEW)
```tsx
"use client"

import { Play, Pause, Square } from "lucide-react"
import { usePomodoro } from "@/lib/hooks/use-pomodoro"
import { formatTime } from "@/lib/timer-utils"

interface PomodoroTimerProps {
  taskId: string
}

export function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { timerState, start, pause, resume, stop } = usePomodoro(taskId)

  const sessionTypeLabels = {
    work: "Focus",
    "short-break": "Short Break",
    "long-break": "Long Break",
  }

  const sessionTypeColors = {
    work: "bg-blue-500 text-white",
    "short-break": "bg-green-500 text-white",
    "long-break": "bg-purple-500 text-white",
  }

  const isRunning = timerState.isActive && !timerState.isPaused

  return (
    <div className="space-y-3">
      {/* Session Type Badge */}
      <div className="flex items-center justify-between">
        <div
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${sessionTypeColors[timerState.sessionType]}`}
        >
          {sessionTypeLabels[timerState.sessionType]}
        </div>
        <div className="text-xs text-slate-500">
          Pomodoro {timerState.pomodoroCount}/4
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div
          className={`text-4xl font-bold tabular-nums ${
            isRunning ? "text-blue-600" : "text-slate-700"
          }`}
        >
          {formatTime(timerState.timeRemaining)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!timerState.isActive ? (
          <button
            onClick={start}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
        ) : timerState.isPaused ? (
          <>
            <button
              onClick={resume}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
            <button
              onClick={stop}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pause}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
            <button
              onClick={stop}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

**Pattern Note:** Follow existing component patterns - use `"use client"`, Lucide icons, Tailwind classes

#### Step 2.6: Integrate Timer into TaskCard

**File:** `frontend/components/task-card.tsx` (MODIFY)
- Import timer component at top:
```tsx
import { PomodoroTimer } from "./pomodoro-timer"
```

- Add timer section BEFORE the status change buttons:
```tsx
      {/* Pomodoro Timer */}
      {task.status === "in-progress" && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/30 p-3">
          <PomodoroTimer taskId={task.id} />
        </div>
      )}

      {/* Pomodoro Stats */}
      {task.totalPomodoros > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <span className="text-base">🍅</span>
          <span className="font-semibold">{task.totalPomodoros} completed</span>
          <span className="text-slate-400">•</span>
          <span>{task.totalFocusMinutes} min focused</span>
        </div>
      )}
```

**Pattern Note:** Conditional rendering based on task status, consistent styling with existing card design

#### Step 2.7: Write Frontend Tests

**File:** `frontend/lib/__tests__/timer-utils.test.ts` (NEW)
```typescript
import {
  formatTime,
  getSessionDuration,
  getNextSessionType,
  TIMER_DURATIONS,
  POMODOROS_BEFORE_LONG_BREAK,
} from "../timer-utils"

describe("timer-utils", () => {
  describe("formatTime", () => {
    it("should format seconds to MM:SS", () => {
      expect(formatTime(0)).toBe("00:00")
      expect(formatTime(59)).toBe("00:59")
      expect(formatTime(60)).toBe("01:00")
      expect(formatTime(599)).toBe("09:59")
      expect(formatTime(1500)).toBe("25:00")
    })
  })

  describe("getSessionDuration", () => {
    it("should return correct duration for work session", () => {
      expect(getSessionDuration("work")).toBe(25 * 60)
    })

    it("should return correct duration for short break", () => {
      expect(getSessionDuration("short-break")).toBe(5 * 60)
    })

    it("should return correct duration for long break", () => {
      expect(getSessionDuration("long-break")).toBe(15 * 60)
    })
  })

  describe("getNextSessionType", () => {
    it("should return short break after work sessions 1-3", () => {
      expect(getNextSessionType(1)).toBe("short-break")
      expect(getNextSessionType(2)).toBe("short-break")
      expect(getNextSessionType(3)).toBe("short-break")
    })

    it("should return long break after 4th work session", () => {
      expect(getNextSessionType(4)).toBe("long-break")
    })

    it("should return long break for counts >= 4", () => {
      expect(getNextSessionType(5)).toBe("long-break")
    })
  })

  describe("constants", () => {
    it("should have correct timer durations", () => {
      expect(TIMER_DURATIONS.work).toBe(1500)
      expect(TIMER_DURATIONS["short-break"]).toBe(300)
      expect(TIMER_DURATIONS["long-break"]).toBe(900)
    })

    it("should have correct pomodoro cycle length", () => {
      expect(POMODOROS_BEFORE_LONG_BREAK).toBe(4)
    })
  })
})
```

**File:** `frontend/lib/__tests__/api.test.ts` (MODIFY)
- Add timer API tests:
```typescript
describe("Timer API", () => {
  describe("startTimerSession", () => {
    it("should start a timer session", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Timer session started" }),
      } as Response)

      await startTimerSession("1", "work")

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks/1/timer/start",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionType: "work" }),
        }
      )
    })

    it("should throw error when start fails", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false } as Response)

      await expect(startTimerSession("1", "work")).rejects.toThrow(
        "Failed to start timer session"
      )
    })
  })

  describe("completeTimerSession", () => {
    it("should complete a timer session", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Timer session completed" }),
      } as Response)

      await completeTimerSession("1", "work", 25)

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks/1/timer/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionType: "work", durationMinutes: 25 }),
        }
      )
    })
  })

  describe("getTimerStats", () => {
    it("should fetch timer stats", async () => {
      const mockStats = {
        totalPomodoros: 5,
        totalFocusMinutes: 125,
        recentSessions: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response)

      const stats = await getTimerStats("1")

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks/1/timer/stats"
      )
      expect(stats).toEqual(mockStats)
    })
  })
})
```

**File:** `frontend/components/__tests__/pomodoro-timer.test.tsx` (NEW)
```tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { PomodoroTimer } from "../pomodoro-timer"
import { usePomodoro } from "@/lib/hooks/use-pomodoro"

jest.mock("@/lib/hooks/use-pomodoro")

const mockUsePomodoro = usePomodoro as jest.MockedFunction<typeof usePomodoro>

describe("PomodoroTimer", () => {
  const mockStart = jest.fn()
  const mockPause = jest.fn()
  const mockResume = jest.fn()
  const mockStop = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render timer in idle state", () => {
    mockUsePomodoro.mockReturnValue({
      timerState: {
        sessionType: "work",
        timeRemaining: 1500,
        pomodoroCount: 0,
        isActive: false,
        isPaused: false,
        lastTick: Date.now(),
        sessionStartedAt: new Date().toISOString(),
      },
      start: mockStart,
      pause: mockPause,
      resume: mockResume,
      stop: mockStop,
    })

    render(<PomodoroTimer taskId="1" />)

    expect(screen.getByText("25:00")).toBeInTheDocument()
    expect(screen.getByText("Focus")).toBeInTheDocument()
    expect(screen.getByText("Pomodoro 0/4")).toBeInTheDocument()
    expect(screen.getByText("Start")).toBeInTheDocument()
  })

  it("should show pause and stop buttons when active", () => {
    mockUsePomodoro.mockReturnValue({
      timerState: {
        sessionType: "work",
        timeRemaining: 1450,
        pomodoroCount: 1,
        isActive: true,
        isPaused: false,
        lastTick: Date.now(),
        sessionStartedAt: new Date().toISOString(),
      },
      start: mockStart,
      pause: mockPause,
      resume: mockResume,
      stop: mockStop,
    })

    render(<PomodoroTimer taskId="1" />)

    expect(screen.getByText("Pause")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /square/i })).toBeInTheDocument()
  })

  it("should call start when start button clicked", () => {
    mockUsePomodoro.mockReturnValue({
      timerState: {
        sessionType: "work",
        timeRemaining: 1500,
        pomodoroCount: 0,
        isActive: false,
        isPaused: false,
        lastTick: Date.now(),
        sessionStartedAt: new Date().toISOString(),
      },
      start: mockStart,
      pause: mockPause,
      resume: mockResume,
      stop: mockStop,
    })

    render(<PomodoroTimer taskId="1" />)

    fireEvent.click(screen.getByText("Start"))

    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  it("should show correct session type for break", () => {
    mockUsePomodoro.mockReturnValue({
      timerState: {
        sessionType: "short-break",
        timeRemaining: 300,
        pomodoroCount: 1,
        isActive: false,
        isPaused: false,
        lastTick: Date.now(),
        sessionStartedAt: new Date().toISOString(),
      },
      start: mockStart,
      pause: mockPause,
      resume: mockResume,
      stop: mockStop,
    })

    render(<PomodoroTimer taskId="1" />)

    expect(screen.getByText("Short Break")).toBeInTheDocument()
    expect(screen.getByText("05:00")).toBeInTheDocument()
  })
})
```

#### Step 2.8: Run Frontend Tests

```bash
cd frontend
pnpm test
```

**Validation:** All tests must pass with >80% coverage for new timer code

---

### PHASE 3: Integration & Validation

#### Step 3.1: Manual Testing Checklist

**Start Both Services:**
```bash
# Terminal 1
cd backend/StudyBuddy.Api
dotnet run

# Terminal 2
cd frontend
pnpm run dev
```

**Test Scenarios:**
1. ✅ Create new task, set to "in-progress", verify timer appears
2. ✅ Start timer, wait for countdown, verify it decrements each second
3. ✅ Pause timer, verify countdown stops
4. ✅ Resume timer, verify countdown continues
5. ✅ Stop timer, verify it resets
6. ✅ Complete full work session (or fast-forward for testing), verify alert appears
7. ✅ Verify stats update (🍅 count increments)
8. ✅ Refresh page mid-timer, verify timer continues from correct position
9. ✅ Complete 4 pomodoros, verify long break is triggered
10. ✅ Test break session, verify stats don't increment pomodoro count
11. ✅ Delete task with timer, verify no errors
12. ✅ Test multiple tasks with independent timers

#### Step 3.2: Test Coverage Validation

```bash
# Backend
cd backend
dotnet test /p:CollectCoverage=true /p:CoverageReportsDirectory=./coverage

# Frontend
cd frontend
pnpm test:coverage
```

**Validation Gate:**
- ✅ Backend timer code: ≥80% line coverage
- ✅ Frontend timer code: ≥80% line coverage

#### Step 3.3: Error Handling Tests

**Backend Offline Test:**
1. Start frontend
2. Stop backend
3. Try to start timer
4. Verify: User sees error message, timer doesn't break
5. Start backend
6. Try again, verify it works

**localStorage Full Test:**
1. Open DevTools → Application → localStorage
2. Fill quota (if possible) or disable
3. Try to use timer
4. Verify: Graceful degradation, error logged to console

---

## 4. Validation Gates

### Test Commands

**Backend Tests:**
```bash
cd backend
dotnet test
```
**Expected Result:** All tests pass (43 tests total: 34 existing + 9 new timer tests)

**Frontend Tests:**
```bash
cd frontend
pnpm test
```
**Expected Result:** All tests pass (60+ tests total: 53 existing + 7+ new timer tests)

**Frontend Test Coverage:**
```bash
cd frontend
pnpm test:coverage
```
**Expected Result:**
- Overall coverage ≥80%
- Timer utilities: ≥90% coverage
- Timer hook: ≥80% coverage
- Timer component: ≥80% coverage

### Linting

**Backend:**
```bash
cd backend
dotnet build
```
**Expected Result:** 0 warnings, 0 errors

**Frontend:**
```bash
cd frontend
pnpm run lint
```
**Expected Result:** No linting errors

### Manual Verification Steps

1. **Basic Timer Flow:**
   - [ ] Start timer on in-progress task
   - [ ] Timer counts down every second
   - [ ] Pause/resume works correctly
   - [ ] Stop resets timer

2. **Persistence:**
   - [ ] Refresh page mid-timer → timer continues
   - [ ] Close tab, reopen → timer state preserved
   - [ ] Clear localStorage → timer resets to initial state

3. **Pomodoro Cycle:**
   - [ ] Complete work session → short break triggered
   - [ ] Complete 4 pomodoros → long break triggered
   - [ ] Long break completes → cycle resets to pomodoro 1

4. **Backend Integration:**
   - [ ] Completing work session increments stats
   - [ ] Stats display on task card
   - [ ] Stats persist across page refresh
   - [ ] DELETE task removes timer data

5. **Error Handling:**
   - [ ] Backend offline → timer shows error, doesn't break
   - [ ] Invalid session type → backend returns 400
   - [ ] Timer on deleted task → no console errors

6. **UI/UX:**
   - [ ] Timer only shows on in-progress tasks
   - [ ] Session type badge displays correctly
   - [ ] Pomodoro count (X/4) displays
   - [ ] Stats badge shows 🍅 count and minutes
   - [ ] Controls are intuitive and responsive

---

## 5. Quality Checklist

- [x] All necessary context for autonomous implementation provided
- [x] Validation gates are executable and specific
- [x] References to existing patterns and conventions included
- [x] Clear, ordered implementation path defined
- [x] Comprehensive error handling documented
- [x] Main flow and edge cases covered
- [x] Specific code examples and file references provided
- [x] Links to external documentation included
- [x] Instruction files followed (.github/copilot-instructions.md)
- [x] Testing requirements specified:
  - [x] Unit tests planned with ≥80% coverage target
  - [x] Integration tests planned for backend/frontend sync
  - [x] Test file locations and names specified
  - [x] Test scenarios enumerated (including edge cases)
  - [x] External dependencies mocking strategy (jest.mock for API calls)
- [x] Project-specific patterns addressed:
  - [x] Component type and location identified (Backend: Minimal APIs + Service, Frontend: React components + hooks)
  - [x] Data persistence strategy (Hybrid: localStorage for active timer, backend for completed sessions)
  - [x] Logging and error tracking strategy specified (console.error + user-friendly alerts)
  - [x] Test mocking strategy for external dependencies (jest.mock for API, WebApplicationFactory for backend)
  - [x] Deployment steps (none required - in-memory backend, no migrations)
  - [x] Backwards compatibility (no breaking changes - only additions)
- [x] Related work items linked (none)
- [x] Ambiguous requirements clarified (all requirements clear from issue and discussion)

---

## 6. Implementation Confidence Score

**Score:** 9/10

**Reasoning:**
- ✅ Clear requirements from well-defined GitHub issue
- ✅ Existing codebase patterns are well-established and documented
- ✅ Hybrid architecture approach is proven (industry standard)
- ✅ All necessary file paths, code examples, and patterns provided
- ✅ Comprehensive test strategy with concrete test cases
- ✅ Error handling and edge cases thoroughly considered
- ⚠️ Minor risk: Timer drift in backgrounded tabs (mitigated with timestamp-based calculations)
- ⚠️ Minor risk: First-time implementing custom React hook with intervals (pattern is well-documented)

**Improvements Needed:** None - plan is comprehensive and ready for implementation

**Potential Challenges:**
1. **Timer Drift Mitigation:** Implementing timestamp-based drift correction requires careful testing
   - **Solution:** Provided in `loadTimerState()` utility - calculates elapsed time from timestamps
2. **React Hook Cleanup:** Ensuring intervals are properly cleaned up
   - **Solution:** Followed React documentation pattern with cleanup in useEffect return
3. **localStorage Errors:** Handling quota exceeded or disabled
   - **Solution:** Try-catch blocks in all localStorage operations with console.error logging

---

## 7. Additional Notes

### Why SessionType Uses Enum (Not String)

**Pattern Consistency:** Follows existing `StudyTaskStatus` enum pattern:
- ✅ **Type Safety:** Compiler enforces valid values (`SessionType.Work` vs `"wrk"` typo)
- ✅ **IntelliSense:** Auto-complete shows all valid options
- ✅ **Refactoring:** Renaming enum value updates all usages automatically
- ✅ **API Boundary Conversion:** DTOs use strings (API contract), models use enums (internal code)
- ✅ **Helper Pattern:** `SessionTypeHelper` mirrors `TaskStatusHelper` exactly

**Hybrid Approach:**
- **Internal Code (Models/Services):** Use `SessionType` enum for type safety
- **API Layer (DTOs/Requests):** Use strings for flexibility (JSON compatibility)
- **Conversion:** `SessionTypeHelper.TryParseSessionType()` at API boundary

This is the established pattern in the codebase and prevents runtime errors.

### Development Tips
- **Testing During Development:** Use Chrome DevTools → Application → localStorage to inspect timer state
- **Fast Testing:** Temporarily reduce timer durations in `timer-utils.ts` constants for faster testing
- **Backend Inspection:** Use Swagger UI at `http://localhost:5000/swagger` to test API endpoints manually
- **React DevTools:** Install React DevTools extension to inspect hook state during development

### Future Enhancements (Out of Scope for MVP)
- Replace `window.alert()` with toast notifications (e.g., Sonner library)
- Add session history view (list of all completed sessions)
- Add visual progress ring around timer
- Add sound notifications in addition to alerts
- Add configurable timer durations (user preferences)
- Add timer controls keyboard shortcuts (Space to pause/resume, etc.)
- Add timer analytics dashboard (charts, trends over time)
- Add cross-device timer sync (WebSocket real-time updates)

### Known Limitations
- Timer accuracy depends on browser tab throttling (acceptable tradeoff)
- Only one active timer per task (by design - users focus on one task at a time)
- Browser must remain open for timer to run (no background service workers in MVP)
- Stats are task-specific, not user-wide (no global analytics in MVP)

---

## Success Metrics

✅ **Functional:**
- Users can complete a full 4-pomodoro cycle without interruption
- Timer state persists 100% of the time across page refreshes
- All 7 acceptance criteria sections satisfied (42+ criteria)

✅ **Technical:**
- Zero timer drift over 25-minute session (timestamp-based correction works)
- Notifications fire within 1 second of session completion
- 80%+ test coverage for all timer logic
- All tests pass (backend + frontend)
- No linting errors

✅ **Quality:**
- Code follows existing project patterns
- Error handling is comprehensive
- User experience is smooth and intuitive
- Documentation is clear (code comments where needed)

### Why SessionType Uses Enum (Not String)

**Pattern Consistency:** Follows existing `StudyTaskStatus` enum pattern:
- ✅ **Type Safety:** Compiler enforces valid values (`SessionType.Work` vs `"wrk"` typo)
- ✅ **IntelliSense:** Auto-complete shows all valid options
- ✅ **Refactoring:** Renaming enum value updates all usages automatically
- ✅ **API Boundary Conversion:** DTOs use strings (API contract), models use enums (internal code)
- ✅ **Helper Pattern:** `SessionTypeHelper` mirrors `TaskStatusHelper` exactly

**Hybrid Approach:**
- **Internal Code (Models/Services):** Use `SessionType` enum for type safety
- **API Layer (DTOs/Requests):** Use strings for flexibility (JSON compatibility)
- **Conversion:** `SessionTypeHelper.TryParseSessionType()` at API boundary

This is the established pattern in the codebase and prevents runtime errors.

---

**Plan Created:** January 21, 2026
**GitHub Issue:** [#20](https://github.com/JurreBrandsenInfoSupport/studybuddy-workshop/issues/20)
**Ready for Implementation:** ✅ Yes
