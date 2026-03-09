---
name: github-issue-publisher
description: Publish an approved draft issue to GitHub using the GitHub MCP. Handles label assignment (frontend, backend, feature, bug, enhancement, testing, documentation), sets the title and body from the draft file, and returns the created issue number and URL. ALWAYS use this skill when the user approves an issue draft and it needs to be pushed to the GitHub repository — do not call github/issue_write directly without going through this skill.
---

# GitHub Issue Publisher

Use this skill to push an approved local issue draft to GitHub with the correct labels, title, and body. It is the final step in the Issue Creator workflow and is invoked immediately after the user approves the draft.

## Prerequisites

- An approved draft issue file exists under `issues/` (produced by the `issue-draft-template` skill).
- The GitHub MCP tool `github/issue_write` is available (`github/*` in the agent's tools list).
- Repository context is known: `owner = JurreBrandsenInfoSupport`, `repo = studybuddy-workshop`.

## Workflow

### Step 1 — Read the draft

Read the approved draft file from `issues/`. Extract:
- **Title**: the first H1 heading (`# <title>`), stripped of the `#` prefix.
- **Body**: the entire markdown content of the file (including the title line).

### Step 2 — Determine labels

Inspect the draft content and build a label list according to the rules below. Apply every rule that matches — labels are not mutually exclusive.

#### Category labels (pick one or both)

| Label | When to apply |
|---|---|
| `frontend` | "Frontend changes:" in Technical Notes is not "None" |
| `backend` | "Backend changes:" in Technical Notes is not "None" |

#### Type labels (pick the best fit)

| Label | When to apply |
|---|---|
| `bug` | Title starts with `Fix` **or** description uses words like "broken", "error", "fails", "incorrect", "crash" |
| `feature` | Title starts with `Add`, `Implement`, `Create`, or `Build` |
| `enhancement` | Title starts with `Update`, `Improve`, `Refactor`, or `Enhance` |
| `documentation` | Title starts with `Document` **or** Technical Notes mentions docs/README |

> If neither `bug`, `feature`, nor `enhancement` matches, default to `enhancement`.

#### Auxiliary labels

| Label | When to apply |
|---|---|
| `testing` | Testing Considerations section introduces **substantial new test infrastructure** — e.g. a brand-new test file, a new custom hook or utility being tested for the first time, or a new integration test suite. Do **not** apply for routine mentions of adding a few unit tests to an already-tested component. Ask yourself: would a developer picking up this issue spend a meaningful chunk of their time purely on test scaffolding? If yes → apply. If the testing work is incidental to the feature → skip. |

#### Label validation

Before submitting, ensure the final label list:
- Contains **at least one** type label (`bug`, `feature`, or `enhancement`).
- Contains **at least one** category label (`frontend` or `backend`) unless neither section has changes.
- Has **no duplicates**.

### Step 3 — Create the GitHub issue

Call `github/issue_write` with the following arguments:

```
owner:  JurreBrandsenInfoSupport
repo:   studybuddy-workshop
title:  <extracted title>
body:   <full draft markdown content>
labels: <computed label list>
```

### Step 4 — Confirm and report

After the tool returns successfully, report back:

```
Issue created: #<number> — <title>
URL: <html_url>
Labels: <comma-separated label list>
```

If the tool call fails, surface the error message to the user and suggest checking that:
- The repository name and owner are correct.
- The labels already exist in the repository (GitHub rejects unknown label names on creation).
- The user has write access to the repository.

## Label Reference for StudyBuddy+

The following labels are expected to exist in the repository. Create missing ones before publishing if needed (use `github/label_create` if available, otherwise ask the user to create them manually):

| Label name | Color | Description |
|---|---|---|
| `frontend` | `#0075ca` | Changes to the Next.js frontend |
| `backend` | `#e4e669` | Changes to the .NET backend |
| `feature` | `#a2eeef` | New feature or request |
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#84b6eb` | Improvement to an existing feature |
| `testing` | `#bfd4f2` | Adds or updates test coverage |
| `documentation` | `#0075ca` | Documentation changes only |

## Example

Given this draft excerpt:

```markdown
# Add Pomodoro Timer to Task Cards

## Technical Notes
- **Frontend changes:** `task-card.tsx`, new `useTimer` hook
- **Backend changes:** `POST /api/tasks/{id}/timer/start`, `POST /api/tasks/{id}/timer/stop`
```

The label list would be: `frontend`, `backend`, `feature`.

## Error Handling

| Situation | Action |
|---|---|
| `github/issue_write` returns 404 | Verify `owner` and `repo` values |
| `github/issue_write` returns 422 | One or more labels don't exist — see Label Reference above |
| Draft file not found in `issues/` | Ask the user to confirm the file path before proceeding |
