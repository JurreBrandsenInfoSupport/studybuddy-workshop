# Reasoning Transcript — Pomodoro Timer Issue Draft

## Request Summary
Draft a GitHub issue to add a Pomodoro timer UI to task cards in StudyBuddy+. The timer must support normal and pomodoro modes. Backend timer endpoints already exist; only the frontend UI needs to be built.

## Context Gathered

### Files Read
- `frontend/components/task-card.tsx` — The existing task card component. It accepts `task`, `onStatusChange`, `onDelete`, and `isUpdating` props. Renders a status badge, task title, subject, estimated minutes, and status-change buttons. No timer UI currently exists. Uses Lucide `Clock`, `BookOpen`, and `Trash2` icons.
- `frontend/lib/api.ts` — API client with `fetchTasks`, `createTask`, `updateTaskStatus`, and `deleteTask`. No timer API functions exist yet, so `startTimer` and `stopTimer` functions need to be added here.

### Key Design Decisions

1. **Scope is frontend-only.** Backend already has `POST /api/tasks/{id}/timer/start` and `POST /api/tasks/{id}/timer/stop`. No backend changes are needed, which narrowed the Technical Notes section significantly.

2. **Timer modes:**
   - *Normal mode*: counts down from `task.estimatedMinutes` (already available on the task object).
   - *Pomodoro mode*: classic 25-minute work / 5-minute break cycle, automatically advancing phases.

3. **State is local to the card.** No global state management is required. `useState`, `useEffect`, and `useRef` (for the interval handle) are sufficient and already available in the React 19 / Next.js 14 project.

4. **API helpers in `lib/api.ts`.** Consistent with the project convention that all fetch calls go through `lib/api.ts` rather than inline in components.

5. **`isUpdating` integration.** The existing card `isUpdating` prop disables all card interactions while a backend operation is in-flight. Timer controls should respect this to avoid conflicting state.

6. **No new dependencies.** The project already uses Lucide icons and Radix/Tailwind. A timer icon (e.g., `Timer` from Lucide) can be used without adding packages.

### Title Evaluation
- Candidate: "Add Pomodoro Timer UI to Task Cards" — 38 characters, starts with a verb, scope is specific. Passes the title rules.

### Acceptance Criteria Construction
- Happy path: mode selector renders, Normal counts down from `estimatedMinutes`, Pomodoro cycles phases, API calls fire on Start/Stop.
- Edge cases: `estimatedMinutes = 0`, rapid Start/Stop clicks, mode switch while running, API error handling.
- Disabling: timer controls respect `isUpdating`.
- State reset: no persistence across reloads.

### Quality Checklist
- [x] User story states who (student), what (timer with two modes), and why (focused sessions / productivity).
- [x] Acceptance criteria are observable and measurable.
- [x] Technical notes map to touched files (`task-card.tsx`, `api.ts`).
- [x] Testing covers happy path (unit + integration) and edge cases.
- [x] Assumption noted: no type changes needed in `types.ts` unless backend returns timer metadata in the response body.

## Output
Draft saved to:
- `issues/test-pomodoro-timer.md`
- `.github/skills/issue-draft-template-workspace/iteration-1/pomodoro-timer-feature/with_skill/outputs/draft.md`
