# Add Task Completion History and Time Analysis — Implementation Plan

## Feature Overview

This feature extends StudyBuddy+ to record timing data whenever a task's lifecycle completes. When a task moves to "in-progress" a `startedAt` UTC timestamp is saved on the task; when it moves to "done" a `TaskCompletion` record is written to a separate in-memory history store capturing `actualMinutes` (derived from the elapsed time, or falling back to `estimatedMinutes` when `startedAt` is absent). Tasks can optionally be linked to a prior completion via a `linkedTaskId` field set at creation time. A new `GET /api/tasks/history` endpoint exposes all records sorted newest-first. The frontend gains a History panel that lists completions and, for linked tasks, displays a trend indicator (faster / slower / same) relative to the linked completion's `actualMinutes`.

---

## Key References

| File | Lines | Pattern to follow |
|------|-------|-------------------|
| `backend/StudyBuddy.Api/Models/StudyTask.cs` | 1–7 | Minimal model class with nullable fields using `?` syntax |
| `backend/StudyBuddy.Api/Models/CreateTaskRequest.cs` | 1–13 | Request model with `[Required]` / `[Range]` data annotations; optional fields have no annotation |
| `backend/StudyBuddy.Api/DTOs/TaskResponse.cs` | 1–12 | DTO with `string` fields for enum values, ISO 8601 date strings |
| `backend/StudyBuddy.Api/DTOs/TaskMapper.cs` | 1–18 | Static extension class with `.ToResponse()` converting model → DTO; uses `ToString("o")` for dates |
| `backend/StudyBuddy.Api/Services/TaskService.cs` | 1–15 | `ITaskService` interface definition — all new methods go here first |
| `backend/StudyBuddy.Api/Services/TaskService.cs` | 17–145 | `InMemoryTaskService` implementation — `_lock` object, list fields, `Reset()` resets all state |
| `backend/StudyBuddy.Api/Services/TaskService.cs` | 95–115 | `UpdateTask` method — the status transition hook where `startedAt` and completion creation logic goes |
| `backend/StudyBuddy.Api/Services/TaskService.cs` | 83–95 | `CreateTask` method — where `LinkedTaskId` must be persisted from the request |
| `backend/StudyBuddy.Api/Helpers/TaskStatusHelper.cs` | 1–40 | `TryParseStatus` / `ToApiString` enum conversion helpers; follow the same switch pattern |
| `backend/StudyBuddy.Api/Program.cs` | 41–48 | `GET /api/tasks` endpoint — template for the new `GET /api/tasks/history` endpoint |
| `backend/StudyBuddy.Api/Program.cs` | 61–70 | `POST /api/tasks` — shows `[FromBody]` binding and `Results.Created()` pattern |
| `backend/StudyBuddy.Api.Tests/TaskServiceTests.cs` | 1–10 | Unit test class setup — `InMemoryTaskService` instantiated directly, no factory needed |
| `backend/StudyBuddy.Api.Tests/ApiEndpointsTests.cs` | 14–27 | Integration test setup with `WebApplicationFactory<Program>` and `_taskService.Reset()` pattern |
| `backend/StudyBuddy.Api.Tests/ApiEndpointsTests.cs` | 190–230 | `UpdateTaskStatus` integration tests — template for the full todo→in-progress→done flow test |
| `frontend/lib/types.ts` | 1–15 | Type definition file; `CreateTaskInput` derives from `StudyTask` via `Omit` |
| `frontend/lib/api.ts` | 1–12 | `fetchTasks()` function — template for `getTaskHistory()`; same error-throw pattern |
| `frontend/components/study-dashboard.tsx` | 11–15 | State declarations block — add `history` and `activeTab` state here |
| `frontend/components/study-dashboard.tsx` | 22–35 | `useEffect` + `loadTasks` pattern — add parallel `loadHistory` call |
| `frontend/components/study-dashboard.tsx` | 40–50 | `handleAddTask` — already passes `CreateTaskInput` to `createTask`; `linkedTaskId` flows automatically |
| `frontend/components/add-task-form.tsx` | 1–50 | Form component — `isExpanded` toggle, `formData` state, `handleSubmit` pattern |
| `frontend/components/add-task-form.tsx` | 130–145 | Form submit button — template for wrapping the "Link to previous task" select field |
| `frontend/components/__tests__/study-dashboard.test.tsx` | 1–20 | `jest.mock('@/lib/api')` pattern; cast mocks as `jest.MockedFunction<typeof api.X>` |

---

## Documentation

- No external dependencies required. All patterns are covered by the existing codebase references above.

---

## Architectural Constraints

- **No database** — all persistence is in-memory; the `_completions` list must live alongside `_tasks` inside `InMemoryTaskService`.
- **No new npm packages** — use only Tailwind CSS, Radix UI, lucide-react, and React hooks already present.
- **Singleton service** — `InMemoryTaskService` is registered as a singleton. Thread-safety for `_completions` must use the same `lock (_lock)` object already used for `_tasks`.
- **`Reset()` must clear completions** — tests call `_taskService.Reset()` before/after each test run; failing to reset `_completions` will cause test bleed.
- **`TaskResponse` must remain unchanged** — `startedAt` and `linkedTaskId` are stored on the backend model but are **not** included in `TaskResponse`; this avoids a breaking change to existing tests and clients.
- **Status string convention** — API uses lowercase `"todo"`, `"in-progress"`, `"done"`; C# enums are PascalCase. All conversions go through `TaskStatusHelper`.
- **All endpoints under `/api/tasks`** — the history endpoint must be `GET /api/tasks/history`, registered before any `{id}` wildcard route to avoid route conflicts.

---

## Gotchas

- **Route ordering** — `GET /api/tasks/history` must be registered in `Program.cs` **before** `GET /api/tasks/{id}`, otherwise `"history"` is captured as the `id` parameter.
- **`Reset()` completions** — `Reset()` must set `_completions = new List<TaskCompletion>()` in addition to resetting `_tasks`. Forgetting this is the #1 cause of flaky integration tests.
- **`actualMinutes` rounding** — use `(int)Math.Round((completedAt - startedAt.Value).TotalMinutes)` to match the spec ("rounded to the nearest minute"). Do not use integer truncation.
- **`startedAt` fallback is silent** — when `StartedAt` is null at done transition, set `ActualMinutes = task.EstimatedMinutes` without throwing or logging a warning; the spec says "silently".
- **`linkedTaskId` is a `TaskCompletion.Id`**, not a `StudyTask.Id` — the dropdown in the frontend should display completion records (title + date) and send the completion's `id` string as `linkedTaskId`.
- **`CreateTaskInput` must gain `linkedTaskId?`** — `CreateTaskInput` is currently `Omit<StudyTask, "id" | "status" | "createdAt">`. Since `linkedTaskId` is NOT a field on `StudyTask` (it is not in `TaskResponse`), add it via intersection: `Omit<StudyTask, "id" | "status" | "createdAt"> & { linkedTaskId?: string }`.
- **History fetch is independent of task fetch** — load history in a parallel `useEffect` call (or extend `loadTasks`) so a history endpoint failure does not block the task list.
- **Empty history state** — when `history.length === 0`, the "Link to previous task" dropdown must not render at all (not render as an empty `<select>`).
- **`DateTime?` serializes to `null` in JSON** — frontend types for `startedAt` / `completedAt` on `TaskCompletion` should be typed as `string | null`, not `string | undefined`, to match JSON output.
- **`_nextCompletionId`** — maintain a separate integer counter for completion IDs, just as `_nextId` is used for tasks. Reset it in `Reset()`.

---

## Ordered Task List

> Work through these in order. Each step builds on the previous one.

### Backend

1. **Extend `StudyTask` model** — add `StartedAt` (`DateTime?`) and `LinkedTaskId` (`string?`) properties to `backend/StudyBuddy.Api/Models/StudyTask.cs`. Run `cd backend ; dotnet build` to confirm no errors before proceeding.

2. **Extend `CreateTaskRequest` model** — add optional `LinkedTaskId` (`string?`) without any data annotation to `backend/StudyBuddy.Api/Models/CreateTaskRequest.cs`. Run `dotnet build`.

3. **Create `TaskCompletion` model** — create `backend/StudyBuddy.Api/Models/TaskCompletion.cs` with properties: `Id` (string), `TaskId` (string), `LinkedTaskId` (string?), `Title` (string), `Subject` (string), `EstimatedMinutes` (int), `ActualMinutes` (int), `StartedAt` (DateTime?), `CompletedAt` (DateTime). Run `dotnet build`.

4. **Create `TaskCompletionResponse` DTO** — create `backend/StudyBuddy.Api/DTOs/TaskCompletionResponse.cs` following the same all-string-fields pattern as `TaskResponse.cs`. Fields: `Id`, `TaskId`, `LinkedTaskId` (string?), `Title`, `Subject`, `EstimatedMinutes` (int), `ActualMinutes` (int), `StartedAt` (string?), `CompletedAt` (string). Run `dotnet build`.

5. **Add `ToCompletionResponse()` mapper** — add a `ToCompletionResponse(this TaskCompletion completion)` static extension method to `backend/StudyBuddy.Api/DTOs/TaskMapper.cs` following the `.ToResponse()` pattern; format dates as ISO 8601 using `ToString("o")`; handle nullable `StartedAt` and `LinkedTaskId` with conditional expression (`?.ToString("o")`). Run `dotnet build`.

6. **Extend `ITaskService` interface** — inside `backend/StudyBuddy.Api/Services/TaskService.cs`, add `IEnumerable<TaskCompletion> GetHistory()` to the `ITaskService` interface. Run `dotnet build` (it will fail until step 7 implements it — that is expected; fix before moving on).

7. **Implement history logic in `InMemoryTaskService`** — in `backend/StudyBuddy.Api/Services/TaskService.cs`:
   - Add `private List<TaskCompletion> _completions = new();` and `private int _nextCompletionId = 1;` fields.
   - In `CreateTask`: assign `task.LinkedTaskId = request.LinkedTaskId` before adding to `_tasks`.
   - In `UpdateTask` (inside `lock (_lock)`):
     - If the new `status` is `StudyTaskStatus.InProgress` and `task.StartedAt` is null → `task.StartedAt = DateTime.UtcNow`.
     - If the new `status` is `StudyTaskStatus.Done`:
       - Capture `completedAt = DateTime.UtcNow`.
       - Compute `actualMinutes` = `task.StartedAt.HasValue ? (int)Math.Round((completedAt - task.StartedAt.Value).TotalMinutes) : task.EstimatedMinutes`.
       - Create a `TaskCompletion` record and add it to `_completions`.
       - Increment `_nextCompletionId`.
   - Implement `GetHistory()`: return `_completions.OrderByDescending(c => c.CompletedAt).ToList()`.
   - In `Reset()`: add `_completions = new List<TaskCompletion>(); _nextCompletionId = 1;`.
   Run `dotnet build`.

8. **Add `GET /api/tasks/history` endpoint** — in `backend/StudyBuddy.Api/Program.cs`, insert the route **before** `GET /api/tasks/{id}`, following the `GET /api/tasks` endpoint pattern:
   ```
   app.MapGet("/api/tasks/history", (ITaskService taskService) =>
   {
       var history = taskService.GetHistory();
       return Results.Ok(history.Select(c => c.ToCompletionResponse()));
   })
   .WithName("GetTaskHistory")
   .WithOpenApi();
   ```
   Run `dotnet build` then `dotnet test` from `backend/` — all 34 existing tests must still pass.

### Frontend

9. **Update `lib/types.ts`** — in `frontend/lib/types.ts`:
   - Add `TaskCompletion` type with fields: `id` (string), `taskId` (string), `linkedTaskId` (string | null), `title` (string), `subject` (string), `estimatedMinutes` (number), `actualMinutes` (number), `startedAt` (string | null), `completedAt` (string).
   - Update `CreateTaskInput` to `Omit<StudyTask, "id" | "status" | "createdAt"> & { linkedTaskId?: string }`.

10. **Add `getTaskHistory()` to `lib/api.ts`** — in `frontend/lib/api.ts`, add a `getTaskHistory(): Promise<TaskCompletion[]>` function following the `fetchTasks()` pattern (`GET /api/tasks/history`, throw on `!res.ok`).

11. **Create `task-history-panel.tsx`** — create `frontend/components/task-history-panel.tsx` as a client component (`"use client"`). Props: `history: TaskCompletion[]`. For each record render: title, subject, estimated vs actual minutes, completion date (formatted nicely). When `linkedTaskId` is non-null, look up the linked record from `history` by `id === linkedTaskId` and compute the trend:
    - `actualMinutes < linked.actualMinutes` → "Faster" (green)
    - `actualMinutes > linked.actualMinutes` → "Slower" (red)
    - Equal → "Same" (slate/gray)
    Display an empty-state message when `history.length === 0`.

12. **Update `add-task-form.tsx`** — in `frontend/components/add-task-form.tsx`:
    - Add `history?: TaskCompletion[]` to `AddTaskFormProps`.
    - Add `linkedTaskId` to `formData` state (initial value: `""`).
    - After the estimated minutes field, conditionally render a `<select>` for "Link to previous task" **only when** `history && history.length > 0`. Options: a blank default option plus one per history record showing `title (completedAt date)`.
    - Pass `linkedTaskId: formData.linkedTaskId || undefined` in the `onAddTask` call.

13. **Update `study-dashboard.tsx`** — in `frontend/components/study-dashboard.tsx`:
    - Add state: `const [history, setHistory] = useState<TaskCompletion[]>([])` and `const [activeTab, setActiveTab] = useState<"tasks" | "history">("tasks")`.
    - Add import for `getTaskHistory` and `TaskCompletion`.
    - Add `loadHistory` async function (parallel to `loadTasks`) that calls `getTaskHistory()` and sets `history`; errors should not crash the task list (catch silently or show a secondary error).
    - Call `loadHistory()` in the `useEffect` alongside `loadTasks()`.
    - Add a tab bar above the task list switching between "Tasks" and "History" views.
    - Render `<TaskHistoryPanel history={history} />` when `activeTab === "history"`.
    - Pass `history={history}` to `<AddTaskForm />`.

### Tests

14. **Backend unit tests** — in `backend/StudyBuddy.Api.Tests/TaskServiceTests.cs`, add the following `[Fact]` tests:
    - `UpdateTask_ShouldSetStartedAt_WhenTransitioningToInProgress` — transition task "1" to `InProgress`, assert `task.StartedAt` is not null and close to `UtcNow`.
    - `UpdateTask_ShouldNotOverwriteStartedAt_WhenAlreadySet` — set `InProgress` twice, assert `StartedAt` is not updated on second call.
    - `UpdateTask_ShouldCreateCompletion_WhenTransitioningToDone` — move task "2" (already `InProgress`) to `Done`, call `GetHistory()`, assert one record with correct `taskId`, `title`, `subject`, `actualMinutes >= 0`.
    - `UpdateTask_ShouldFallbackToEstimatedMinutes_WhenStartedAtIsNull` — move task "1" (Todo, never InProgress) directly to `Done`, assert `GetHistory()` record has `actualMinutes == task.EstimatedMinutes`.
    - `GetHistory_ShouldReturnRecordsNewestFirst` — complete two tasks with a small delay or manipulate `CompletedAt`, assert returned order is newest-first.
    - `CreateTask_ShouldPersistLinkedTaskId` — create task with `LinkedTaskId = "someCompletionId"`, assert returned/retrieved task has matching `LinkedTaskId`.
    - `Reset_ShouldClearCompletions` — complete a task, call `Reset()`, assert `GetHistory()` returns empty.

15. **Backend integration tests** — in `backend/StudyBuddy.Api.Tests/ApiEndpointsTests.cs`, add:
    - `GetTaskHistory_ShouldReturnEmptyList_Initially` — `GET /api/tasks/history` → `200 OK`, body is `[]`.
    - `GetTaskHistory_ShouldReturnCompletion_AfterFullStatusFlow` — move task "2" to `InProgress` via `PATCH`, then to `Done` via `PATCH`, then `GET /api/tasks/history`; assert one record with non-null `completedAt` and `actualMinutes >= 0`.
    - `CreateTask_ShouldAcceptLinkedTaskId` — `POST /api/tasks` with `linkedTaskId: "abc"`, assert `201 Created` (backend accepts it without error).
    - `GetTaskHistory_ShouldReturnNewestFirst` — complete two tasks in order, assert history items are returned newest-first by checking `completedAt` order.

16. **Frontend tests** — using the `jest.mock('@/lib/api')` pattern from `frontend/components/__tests__/study-dashboard.test.tsx`:
    - In `study-dashboard.test.tsx`: add `mockGetTaskHistory` mock; test that History tab renders `<TaskHistoryPanel>` content; test that `getTaskHistory` is called on mount.
    - Create `frontend/components/__tests__/task-history-panel.test.tsx`: render with empty history → shows empty state; render with one completion → shows title/minutes; render linked task with faster actual → shows "Faster" indicator; render linked task with slower actual → shows "Slower" indicator.
    - In `add-task-form.test.tsx`: test that "Link to previous task" select is NOT shown when `history` is empty/undefined; test that it IS shown when `history` has entries; test that selected `linkedTaskId` is passed to `onAddTask`.

---

## Validation Gates

- `cd c:\Users\JurreB\Documents\studybuddy\studybuddy-workshop\backend ; dotnet build` — passing: `Build succeeded. 0 Error(s)`
- `cd c:\Users\JurreB\Documents\studybuddy\studybuddy-workshop\backend ; dotnet test` — passing: all tests pass, minimum 34 pre-existing + new tests green, 0 failed
- `cd c:\Users\JurreB\Documents\studybuddy\studybuddy-workshop\frontend ; pnpm test -- --passWithNoTests` — passing: all tests pass, minimum 53 pre-existing + new tests green, 0 failed
- Manual smoke test (optional, requires running services): `GET http://localhost:5000/api/tasks/history` returns `[]`; PATCH task "1" to `in-progress`, PATCH to `done`, then history returns one record with `actualMinutes` ≥ 0.

---

## Completion Checklist

- [ ] `StudyTask` model has `StartedAt` (DateTime?) and `LinkedTaskId` (string?) properties
- [ ] `CreateTaskRequest` has optional `LinkedTaskId` (string?)
- [ ] `TaskCompletion` model exists with all required fields
- [ ] `TaskCompletionResponse` DTO exists matching model fields (dates as ISO 8601 strings)
- [ ] `ToCompletionResponse()` mapper extension method added to `TaskMapper.cs`
- [ ] `ITaskService` interface declares `GetHistory()`
- [ ] `InMemoryTaskService` sets `StartedAt` on transition to `InProgress` (only if currently null)
- [ ] `InMemoryTaskService` creates `TaskCompletion` record on transition to `Done`
- [ ] `actualMinutes` falls back to `estimatedMinutes` when `StartedAt` is null (no error thrown)
- [ ] `actualMinutes` is rounded to nearest minute when calculated from timestamps
- [ ] `CreateTask` persists `LinkedTaskId` from request onto the task
- [ ] `GetHistory()` returns records sorted newest-first
- [ ] `Reset()` clears both `_completions` and `_nextCompletionId`
- [ ] `GET /api/tasks/history` endpoint registered **before** `GET /api/tasks/{id}` in `Program.cs`
- [ ] `GET /api/tasks/history` returns `200 OK` with JSON array of `TaskCompletionResponse`
- [ ] `TaskCompletion` frontend type added to `lib/types.ts`
- [ ] `CreateTaskInput` extended with optional `linkedTaskId?` in `lib/types.ts`
- [ ] `getTaskHistory()` API function added to `lib/api.ts`
- [ ] `task-history-panel.tsx` component created with completion list and trend indicators
- [ ] Trend indicator shows "Faster" (green) / "Slower" (red) / "Same" (gray) using linked completion lookup
- [ ] Empty history state renders a message (not an empty list)
- [ ] `add-task-form.tsx` shows "Link to previous task" dropdown only when `history.length > 0`
- [ ] `add-task-form.tsx` passes `linkedTaskId` in `onAddTask` call
- [ ] `study-dashboard.tsx` loads history on mount without blocking task list
- [ ] `study-dashboard.tsx` has tab switching between Tasks and History views
- [ ] History fetch failure does not crash the task list view
- [ ] All pre-existing 34 backend tests still pass
- [ ] All pre-existing 53 frontend tests still pass
- [ ] New backend unit tests for `startedAt`, completion creation, fallback, sort order, linkedTaskId, reset
- [ ] New backend integration tests for full status flow, history endpoint shape, linkedTaskId acceptance
- [ ] New frontend tests for history panel, dashboard tab, add-task-form linked task dropdown
