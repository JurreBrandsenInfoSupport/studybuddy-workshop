# Reasoning Transcript — Filter Bug Issue Draft

## Step 1: Understand the task

The request is to draft a GitHub issue for a bug where selecting the "in-progress" status filter on the StudyBuddy+ dashboard incorrectly displays tasks with status "done".

---

## Step 2: Explore the relevant codebase

### Files read

**`frontend/components/task-filters.tsx`**
- Renders four filter buttons: "All", "To Do", "In Progress", "Done".
- Maps to `FilterType` values: `"all"`, `"todo"`, `"in-progress"`, `"done"`.
- Emits the selected `FilterType` via the `onFilterChange` callback prop.
- No internal filtering logic — it is purely a presentational component.

**`frontend/components/study-dashboard.tsx`**
- Owns the `filter` state (type `FilterType`, default `"all"`).
- Passes `filter` and `setFilter` (via `handleFilterChange`) down to `TaskFilters`.
- Derives `filteredTasks` with:
  ```ts
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });
  ```
- This is where the filtering logic lives and where a status-comparison bug would most likely manifest.

**`frontend/lib/types.ts`**
- `TaskStatus = "todo" | "in-progress" | "done"`
- `FilterType = "all" | TaskStatus`
- The string values align exactly between filters and task statuses.

**`frontend/components/__tests__/task-filters.test.tsx`**
- Tests cover: button rendering, active-filter highlighting, `onFilterChange` callbacks, sort direction text.
- No test exists that exercises the end-to-end filter → displayed tasks behaviour specifically for `"in-progress"` vs `"done"` confusion.

---

## Step 3: Identify the likely bug location

The comparison `task.status === filter` in `study-dashboard.tsx` looks correct at the type level, but the bug report indicates a runtime mismatch. Likely causes include:

1. A discrepancy between the `status` values returned by the API (e.g., casing, whitespace) and the string literals used in the comparison.
2. A logic error or off-by-one mistake in the filter condition that was introduced in a recent change.
3. A missing strict-equality guard (e.g., using loose equality or an incorrect fallback).

The issue report should point developers at the right files and encourage investigation rather than prescribing the exact fix, since the root cause requires a runtime test to confirm.

---

## Step 4: Draft structure decisions

Used a standard bug report structure:
- **Title**: clear, descriptive, naming both the wrong filter and the incorrectly shown status.
- **User Story**: framed from the student's perspective.
- **Bug Description**: steps to reproduce + expected vs actual.
- **Acceptance Criteria**: checkboxes covering all four filter states plus test coverage.
- **Technical Notes**: pinpoints the two relevant files and the exact code location to investigate.
- **Testing**: specifies concrete new test cases to add as regression guards.
- **Labels**: `bug`, `frontend`.

No special skill template was used — the format is based on general best practices for actionable bug reports.

---

## Step 5: Output

Draft saved to:
`...\without_skill\outputs\draft.md`
