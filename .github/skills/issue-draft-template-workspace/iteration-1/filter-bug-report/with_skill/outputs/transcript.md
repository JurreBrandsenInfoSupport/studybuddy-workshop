# Transcript: issue-draft-template skill run — filter-bug-report

## Task
Draft a GitHub issue for the bug where the task status filter on the StudyBuddy+ dashboard shows incorrect results: selecting "in-progress" still displays tasks marked as "done".

## Reasoning Steps

### 1. Read relevant source files
- Read `frontend/components/task-filters.tsx` to understand the filter UI and which values are emitted when the user clicks a filter button.
  - Confirmed: button `onClick` calls `onFilterChange(filter.value)` where `filter.value` is one of `"all" | "todo" | "in-progress" | "done"` — all lowercase, matching `FilterType`.
- Read `frontend/components/study-dashboard.tsx` to understand how the filter value is consumed.
  - Confirmed: `filteredTasks` is derived via `tasks.filter(task => filter === "all" || task.status === filter)`.
  - At first glance this is correct, but the bug report says tasks bleed through — indicating the comparison or the value source has a defect (possibly the filter state is not updating, the status value coming from the API differs in casing/format, or there is a stale closure).
- Read `frontend/lib/types.ts` to confirm type definitions: `TaskStatus = "todo" | "in-progress" | "done"`, `FilterType = "all" | TaskStatus`.

### 2. Scoping decision
The bug is entirely in the frontend filter path. No backend or DB changes are needed. The most likely root causes are:
- A case-sensitivity mismatch between the API-returned `status` field and the filter literal (e.g., API returns `"In-Progress"` or `"inprogress"`).
- The `filter` state not updating correctly because `onFilterChange` is not wired properly.
- A stale closure where `filteredTasks` captures an old `filter` value.

The issue does not need to pre-diagnose the exact cause — that is left to the implementation agent — but the acceptance criteria and testing notes guide them to verify all filter values exhaustively.

### 3. Draft construction
Applied the skill template literally:
- **Title**: "Fix task status filter showing incorrect results" (51 chars, starts with "Fix", actionable scope)
- **User story**: Student persona; goal = correct filter behaviour; benefit = focus without distraction
- **Description**: 3 sentences covering context (filter component), the observed symptom, and possible defect area; notes no backend impact
- **Acceptance criteria**: 6 checklist items — one per filter value (in-progress, done, todo, all), one for empty state, one for immediate update; all are observable and measurable
- **Technical notes**: Mapped to the two frontend files; all other fields "None"
- **Testing considerations**: Unit (filteredTasks logic per filter value), integration (full dashboard render with mocked API), edge cases (empty list, homogeneous list, rapid switching, post-update filter state)

### 4. Quality checklist
- [x] User story states who (student), what (correct filter results), why (focus on right work)
- [x] All acceptance criteria are observable/measurable
- [x] Technical notes reference both touched files
- [x] Testing covers happy path (each filter), integration (dashboard render), and edge cases
- [x] No unknowns left unaddressed (root cause investigation deferred to implementation agent by design)

## Output files
- `issues/test-fix-filter-bug.md`
- `.github/skills/issue-draft-template-workspace/iteration-1/filter-bug-report/with_skill/outputs/draft.md`
