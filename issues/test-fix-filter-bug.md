# Fix task status filter showing incorrect results

## User Story
As a student using the StudyBuddy+ dashboard,
I want the status filter to show only tasks matching the selected status,
so that I can focus on the right work without being distracted by tasks in other states.

## Description
The `TaskFilters` component lets users filter tasks by "todo", "in-progress", or "done" status, but selecting "in-progress" incorrectly includes tasks whose status is "done". The filter comparison in `study-dashboard.tsx` evaluates `task.status === filter`, which should be correct in principle, but the mismatch between displayed and actual task statuses suggests a defect in how the filter value is applied or how task status values are normalised before comparison. No backend changes are required as this is purely a frontend rendering concern.

## Acceptance Criteria
- [ ] Selecting the "In Progress" filter displays only tasks with status `"in-progress"` and excludes tasks with status `"todo"` or `"done"`
- [ ] Selecting the "Done" filter displays only tasks with status `"done"`, with no `"todo"` or `"in-progress"` tasks visible
- [ ] Selecting the "To Do" filter displays only tasks with status `"todo"`, with no `"in-progress"` or `"done"` tasks visible
- [ ] Selecting "All" shows every task regardless of status
- [ ] An empty-state message is shown when no tasks match the active filter
- [ ] Status filter results update immediately on selection with no stale data visible

## Technical Notes
- **Frontend changes:** `frontend/components/study-dashboard.tsx` — `filteredTasks` derivation; `frontend/components/task-filters.tsx` — verify filter value passed to `onFilterChange` matches `TaskStatus` literals exactly
- **Backend changes:** None
- **Database:** None
- **Dependencies:** None

## Testing Considerations
- Unit tests: `filteredTasks` logic in `StudyDashboard` should be unit-tested for each `FilterType` value ("all", "todo", "in-progress", "done") against a mock task list containing tasks of every status
- Integration tests: Render `StudyDashboard` with mocked API returning tasks of all three statuses; assert that clicking each filter button shows only the expected subset of tasks
- Edge cases: Empty task list with any filter active; all tasks sharing the same status; rapidly switching filters in sequence; task status updated via `handleStatusChange` while a filter is active (task should move out of the filtered view immediately)
