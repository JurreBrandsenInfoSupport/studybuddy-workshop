# Fix Task Status Filter Showing Wrong Tasks

## User Story
As a student,
I want the status filter on the dashboard to show only tasks that match the selected status,
so that I can focus on the right tasks without irrelevant entries cluttering my view.

## Description
Currently, selecting "in-progress" in the task status filter still displays tasks with a "done" status. The filter logic in the `task-filters.tsx` component and the `study-dashboard.tsx` state management needs to be corrected to apply the selected filter accurately.

## Acceptance Criteria
- [ ] Selecting "todo" shows only tasks with status "todo"
- [ ] Selecting "in-progress" shows only tasks with status "in-progress"
- [ ] Selecting "done" shows only tasks with status "done"
- [ ] Selecting "all" (or clearing the filter) shows every task regardless of status
- [ ] The filter survives a page reload (filter state is reflected in the URL or persisted)

## Technical Notes
- **Frontend changes:** `task-filters.tsx` (filter logic), `study-dashboard.tsx` (filtered task list)
- **Backend changes:** None
- **Database:** None
- **Dependencies:** None

## Testing Considerations
- Unit tests: filter function with all four status values and mixed task lists
- Integration tests: selecting each filter option on a rendered dashboard with seed data
- Edge cases: filtering when no tasks match the selected status (empty state), filter applied before tasks load
