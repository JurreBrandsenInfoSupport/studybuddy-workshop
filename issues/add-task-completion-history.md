# Add Task Completion History and Time Analysis

## User Story
As a student,
I want completed tasks to be saved with the actual time I spent on them,
so that I can see whether the same kind of task is taking me more or less time than it did before.

## Description
Currently, tasks are marked "done" but carry no record of when they were completed or how long they actually took. This feature persists completed tasks in a history log — capturing a `startedAt` timestamp (set when a task moves to "in-progress"), a `completedAt` timestamp, and a derived `actualMinutes` value — and exposes a history view in the frontend so students can spot trends (e.g. "Biology reading used to take 60 min, now it takes 40 min"). Tasks can optionally be linked to a previous completed task via a `linkedTaskId` field set at creation time, enabling accurate same-task trend comparison without relying on title/subject matching.

## Acceptance Criteria
- [ ] When creating a new task, if completed tasks exist in history, the user can optionally select one to link to (setting `linkedTaskId` on the new task).
- [ ] When a task transitions to "in-progress", a `startedAt` timestamp (UTC) is recorded automatically on the task.
- [ ] When a task is marked "done", `completedAt` (UTC) is recorded and `actualMinutes` is derived as `completedAt − startedAt` (rounded to the nearest minute). If `startedAt` is absent, `actualMinutes` falls back to `estimatedMinutes`.
- [ ] A `TaskCompletion` record is persisted in a separate history store containing: `id`, `taskId`, `linkedTaskId` (nullable), `title`, `subject`, `estimatedMinutes`, `actualMinutes`, `startedAt`, `completedAt`.
- [ ] Completed tasks are preserved in the history store and never deleted automatically.
- [ ] A `GET /api/tasks/history` endpoint returns all historical completion records, sorted newest-first.
- [ ] The frontend displays a "History" tab or panel listing completion records with title, subject, estimated vs. actual minutes, and completion date.
- [ ] When a task has a `linkedTaskId`, the history panel shows a trend indicator (faster / slower / same) compared to the linked task's `actualMinutes`.
- [ ] If `startedAt` is missing when a task is marked "done", no error is thrown — the fallback to `estimatedMinutes` is applied silently.

## Technical Notes
- **Frontend changes:** `add-task-form.tsx` (optional "Link to previous task" dropdown, populated from history); `study-dashboard.tsx` (new History tab/panel, state for history records); new `task-history-panel.tsx` component; `lib/api.ts` (add `getTaskHistory()` call); `lib/types.ts` (add `TaskCompletion` type with `startedAt`, `completedAt`, `actualMinutes`, `linkedTaskId`).
- **Backend changes:** `StudyTask` model gains `StartedAt` (nullable `DateTime?`) and `LinkedTaskId` (nullable `string?`); new `TaskCompletion` model and `TaskCompletionResponse` DTO; `ITaskService` / `InMemoryTaskService` extended to record `StartedAt` on status→in-progress transition, create a `TaskCompletion` on status→done, and expose `GetHistory()`; `Program.cs` adds `GET /api/tasks/history`; `CreateTaskRequest` model gains optional `LinkedTaskId`.
- **Database:** None — in-memory storage only; `_completions` list lives alongside `_tasks` in `InMemoryTaskService`.
- **Dependencies:** None.

## Testing Considerations
- Unit tests: `TaskService` — `StartedAt` is set on transition to in-progress; completion record is created on transition to done with correct `actualMinutes`; fallback to `estimatedMinutes` when `startedAt` is null; `GetHistory` returns records newest-first; `LinkedTaskId` is persisted on both the task and the completion record.
- Integration tests: Full status-change flow (todo → in-progress → done) via `PATCH /api/tasks/{id}/status`; `GET /api/tasks/history` returns expected shape; `POST /api/tasks` with `linkedTaskId` stores the field correctly.
- Edge cases: Completing a task that was never moved to in-progress (fallback to `estimatedMinutes`); history empty state in the frontend (no "Link to previous task" option shown); linking to a non-existent completion ID (validate or ignore gracefully).
