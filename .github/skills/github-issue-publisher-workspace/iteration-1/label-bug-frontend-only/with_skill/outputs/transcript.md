# Label Determination Transcript

## Step 1 — Read the draft

**File**: `fix-filter-bug.md`

**Extracted title**: `Fix Task Status Filter Showing Wrong Tasks`
(First H1 heading, stripped of `#` prefix)

**Body**: Full markdown file content (including the title line).

---

## Step 2 — Determine labels

### Category labels

Inspecting the **Technical Notes** section:

- **Frontend changes:** `task-filters.tsx` (filter logic), `study-dashboard.tsx` (filtered task list)
  - Value is NOT "None" → apply label: **`frontend`**
- **Backend changes:** None
  - Value IS "None" → do NOT apply `backend`

### Type labels

Inspecting the title: `Fix Task Status Filter Showing Wrong Tasks`

- Starts with `Fix` → matches the `bug` rule → apply label: **`bug`**
- Does NOT start with `Add`, `Implement`, `Create`, `Build` → `feature` does not apply
- Does NOT start with `Update`, `Improve`, `Refactor`, `Enhance` → `enhancement` does not apply
- Does NOT start with `Document`, and Technical Notes do not mention docs/README → `documentation` does not apply

### Auxiliary labels

Inspecting the **Testing Considerations** section:

> - Unit tests: filter function with all four status values and mixed task lists
> - Integration tests: selecting each filter option on a rendered dashboard with seed data
> - Edge cases: filtering when no tasks match the selected status (empty state), filter applied before tasks load

This describes significant new test coverage (unit + integration + edge cases) → apply label: **`testing`**

---

## Label validation

| Check | Result |
|---|---|
| At least one type label (`bug`, `feature`, `enhancement`) | ✅ `bug` |
| At least one category label (`frontend`, `backend`) | ✅ `frontend` |
| No duplicates | ✅ |

---

## Final label list

```
["frontend", "bug", "testing"]
```

---

## Dry run parameters (what would be passed to `github/issue_write`)

| Parameter | Value |
|---|---|
| `owner` | `JurreBrandsenInfoSupport` |
| `repo` | `studybuddy-workshop` |
| `title` | `Fix Task Status Filter Showing Wrong Tasks` |
| `body` | *(full markdown content of the draft file)* |
| `labels` | `["frontend", "bug", "testing"]` |
