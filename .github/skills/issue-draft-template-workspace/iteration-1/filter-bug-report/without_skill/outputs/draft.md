# Bug: Task status filter shows incorrect results — 'in-progress' filter also displays 'done' tasks

## User Story

As a student using the StudyBuddy+ dashboard,
I want the status filter to show only tasks matching the selected status,
So that I can focus on the tasks that are relevant to my current workflow.

## Bug Description

When selecting the **"In Progress"** filter button on the task dashboard, tasks with a status of `"done"` are incorrectly included in the displayed results. The filter should exclusively show tasks whose `status` field equals `"in-progress"`.

### Steps to Reproduce

1. Open the StudyBuddy+ dashboard.
2. Ensure at least one task exists with status `"in-progress"` and at least one with status `"done"`.
3. Click the **"In Progress"** filter button in the `TaskFilters` component.
4. Observe that tasks marked as `"done"` are still visible alongside `"in-progress"` tasks.

### Expected Behaviour

Only tasks with `status === "in-progress"` are displayed when the **"In Progress"** filter is active.

### Actual Behaviour

Tasks with `status === "done"` appear in the filtered results alongside `"in-progress"` tasks.

## Acceptance Criteria

- [ ] Selecting "In Progress" shows **only** tasks with `status === "in-progress"`.
- [ ] Selecting "Done" shows **only** tasks with `status === "done"`.
- [ ] Selecting "To Do" shows **only** tasks with `status === "todo"`.
- [ ] Selecting "All" continues to display every task regardless of status.
- [ ] The filter buttons correctly highlight the active filter.
- [ ] All existing frontend filter tests pass; new regression tests are added to cover this scenario.

## Technical Notes

- **Filter component**: `frontend/components/task-filters.tsx` — renders filter buttons and emits the selected `FilterType` value via `onFilterChange`.
- **Filtering logic**: `frontend/components/study-dashboard.tsx` — the `filteredTasks` derived value uses `task.status === filter` to decide which tasks to display.
- **Relevant types**: `FilterType = "all" | "todo" | "in-progress" | "done"` in `frontend/lib/types.ts`.
- The filter values emitted by `TaskFilters` (`"in-progress"`, `"done"`, etc.) must exactly match the `status` values stored on `StudyTask` objects returned by the API.
- Investigate whether the mismatch occurs in the comparison logic in `study-dashboard.tsx`, in how `TaskFilters` emits the selected value, or in how task `status` values are mapped from the API response in `frontend/lib/api.ts`.

## Testing

- Add or update unit tests in `frontend/components/__tests__/study-dashboard.test.tsx` to assert that:
  - Given tasks with statuses `"todo"`, `"in-progress"`, and `"done"`, filtering by `"in-progress"` renders **only** the `"in-progress"` task.
  - Filtering by `"done"` renders **only** `"done"` tasks; no `"in-progress"` tasks appear.
- Verify existing tests in `frontend/components/__tests__/task-filters.test.tsx` still pass.

**Labels**: `bug`, `frontend`
