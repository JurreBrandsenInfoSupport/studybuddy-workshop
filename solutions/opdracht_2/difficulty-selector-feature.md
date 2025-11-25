# Implementation Plan: Difficulty Selector Feature

## Task Analysis

Based on `TASK-final.md`, this feature adds a difficulty level selector to the StudyBuddy+ task management application. The feature allows students to assign difficulty levels ('makkelijk', 'gemiddeld', 'moeilijk') to their tasks for better time estimation and prioritization.

### User Story
> Als student wil ik een moeilijkheidsgraad toewijzen aan mijn taken, zodat ik de studietijd beter kan inschatten en uitdagende opdrachten kan prioriteren.

### Acceptance Criteria
- ✅ Dropdown menu with options: Makkelijk, Gemiddeld, Moeilijk in task creation form
- ✅ Selected difficulty level is saved with the task
- ✅ Difficulty level is displayed on task cards in the task list
- ✅ Existing tasks default to 'Gemiddeld' difficulty
- ✅ API accepts and validates difficulty field (only 'makkelijk', 'gemiddeld', 'moeilijk' allowed)

---

## Codebase Analysis

### Current Architecture Patterns

**Type Definitions:**
- Backend: `backend/src/types.ts` - Defines `TaskStatus` and `StudyTask` interface
- Frontend: `frontend/lib/types.ts` - Mirror of backend types with additional UI types

**Form Pattern:**
- Location: `frontend/components/add-task-form.tsx`
- Uses controlled inputs with local state
- Uses `datalist` for subject field (lines 107-113)
- Handles async submission with loading states
- Validates required fields before submission

**Display Pattern:**
- Location: `frontend/components/task-card.tsx`
- Uses status badges with color coding (lines 15-23)
- Color schemes: `bg-{color}-100 text-{color}-700` for badges
- Displays metadata using icons from `lucide-react`

**Filtering Pattern:**
- Location: `frontend/components/task-filters.tsx`
- Button group for filter options
- Active state indicated by background color and check icon
- Uses FilterType union type for type safety

**Database Pattern:**
- Location: `backend/src/database.ts`
- Seed data with initial tasks (lines 4-35)
- Methods: `getAllTasks()`, `createTask()`, `updateTask()`, `deleteTask()`
- Uses auto-incrementing ID counter

**API Pattern:**
- Location: `backend/src/index.ts`
- RESTful endpoints: GET, POST, PATCH, DELETE
- Validation in POST endpoint (lines 36-40)
- Status validation in PATCH endpoint (lines 48-52)
- Returns appropriate HTTP status codes

---

## External Research & Documentation

### TypeScript Union Types
- **URL:** https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
- **Usage:** Define difficulty as `type Difficulty = 'makkelijk' | 'gemiddeld' | 'moeilijk'`
- **Benefit:** Type safety and autocomplete support

### HTML Select Element
- **URL:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
- **Pattern:** Use native `<select>` element for dropdown
- **Accessibility:** Ensure proper `<label>` association and required attribute

### Express.js Request Validation
- **URL:** https://expressjs.com/en/api.html#req.body
- **Pattern:** Validate request body fields before database operations
- **Best Practice:** Return 400 Bad Request with error message for invalid input

### React Controlled Components
- **URL:** https://react.dev/reference/react-dom/components/select
- **Pattern:** Control select value through state with `value` and `onChange` props
- **Gotcha:** Must convert event value to appropriate type (use `as Difficulty`)

### Tailwind CSS Select Styling
- **URL:** https://tailwindcss.com/docs/form-elements
- **Pattern:** Apply same styling classes as other form inputs
- **Note:** Current project uses: `w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm`

---

## Implementation Blueprint

### High-Level Approach

This feature requires changes across 6 files in a specific order to maintain consistency:

```
1. Backend Types (define contract)
   ↓
2. Backend Database (seed data)
   ↓
3. Backend API (validation)
   ↓
4. Frontend Types (mirror backend)
   ↓
5. Frontend Form (input)
   ↓
6. Frontend Display (visualization)
```

### Pseudocode Flow

```typescript
// 1. Define type
type Difficulty = 'makkelijk' | 'gemiddeld' | 'moeilijk'

// 2. Extend interface
interface StudyTask {
  // ...existing fields
  difficulty: Difficulty  // Added field
}

// 3. Update seed data
const task = {
  // ...existing fields
  difficulty: 'gemiddeld'  // Default value
}

// 4. Add form field
const [difficulty, setDifficulty] = useState<Difficulty>('gemiddeld')
<select value={difficulty} onChange={...}>
  <option value="makkelijk">Makkelijk</option>
  <option value="gemiddeld">Gemiddeld</option>
  <option value="moeilijk">Moeilijk</option>
</select>

// 5. Display badge
const difficultyColors = {
  makkelijk: 'bg-green-100 text-green-700',
  gemiddeld: 'bg-yellow-100 text-yellow-700',
  moeilijk: 'bg-red-100 text-red-700',
}
<span className={difficultyColors[task.difficulty]}>
  {/* Icon + Label */}
</span>

// 6. Validate API input
const validDifficulties = ['makkelijk', 'gemiddeld', 'moeilijk']
if (!validDifficulties.includes(input.difficulty)) {
  return res.status(400).json({ error: "Invalid difficulty" })
}
```

---

## Detailed Implementation Steps

### Step 1: Update Backend Types (`backend/src/types.ts`)

**Action:** Add Difficulty type and update interfaces

**Code Pattern to Follow:**
```typescript
// Existing pattern (lines 1-2)
export type TaskStatus = "todo" | "in-progress" | "done";

// Add similar pattern
export type Difficulty = "makkelijk" | "gemiddeld" | "moeilijk";
```

**Changes:**
1. Add `Difficulty` type export after `TaskStatus`
2. Add `difficulty: Difficulty` field to `StudyTask` interface
3. CreateTaskInput already uses `Omit<StudyTask, "id" | "status" | "createdAt">`, so difficulty will be automatically included

**File Location:** `backend/src/types.ts` (16 lines total)

---

### Step 2: Update Database Seed Data (`backend/src/database.ts`)

**Action:** Add difficulty field to all seed tasks with appropriate defaults

**Code Pattern to Follow:**
```typescript
// Existing task structure (lines 5-11)
{
  id: "1",
  title: "Complete Calculus Problem Set",
  subject: "Math",
  estimatedMinutes: 60,
  status: "todo",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  // Add: difficulty: "moeilijk",
}
```

**Changes:**
1. Add `difficulty: "moeilijk"` to task 1 (Calculus - typically hard)
2. Add `difficulty: "makkelijk"` to task 2 (Reading - typically easy)
3. Add `difficulty: "moeilijk"` to task 3 (Essay - typically hard)
4. Add `difficulty: "makkelijk"` to task 4 (Vocabulary - typically easy)

**Rationale:** Vary difficulty levels in seed data for testing filter functionality

**File Location:** `backend/src/database.ts`, lines 4-35 (modify INITIAL_TASKS array)

---

### Step 3: Add API Validation (`backend/src/index.ts`)

**Action:** Validate difficulty field in POST endpoint

**Code Pattern to Follow:**
```typescript
// Existing validation pattern (lines 36-40)
if (!input.title || !input.subject || typeof input.estimatedMinutes !== "number") {
  return res.status(400).json({ error: "Missing required fields" });
}
```

**Changes:**
Add validation after existing checks:
```typescript
const validDifficulties = ["makkelijk", "gemiddeld", "moeilijk"];
if (input.difficulty && !validDifficulties.includes(input.difficulty)) {
  return res.status(400).json({ error: "Invalid difficulty level" });
}
```

**Note:** Make validation conditional (`input.difficulty &&`) to maintain backward compatibility

**Optional Enhancement:** Add default difficulty in createTask method if not provided:
```typescript
// In database.ts createTask method
const newTask: StudyTask = {
  ...input,
  id: String(this.nextId++),
  status: "todo",
  difficulty: input.difficulty || "gemiddeld",  // Add default
  createdAt: new Date().toISOString(),
};
```

**File Location:** `backend/src/index.ts`, lines 36-44 (POST /api/tasks route)

---

### Step 4: Update Frontend Types (`frontend/lib/types.ts`)

**Action:** Mirror backend types in frontend

**Code Pattern to Follow:**
```typescript
// Existing pattern (line 1)
export type TaskStatus = "todo" | "in-progress" | "done"
```

**Changes:**
1. Add identical Difficulty type: `export type Difficulty = "makkelijk" | "gemiddeld" | "moeilijk"`
2. Add `difficulty: Difficulty` to StudyTask interface
3. CreateTaskInput already uses `Omit<StudyTask, "id" | "status" | "createdAt">`, so no changes needed there

**File Location:** `frontend/lib/types.ts` (16 lines total)

---

### Step 5: Update Task Creation Form (`frontend/components/add-task-form.tsx`)

**Action:** Add difficulty selector to form

**Code Pattern to Follow:**
```typescript
// Existing form state pattern (lines 16-20)
const [formData, setFormData] = useState({
  title: "",
  subject: "",
  estimatedMinutes: "",
  // Add: difficulty: "gemiddeld" as Difficulty,
})
```

**Changes:**

1. **Update formData state** (line 16):
```typescript
const [formData, setFormData] = useState({
  title: "",
  subject: "",
  estimatedMinutes: "",
  difficulty: "gemiddeld" as Difficulty,
})
```

2. **Update handleSubmit** (lines 30-32):
```typescript
await onAddTask({
  title: formData.title,
  subject: formData.subject,
  estimatedMinutes: minutes,
  difficulty: formData.difficulty,
})
```

3. **Update form reset** (line 36):
```typescript
setFormData({ title: "", subject: "", estimatedMinutes: "", difficulty: "gemiddeld" as Difficulty })
```

4. **Add select field** after the grid div (after line 132):
```typescript
<div>
  <label htmlFor="difficulty" className="mb-1.5 block text-sm font-semibold text-slate-700">
    Moeilijkheidsgraad <span className="text-red-500">*</span>
  </label>
  <select
    id="difficulty"
    required
    value={formData.difficulty}
    onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))}
    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  >
    <option value="makkelijk">Makkelijk</option>
    <option value="gemiddeld">Gemiddeld</option>
    <option value="moeilijk">Moeilijk</option>
  </select>
</div>
```

**Import Addition** (line 5):
```typescript
import type { CreateTaskInput, Difficulty } from "@/lib/types"
```

**File Location:** `frontend/components/add-task-form.tsx` (151 lines total)

---

### Step 6: Display Difficulty on Task Cards (`frontend/components/task-card.tsx`)

**Action:** Add difficulty badge to task card display

**Code Pattern to Follow:**
```typescript
// Existing badge colors pattern (lines 21-25)
const badgeColors = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
}
```

**Changes:**

1. **Add difficulty color mapping** (after line 25):
```typescript
const difficultyColors = {
  makkelijk: "bg-green-100 text-green-700",
  gemiddeld: "bg-yellow-100 text-yellow-700",
  moeilijk: "bg-red-100 text-red-700",
}

const difficultyLabels = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  moeilijk: "Moeilijk",
}
```

2. **Add difficulty badge** in the metadata section (around line 62, with Clock icon):
```typescript
<div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-500">
  <div className="flex items-center gap-1.5">
    <BookOpen className="h-4 w-4 text-slate-400" />
    <span className="font-medium text-slate-700">{task.subject}</span>
  </div>
  <div className="flex items-center gap-1.5">
    <Clock className="h-4 w-4 text-slate-400" />
    <span>{task.estimatedMinutes} min</span>
  </div>
  <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyColors[task.difficulty]}`}>
    {difficultyLabels[task.difficulty]}
  </div>
</div>
```

**Import Addition** (line 2):
```typescript
import type { StudyTask, TaskStatus, Difficulty } from "@/lib/types"
```

**File Location:** `frontend/components/task-card.tsx` (100 lines total)

---

## Error Handling Strategies

### Backend Validation Errors
- **Scenario:** Invalid difficulty value sent to API
- **Handling:** Return 400 Bad Request with descriptive error message
- **Code:**
```typescript
if (input.difficulty && !validDifficulties.includes(input.difficulty)) {
  return res.status(400).json({ error: "Invalid difficulty level. Must be 'makkelijk', 'gemiddeld', or 'moeilijk'." });
}
```

### Frontend Type Safety
- **Scenario:** Prevent invalid difficulty values
- **Handling:** Use TypeScript union type and type assertion
- **Code:**
```typescript
onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))}
```

### Backward Compatibility
- **Scenario:** Existing tasks without difficulty field
- **Handling:** Provide default value in database creation
- **Code:**
```typescript
difficulty: input.difficulty || "gemiddeld"
```

### Missing Difficulty Display
- **Scenario:** Task object might not have difficulty (edge case)
- **Handling:** Use optional chaining and provide fallback
- **Code:**
```typescript
<div className={difficultyColors[task.difficulty || "gemiddeld"]}>
  {difficultyLabels[task.difficulty || "gemiddeld"]}
</div>
```

---

## Integration Points

### 1. Type System Integration
- Backend types (`backend/src/types.ts`) must match frontend types (`frontend/lib/types.ts`)
- Any mismatch will cause TypeScript errors during development
- Ensure exact string literal matching between backend and frontend

### 2. API Contract
- `CreateTaskInput` automatically includes difficulty via `Omit` utility
- API expects difficulty in POST body: `{ title, subject, estimatedMinutes, difficulty }`
- API validates and returns complete `StudyTask` object including difficulty

### 3. State Management
- Form state includes difficulty with default value
- Dashboard state (`study-dashboard.tsx`) doesn't need changes - it passes full task objects
- Task updates preserve difficulty field automatically

### 4. Component Communication
- `add-task-form.tsx` sends difficulty in CreateTaskInput to `onAddTask` callback
- `study-dashboard.tsx` receives complete task from API and updates state
- `task-card.tsx` receives full task object via props and displays difficulty

---

## Gotchas & Common Pitfalls

### 1. String Literal Type Mismatch
- **Issue:** TypeScript is strict about union types - 'Makkelijk' ≠ 'makkelijk'
- **Solution:** Use lowercase values in type definition, display capitalized labels separately
- **Example:** Type: `"makkelijk"`, Display: `difficultyLabels["makkelijk"]` → "Makkelijk"

### 2. Select Element Type Coercion
- **Issue:** `e.target.value` returns string, not Difficulty type
- **Solution:** Use type assertion: `e.target.value as Difficulty`
- **Safety:** Safe because select options are constrained to valid values

### 3. Form State Reset
- **Issue:** Forgetting to reset difficulty field after form submission
- **Solution:** Include difficulty in formData reset: `{ ..., difficulty: "gemiddeld" as Difficulty }`

### 4. API Validation Order
- **Issue:** Validating difficulty before checking required fields
- **Solution:** Validate difficulty after required field validation
- **Reason:** Clearer error messages - tell user about missing fields first

### 5. Color Scheme Consistency
- **Issue:** Difficulty colors might clash with existing UI
- **Solution:** Use same pattern as status badges: `bg-{color}-100 text-{color}-700`
- **Current scheme:** Green (easy), Yellow (medium), Red (hard)

### 6. Default Value Handling
- **Issue:** Existing seed data doesn't have difficulty field
- **Solution:** Add difficulty to all seed tasks, use "gemiddeld" as sensible default
- **Alternative:** Make field optional with `difficulty?: Difficulty` and handle undefined

---

## Testing Approach

### Manual Testing Checklist

#### 1. Task Creation
- [ ] Create task with difficulty "makkelijk" - verify saved correctly
- [ ] Create task with difficulty "gemiddeld" - verify saved correctly
- [ ] Create task with difficulty "moeilijk" - verify saved correctly
- [ ] Verify default selection is "gemiddeld" when form opens
- [ ] Verify difficulty is required (cannot submit without selection)

#### 2. Task Display
- [ ] Verify difficulty badge appears on task cards
- [ ] Verify correct color for "makkelijk" (green)
- [ ] Verify correct color for "gemiddeld" (yellow)
- [ ] Verify correct color for "moeilijk" (red)
- [ ] Verify correct label text (capitalized)

#### 3. Data Persistence
- [ ] Create task, refresh page, verify difficulty persists
- [ ] Verify seed data shows with assigned difficulty levels
- [ ] Change task status, verify difficulty unchanged

#### 4. API Validation
- [ ] Send POST with invalid difficulty via curl/Postman → expect 400 error
- [ ] Send POST without difficulty → verify defaults to "gemiddeld"
- [ ] Verify error message is descriptive

#### 5. Backward Compatibility
- [ ] Verify existing tasks display correctly
- [ ] Verify no console errors related to difficulty field
- [ ] Verify UI doesn't break with missing difficulty

### Test Commands

#### Start Development Servers
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

#### Manual API Testing
```bash
# Test valid difficulty
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","subject":"Testing","estimatedMinutes":30,"difficulty":"moeilijk"}'

# Test invalid difficulty (should fail)
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","subject":"Testing","estimatedMinutes":30,"difficulty":"invalid"}'

# Verify GET returns difficulty
curl http://localhost:3001/api/tasks
```

#### Visual Testing
1. Navigate to http://localhost:3000
2. Click "Add New Task"
3. Verify difficulty dropdown appears
4. Create tasks with each difficulty level
5. Verify badges appear correctly on cards
6. Verify colors match specification

### Edge Cases to Test

1. **Empty difficulty (if made optional)**
   - Expected: Defaults to "gemiddeld"

2. **Direct API manipulation**
   - Send invalid difficulty via API
   - Expected: 400 Bad Request with clear error message

3. **Form interaction**
   - Change difficulty multiple times before submit
   - Expected: Last selected value is saved

4. **Concurrent updates**
   - Create multiple tasks rapidly
   - Expected: Each maintains its own difficulty

---

## Validation Gates

### Gate 1: TypeScript Compilation
**Command:**
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```
**Success Criteria:**
- No TypeScript errors
- Types are consistent between backend and frontend
- All imports resolve correctly

### Gate 2: Application Starts
**Command:**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```
**Success Criteria:**
- Backend starts on port 3001 without errors
- Frontend starts on port 3000 without errors
- No console errors in browser
- No compilation warnings

### Gate 3: Feature Functionality
**Manual Test:**
1. Open http://localhost:3000
2. Create task with each difficulty level
3. Verify display on task cards

**Success Criteria:**
- All three difficulty options selectable
- Difficulty saves correctly
- Badges display with correct colors
- Labels display correctly (Makkelijk, Gemiddeld, Moeilijk)

### Gate 4: API Validation
**Command:**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","subject":"Test","estimatedMinutes":30,"difficulty":"invalid"}'
```
**Success Criteria:**
- Returns 400 status code
- Returns error message about invalid difficulty
- Task is not created

### Gate 5: Acceptance Criteria
**Verification:**
- [ ] Dropdown menu met opties: Makkelijk, Gemiddeld, Moeilijk verschijnt in het taakcreatieformulier ✅
- [ ] De geselecteerde moeilijkheidsgraad wordt samen met de taak opgeslagen ✅
- [ ] Het moeilijkheidsniveau wordt weergegeven op taakkaarten in de takenlijst ✅
- [ ] Bestaande taken hebben standaard de moeilijkheidsgraad 'Gemiddeld' ✅
- [ ] API accepteert en valideert het moeilijkheidsgraadveld ✅

---

## Code Examples from Codebase

### Example 1: Adding a New Type Field (TaskStatus pattern)
**File:** `backend/src/types.ts` (lines 1-8)
```typescript
export type TaskStatus = "todo" | "in-progress" | "done";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;  // ← Pattern to follow for difficulty
  createdAt: string;
}
```

### Example 2: Form Input Pattern (Subject field)
**File:** `frontend/components/add-task-form.tsx` (lines 97-113)
```typescript
<div>
  <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-slate-700">
    Subject <span className="text-red-500">*</span>
  </label>
  <input
    id="subject"
    type="text"
    required
    list="subjects-list"
    placeholder="Select or type..."
    value={formData.subject}
    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
  {/* Use <select> instead of <input> + <datalist> for difficulty */}
</div>
```

### Example 3: Badge Color Pattern (Status badges)
**File:** `frontend/components/task-card.tsx` (lines 15-24)
```typescript
const statusColors = {
  todo: "bg-white border-slate-200 hover:border-indigo-300",
  "in-progress": "bg-blue-50/50 border-blue-200 hover:border-blue-300",
  done: "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300",
}

const badgeColors = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",  // ← Pattern to follow for difficulty colors
}
```

### Example 4: Filter Button Pattern
**File:** `frontend/components/task-filters.tsx` (lines 18-38)
```typescript
const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
]

// Button rendering with active state
filters.map((filter) => (
  <button
    key={filter.value}
    onClick={() => onFilterChange(filter.value)}
    className={`group relative rounded-full px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${
      currentFilter === filter.value
        ? "bg-slate-900 text-white shadow-sm"
        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
    }`}
  >
    {filter.label}
  </button>
))
// Note: Difficulty filtering not in initial scope, but pattern available if needed
```

### Example 5: API Validation Pattern
**File:** `backend/src/index.ts` (lines 48-52)
```typescript
// Status validation pattern - mirror for difficulty
if (!status || !["todo", "in-progress", "done"].includes(status)) {
  return res.status(400).json({ error: "Invalid status" });
}

// Apply same pattern for difficulty:
// if (input.difficulty && !["makkelijk", "gemiddeld", "moeilijk"].includes(input.difficulty)) {
//   return res.status(400).json({ error: "Invalid difficulty" });
// }
```

---

## Alternate Scenarios

### Scenario 1: Optional vs Required Field

**Current Plan:** Make difficulty required in form, but optional in types for backward compatibility

**Alternative:** Make fully optional
- **Pros:** Simpler migration, no breaking changes
- **Cons:** More null checks, less useful feature
- **Decision:** Keep required in form, handle legacy data with defaults

### Scenario 2: Difficulty Filtering

**Current Plan:** Not implementing filtering by difficulty in initial scope

**Future Enhancement:** Add difficulty filter similar to status filter
- Location: `frontend/components/task-filters.tsx`
- Pattern: Mirror existing filter button group
- State: Add `difficultyFilter` to dashboard state
- Complexity: Low, but adds scope creep

**Decision:** Defer to future iteration per TASK.md scope

### Scenario 3: Difficulty Icons

**Current Plan:** Text-only badges

**Alternative:** Add icons from lucide-react
- `makkelijk`: `<Smile />` or `<TrendingDown />`
- `gemiddeld`: `<Minus />` or `<Equal />`
- `moeilijk`: `<Zap />` or `<TrendingUp />`

**Decision:** Text-only for simplicity, icons can be added in refinement

### Scenario 4: Editable Difficulty

**Current Plan:** Difficulty only set during creation

**Future Enhancement:** Allow editing difficulty like status
- Add difficulty to PATCH endpoint validation
- Add difficulty selector to task card (similar to status buttons)
- Update `updateTask` method

**Decision:** Not in current scope per acceptance criteria

---

## Quality Score: 9/10

### Confidence Justification

**Strengths:**
- ✅ Complete codebase analysis with specific file references
- ✅ Clear step-by-step implementation path
- ✅ Comprehensive code examples from existing patterns
- ✅ Detailed error handling strategies
- ✅ Executable validation gates
- ✅ Specific line number references for modifications
- ✅ Type safety considerations
- ✅ Backward compatibility planning

**Minor Gaps:**
- ⚠️ No automated tests (project doesn't have test infrastructure)
- ⚠️ Could include more visual mockups for badge placement

### Suggested Improvements for 10/10

1. **Add visual diagram** showing before/after UI screenshots
2. **Include accessibility testing** checklist (ARIA labels, keyboard navigation)
3. **Performance considerations** (though minimal for this feature)
4. **Add rollback plan** if issues discovered post-deployment

### Implementation Confidence

This plan provides sufficient detail for single-pass implementation by an AI agent or junior developer because:

1. Every code change is mapped to specific files and line numbers
2. Patterns to follow are extracted from existing codebase
3. All edge cases and gotchas are documented
4. Validation is concrete and executable
5. Integration points are explicitly defined
6. Error handling is comprehensive

**Expected outcome:** Feature can be implemented in 30-45 minutes with zero clarification questions.

---

## Final Checklist

- [x] All necessary context for autonomous implementation
- [x] Validation gates that are executable
- [x] References to existing patterns and conventions
- [x] Clear, ordered implementation path
- [x] Comprehensive error handling documentation
- [x] Main flow and alternate scenarios covered
- [x] Specific code examples and file references
- [x] Type safety considerations
- [x] Backward compatibility addressed
- [x] API contract documented
- [x] UI/UX patterns specified
- [x] Testing approach defined

**Status:** Ready for implementation ✅
