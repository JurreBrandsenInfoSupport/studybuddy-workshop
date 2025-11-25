# Implementation Plan: Difficulty Level Feature

## Feature Overview

Add a difficulty level selector to the task creation and management system in StudyBuddy+. This feature allows students to assign a difficulty rating (Easy, Medium, Hard) to their study tasks, helping them better estimate study time and prioritize challenging assignments.

## Task Analysis

Based on `TASK-final.md`, the requirements are:
- Add dropdown menu with three difficulty options: Easy, Medium, Hard
- Store difficulty level with each task
- Display difficulty level on task cards
- Default existing tasks to "Medium" difficulty
- API validation to accept only valid difficulty values ('easy', 'medium', 'hard')

## Codebase Architecture Analysis

### Current Task Model

**Backend Type Definition** (`backend/src/types.ts`):
```typescript
export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  estimatedMinutes: number;
}
```

**Frontend Type Definition** (`frontend/lib/types.ts`):
```typescript
export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  createdAt: string
}

export type CreateTaskInput = Omit<StudyTask, "id" | "status" | "createdAt">
```

### Database Structure

The in-memory database (`backend/src/database.ts`) has 4 seeded tasks. Example structure:
```typescript
{
  id: "1",
  title: "Complete Calculus Problem Set",
  subject: "Math",
  estimatedMinutes: 60,
  status: "todo",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
}
```

### API Patterns

**Validation Pattern** (from `backend/src/app.ts`):
```typescript
// Example: POST /api/tasks validation
if (!input.title || !input.subject || typeof input.estimatedMinutes !== "number") {
  return res.status(400).json({ error: "Missing required fields" });
}

// Example: PATCH /api/tasks/:id validation
if (!status || !["todo", "in-progress", "done"].includes(status)) {
  return res.status(400).json({ error: "Invalid status" });
}
```

**Current Endpoints**:
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (validates title, subject, estimatedMinutes)
- `PATCH /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Frontend Form Pattern

**Form Structure** (`frontend/components/add-task-form.tsx`):
- Uses controlled components with React state
- Form data stored in single state object
- Validation: required fields checked before submission
- Two-column grid layout for subject and estimatedMinutes
- Loading state during submission
- Auto-collapse and reset after successful submission

**Current Form Fields**:
```typescript
const [formData, setFormData] = useState({
  title: "",
  subject: "",
  estimatedMinutes: "",
})
```

**Subject Field Pattern** (uses datalist for suggestions):
```tsx
<input
  id="subject"
  type="text"
  required
  list="subjects-list"
  placeholder="Select or type..."
  value={formData.subject}
  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
  className="w-full rounded-lg border border-slate-300 px-3 py-2.5..."
/>
<datalist id="subjects-list">
  <option value="Math" />
  <option value="Science" />
  {/* ... */}
</datalist>
```

### Task Card Display Pattern

**Card Layout** (`frontend/components/task-card.tsx`):
- Status badge at top
- Title with conditional line-through for "done" status
- Metadata section with BookOpen and Clock icons
- Status change buttons at bottom

**Metadata Display Pattern**:
```tsx
<div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-500">
  <div className="flex items-center gap-1.5">
    <BookOpen className="h-4 w-4 text-slate-400" />
    <span className="font-medium text-slate-700">{task.subject}</span>
  </div>
  <div className="flex items-center gap-1.5">
    <Clock className="h-4 w-4 text-slate-400" />
    <span>{task.estimatedMinutes} min</span>
  </div>
</div>
```

### Testing Patterns

**Backend Test Structure** (`backend/src/__tests__/api.test.ts`):
- Uses `supertest` for API testing
- `beforeEach` hook calls `db.reset()` to reset database state
- Tests cover: success cases, validation errors (400), not found errors (404)
- Example validation test:
```typescript
it("should return 400 when title is missing", async () => {
  const invalidTask = {
    subject: "Testing",
    estimatedMinutes: 45,
  };
  const response = await request(app)
    .post("/api/tasks")
    .send(invalidTask)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: "Missing required fields" });
});
```

**Frontend Test Structure** (`frontend/components/__tests__/add-task-form.test.tsx`):
- Uses `@testing-library/react` and `@testing-library/user-event`
- Mock function for `onAddTask` prop
- `beforeEach` clears mocks
- Tests cover: rendering, user interactions, form submission, loading states
- Example:
```typescript
await user.type(titleInput, 'Complete Algebra Homework')
await user.type(subjectInput, 'Math')
await user.type(minutesInput, '60')
await user.click(submitButton)

await waitFor(() => {
  expect(mockOnAddTask).toHaveBeenCalledWith({
    title: 'Complete Algebra Homework',
    subject: 'Math',
    estimatedMinutes: 60,
  })
})
```

## Technology Stack Research

### Available Dependencies

**Frontend**:
- React 19+ with Next.js 14+ (App Router)
- TypeScript 5+
- Tailwind CSS
- Radix UI primitives (including `@radix-ui/react-select`)
- Lucide React for icons
- Testing: Jest, React Testing Library, user-event

**Backend**:
- Express.js
- TypeScript 5+
- Testing: Jest, Supertest

### Select Component Options

The project uses **shadcn/ui** setup (confirmed by `components.json`) with Radix UI as the underlying primitive library. Since `@radix-ui/react-select` is already installed, we have two options:

**Option 1: Native HTML Select (Simpler)**
- Pros: No additional dependencies, simpler implementation, faster
- Cons: Limited styling, less accessible
- Pattern: Similar to current number input field

**Option 2: Radix UI Select (Recommended)**
- Pros: Fully accessible, highly customizable with Tailwind, consistent with Radix UI ecosystem
- Cons: More code, need to create select component
- Pattern: Follows shadcn/ui conventions

**Recommendation**: Use native HTML `<select>` element for simplicity and consistency with the existing simple form pattern. The project doesn't currently use any shadcn/ui components, and all form inputs are native HTML elements styled with Tailwind.

### Icon Selection

Use **Lucide React** icons (already used throughout the app):
- Example icons: `Gauge`, `Signal`, `BarChart3`, `Activity`, `Target`
- Pattern from existing code:
```tsx
import { BookOpen, Clock } from "lucide-react"
<BookOpen className="h-4 w-4 text-slate-400" />
```

**Recommended icon**: `Signal` (shows ascending bars, perfect for difficulty levels)

## Implementation Blueprint

### High-Level Approach

1. **Define difficulty type** as a union type with strict values
2. **Update backend types** to include difficulty in StudyTask and CreateTaskInput
3. **Update database** to add difficulty field to seeded data (default: "medium")
4. **Update API validation** to validate difficulty field in POST endpoint
5. **Update PATCH endpoint** to handle difficulty updates (optional enhancement)
6. **Update frontend types** to mirror backend
7. **Add difficulty selector** to AddTaskForm component
8. **Update TaskCard** to display difficulty with appropriate styling
9. **Add comprehensive tests** for validation and display

### Detailed Implementation Steps

#### Step 1: Backend Type Definitions

**File**: `backend/src/types.ts`

Add new type and update interfaces:

```typescript
export type TaskDifficulty = "easy" | "medium" | "hard";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  status: TaskStatus;
  difficulty: TaskDifficulty;  // ADD THIS
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  subject: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;  // ADD THIS
}
```

#### Step 2: Update Database Seeded Data

**File**: `backend/src/database.ts`

Add `difficulty: "medium"` to all INITIAL_TASKS objects:

```typescript
const INITIAL_TASKS: StudyTask[] = [
  {
    id: "1",
    title: "Complete Calculus Problem Set",
    subject: "Math",
    estimatedMinutes: 60,
    status: "todo",
    difficulty: "medium",  // ADD THIS
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  // ... repeat for all 4 tasks
];
```

Update `createTask` method to include difficulty with default value:

```typescript
createTask(input: Omit<StudyTask, "id" | "status" | "createdAt">): StudyTask {
  const newTask: StudyTask = {
    ...input,
    id: String(this.nextId++),
    status: "todo",
    difficulty: input.difficulty || "medium",  // Use provided or default to "medium"
    createdAt: new Date().toISOString(),
  };
  this.tasks.push(newTask);
  return newTask;
}
```

**Note**: The createTask signature expects `difficulty` in the input. If backward compatibility is needed, make it optional in the input type signature, but that's not necessary for this implementation.

#### Step 3: Update API Validation

**File**: `backend/src/app.ts`

Update POST `/api/tasks` validation:

```typescript
app.post("/api/tasks", (req: Request, res: Response) => {
  const input: CreateTaskInput = req.body;

  // Update validation to include difficulty
  if (!input.title || !input.subject || typeof input.estimatedMinutes !== "number") {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Add difficulty validation
  const validDifficulties = ["easy", "medium", "hard"];
  if (input.difficulty && !validDifficulties.includes(input.difficulty)) {
    return res.status(400).json({ error: "Invalid difficulty level" });
  }

  const newTask = db.createTask(input);
  res.status(201).json(newTask);
});
```

**Alternative approach** (stricter - require difficulty):
```typescript
if (!input.title || !input.subject || typeof input.estimatedMinutes !== "number" || !input.difficulty) {
  return res.status(400).json({ error: "Missing required fields" });
}

if (!["easy", "medium", "hard"].includes(input.difficulty)) {
  return res.status(400).json({ error: "Invalid difficulty level" });
}
```

**Recommendation**: Use the alternative (stricter) approach to match the acceptance criteria that difficulty is a required field.

#### Step 4: Frontend Type Definitions

**File**: `frontend/lib/types.ts`

Add difficulty type and update StudyTask:

```typescript
export type TaskDifficulty = "easy" | "medium" | "hard"

export type StudyTask = {
  id: string
  title: string
  subject: string
  estimatedMinutes: number
  status: TaskStatus
  difficulty: TaskDifficulty  // ADD THIS
  createdAt: string
}

// CreateTaskInput will automatically include difficulty due to Omit
export type CreateTaskInput = Omit<StudyTask, "id" | "status" | "createdAt">
```

#### Step 5: Update AddTaskForm Component

**File**: `frontend/components/add-task-form.tsx`

**Changes needed**:

1. Import difficulty type:
```typescript
import type { CreateTaskInput, TaskDifficulty } from "@/lib/types"
```

2. Add difficulty to form state:
```typescript
const [formData, setFormData] = useState({
  title: "",
  subject: "",
  estimatedMinutes: "",
  difficulty: "medium" as TaskDifficulty,  // Default to medium
})
```

3. Update form submission to include difficulty:
```typescript
await onAddTask({
  title: formData.title,
  subject: formData.subject,
  estimatedMinutes: minutes,
  difficulty: formData.difficulty,  // ADD THIS
})
```

4. Reset to include difficulty:
```typescript
setFormData({
  title: "",
  subject: "",
  estimatedMinutes: "",
  difficulty: "medium" as TaskDifficulty,  // ADD THIS
})
```

5. Add difficulty selector after the subject/minutes grid (before submit button):

```tsx
<div>
  <label htmlFor="difficulty" className="mb-1.5 block text-sm font-semibold text-slate-700">
    Difficulty <span className="text-red-500">*</span>
  </label>
  <select
    id="difficulty"
    required
    value={formData.difficulty}
    onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as TaskDifficulty }))}
    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  >
    <option value="easy">Easy</option>
    <option value="medium">Medium</option>
    <option value="hard">Hard</option>
  </select>
</div>
```

**Layout consideration**: Place the difficulty selector either:
- Below the grid (full width, like title field)
- As third column in grid (requires changing to 3-column grid)

**Recommendation**: Add as a full-width field between the grid and the submit button for better visual hierarchy and mobile responsiveness.

#### Step 6: Update TaskCard Component

**File**: `frontend/components/task-card.tsx`

**Changes needed**:

1. Import icon and difficulty type:
```typescript
import { Clock, BookOpen, Trash2, Signal } from "lucide-react"
import type { StudyTask, TaskStatus, TaskDifficulty } from "@/lib/types"
```

2. Add difficulty badge configuration:
```typescript
const difficultyConfig = {
  easy: {
    label: "Easy",
    color: "bg-emerald-100 text-emerald-700",
    icon: "text-emerald-500"
  },
  medium: {
    label: "Medium",
    color: "bg-amber-100 text-amber-700",
    icon: "text-amber-500"
  },
  hard: {
    label: "Hard",
    color: "bg-rose-100 text-rose-700",
    icon: "text-rose-500"
  }
}
```

3. Add difficulty display in metadata section (after clock icon):
```tsx
<div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-500">
  <div className="flex items-center gap-1.5">
    <BookOpen className="h-4 w-4 text-slate-400" />
    <span className="font-medium text-slate-700">{task.subject}</span>
  </div>
  <div className="flex items-center gap-1.5">
    <Clock className="h-4 w-4 text-slate-400" />
    <span>{task.estimatedMinutes} min</span>
  </div>
  <div className="flex items-center gap-1.5">
    <Signal className={`h-4 w-4 ${difficultyConfig[task.difficulty].icon}`} />
    <span className={`font-medium ${difficultyConfig[task.difficulty].color.split(' ')[1]}`}>
      {difficultyConfig[task.difficulty].label}
    </span>
  </div>
</div>
```

**Alternative design** (badge style):
```tsx
<div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyConfig[task.difficulty].color}`}>
  <Signal className="h-3 w-3" />
  {difficultyConfig[task.difficulty].label}
</div>
```

**Recommendation**: Use the inline metadata style (first option) for consistency with existing subject/time display pattern.

#### Step 7: Backend Tests

**File**: `backend/src/__tests__/api.test.ts`

Add tests in the `POST /api/tasks` describe block:

```typescript
it("should create task with difficulty level", async () => {
  const newTask = {
    title: "Test Task",
    subject: "Testing",
    estimatedMinutes: 45,
    difficulty: "hard",
  };

  const response = await request(app)
    .post("/api/tasks")
    .send(newTask)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(201);
  expect(response.body.difficulty).toBe("hard");
});

it("should default to medium difficulty if not provided", async () => {
  const newTask = {
    title: "Test Task",
    subject: "Testing",
    estimatedMinutes: 45,
  };

  const response = await request(app)
    .post("/api/tasks")
    .send(newTask)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(201);
  expect(response.body.difficulty).toBe("medium");
});

it("should return 400 for invalid difficulty level", async () => {
  const newTask = {
    title: "Test Task",
    subject: "Testing",
    estimatedMinutes: 45,
    difficulty: "super-hard",
  };

  const response = await request(app)
    .post("/api/tasks")
    .send(newTask)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: "Invalid difficulty level" });
});
```

**Note**: If implementing strict validation (difficulty required), remove the "default to medium" test and add a test for missing difficulty returning 400.

Update existing GET tests to verify difficulty field is present:
```typescript
it("should return all tasks", async () => {
  const response = await request(app).get("/api/tasks");

  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(4);
  expect(response.body[0]).toHaveProperty("difficulty");  // ADD THIS
  // ... existing assertions
});
```

#### Step 8: Frontend Tests

**File**: `frontend/components/__tests__/add-task-form.test.tsx`

Update existing submission test to include difficulty:

```typescript
it("should submit form with valid data", async () => {
  const user = userEvent.setup()
  mockOnAddTask.mockResolvedValueOnce(undefined)

  render(<AddTaskForm onAddTask={mockOnAddTask} />)

  await user.click(screen.getByText('Add New Task'))

  const titleInput = screen.getByLabelText(/Task Title/i)
  const subjectInput = screen.getByLabelText(/Subject/i)
  const minutesInput = screen.getByLabelText(/Est. Minutes/i)
  const difficultySelect = screen.getByLabelText(/Difficulty/i)  // ADD THIS

  await user.type(titleInput, 'Complete Algebra Homework')
  await user.type(subjectInput, 'Math')
  await user.type(minutesInput, '60')
  await user.selectOptions(difficultySelect, 'hard')  // ADD THIS

  await user.click(screen.getByText('Create Task'))

  await waitFor(() => {
    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'Complete Algebra Homework',
      subject: 'Math',
      estimatedMinutes: 60,
      difficulty: 'hard',  // ADD THIS
    })
  })
})
```

Add new test for default difficulty:
```typescript
it("should default to medium difficulty", async () => {
  const user = userEvent.setup()
  render(<AddTaskForm onAddTask={mockOnAddTask} />)

  await user.click(screen.getByText('Add New Task'))

  const difficultySelect = screen.getByLabelText(/Difficulty/i) as HTMLSelectElement
  expect(difficultySelect.value).toBe('medium')
})
```

Add test for all difficulty options:
```typescript
it("should have all difficulty options available", async () => {
  const user = userEvent.setup()
  render(<AddTaskForm onAddTask={mockOnAddTask} />)

  await user.click(screen.getByText('Add New Task'))

  const difficultySelect = screen.getByLabelText(/Difficulty/i)
  const options = within(difficultySelect).getAllByRole('option')

  expect(options).toHaveLength(3)
  expect(options[0]).toHaveTextContent('Easy')
  expect(options[1]).toHaveTextContent('Medium')
  expect(options[2]).toHaveTextContent('Hard')
})
```

**File**: `frontend/components/__tests__/task-card.test.tsx`

Add test for difficulty display:
```typescript
it("should display task difficulty", () => {
  const mockTask: StudyTask = {
    id: "1",
    title: "Test Task",
    subject: "Math",
    estimatedMinutes: 60,
    status: "todo",
    difficulty: "hard",
    createdAt: new Date().toISOString(),
  }

  render(
    <TaskCard
      task={mockTask}
      onStatusChange={jest.fn()}
      onDelete={jest.fn()}
      isUpdating={false}
    />
  )

  expect(screen.getByText('Hard')).toBeInTheDocument()
})
```

#### Step 9: Update API Client (if needed)

**File**: `frontend/lib/api.ts`

No changes needed - the `createTask` function already accepts `CreateTaskInput` which will now include difficulty through the type system.

Verify the function signature:
```typescript
export async function createTask(input: CreateTaskInput): Promise<StudyTask> {
  // Implementation already correct
}
```

## Error Handling Strategy

### Backend Validation

1. **Missing difficulty** (if required):
   - Return: `400 Bad Request`
   - Message: `{ error: "Missing required fields" }`

2. **Invalid difficulty value**:
   - Return: `400 Bad Request`
   - Message: `{ error: "Invalid difficulty level" }`
   - Validation: `!["easy", "medium", "hard"].includes(input.difficulty)`

3. **Type mismatch** (e.g., difficulty is number):
   - Caught by existing validation
   - Return: `400 Bad Request`

### Frontend Validation

1. **Form validation**:
   - HTML5 `required` attribute on select element
   - TypeScript type safety ensures only valid values

2. **API error handling**:
   - Already handled by try/catch in `handleSubmit`
   - Errors caught and submission state reset

### Database Backward Compatibility

**Strategy**: All existing tasks default to "medium" difficulty
- Modify INITIAL_TASKS to include `difficulty: "medium"`
- No migration needed (in-memory database resets on restart)
- For production: would need migration to add column with default value

## Integration Points

### Frontend → Backend Flow

1. User selects difficulty in `AddTaskForm`
2. Form state updates via `onChange` handler
3. On submit, `onAddTask` callback called with `CreateTaskInput` (includes difficulty)
4. `study-dashboard.tsx` receives callback and calls `api.createTask()`
5. API client sends POST request to `/api/tasks` with difficulty in body
6. Backend validates and creates task with difficulty
7. Response returns to frontend with full task object
8. Dashboard refreshes task list

### Type Safety Chain

```
frontend/lib/types.ts (TaskDifficulty, StudyTask, CreateTaskInput)
    ↓
frontend/components/add-task-form.tsx (uses CreateTaskInput)
    ↓
frontend/lib/api.ts (createTask function)
    ↓
backend/src/app.ts (receives CreateTaskInput via request body)
    ↓
backend/src/types.ts (validates against TaskDifficulty union type)
    ↓
backend/src/database.ts (stores StudyTask with difficulty)
```

## Gotchas & Common Mistakes

### 1. Type Definition Sync
**Issue**: Frontend and backend types must stay in sync
**Solution**: Both define `TaskDifficulty` as `"easy" | "medium" | "hard"` (exact same values)

### 2. Form State Type Casting
**Issue**: select onChange returns string, not TaskDifficulty type
**Solution**: Cast with `as TaskDifficulty`:
```typescript
onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as TaskDifficulty }))}
```

### 3. Default Value in State
**Issue**: Forgetting to set default difficulty in form state
**Solution**: Initialize with `difficulty: "medium" as TaskDifficulty`

### 4. Reset Form State
**Issue**: Not resetting difficulty after form submission
**Solution**: Include difficulty in reset:
```typescript
setFormData({ title: "", subject: "", estimatedMinutes: "", difficulty: "medium" as TaskDifficulty })
```

### 5. API Validation Order
**Issue**: Checking difficulty before checking if it exists
**Solution**: Validate required fields first, then validate difficulty value

### 6. Test Data Updates
**Issue**: Forgetting to update mock task data in tests
**Solution**: Add `difficulty: "medium"` to all mock StudyTask objects in tests

### 7. CSS Class String Concatenation
**Issue**: Dynamic difficulty colors might break if not carefully constructed
**Solution**: Use object lookup for complete class strings, not concatenation:
```typescript
// GOOD
const difficultyConfig = {
  easy: { color: "bg-emerald-100 text-emerald-700" }
}
className={difficultyConfig[task.difficulty].color}

// BAD (Tailwind won't generate classes)
className={`bg-${color}-100 text-${color}-700`}
```

### 8. Icon Import
**Issue**: Forgetting to import Signal icon
**Solution**: Add to lucide-react import:
```typescript
import { Clock, BookOpen, Trash2, Signal } from "lucide-react"
```

## Validation Gates

### Development Validation

**Start services**:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Manual testing checklist**:
- [ ] Form displays difficulty dropdown with Easy/Medium/Hard options
- [ ] Default selection is "Medium"
- [ ] Can create task with each difficulty level
- [ ] Difficulty appears on task card with correct color/icon
- [ ] Page refresh preserves difficulty (API persistence)
- [ ] Cannot submit form without selecting difficulty (if made required)

### Automated Test Validation

**Backend tests**:
```bash
cd backend
npm test
```

Expected results:
- All existing tests pass (no breaking changes)
- New tests pass:
  - ✓ should create task with difficulty level
  - ✓ should default to medium difficulty (if optional)
  - ✓ should return 400 for invalid difficulty level
  - ✓ GET /api/tasks returns difficulty property

**Frontend tests**:
```bash
cd frontend
npm test
```

Expected results:
- All existing tests pass
- New tests pass:
  - ✓ should default to medium difficulty
  - ✓ should have all difficulty options available
  - ✓ should submit form with difficulty
  - ✓ should display task difficulty on card

### Test Coverage

**Run with coverage**:
```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

Target coverage for modified files:
- `backend/src/types.ts`: 100% (type definitions)
- `backend/src/database.ts`: >90% (createTask method covered)
- `backend/src/app.ts`: >85% (POST validation covered)
- `frontend/components/add-task-form.tsx`: >85%
- `frontend/components/task-card.tsx`: >80%

### Build Validation

**Backend build**:
```bash
cd backend
npm run build
```
Should complete without TypeScript errors.

**Frontend build**:
```bash
cd frontend
npm run build
```
Should complete without TypeScript errors or Tailwind warnings.

### Linting

```bash
cd frontend
npm run lint
```
Should pass with no errors.

## Documentation URLs

### TypeScript Union Types
- https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
- Used for `TaskDifficulty = "easy" | "medium" | "hard"`

### HTML Select Element
- https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
- Native form control used for difficulty selector

### React Controlled Components
- https://react.dev/reference/react-dom/components/select
- Pattern for select element in React

### Tailwind CSS Colors
- https://tailwindcss.com/docs/customizing-colors
- Color palette for difficulty badges (emerald, amber, rose)

### Lucide React Icons
- https://lucide.dev/icons/
- Icon library (Signal icon for difficulty)

### Express Request Validation
- https://expressjs.com/en/api.html#req.body
- Request body parsing and validation

### Jest Testing
- https://jestjs.io/docs/getting-started
- Testing framework

### React Testing Library
- https://testing-library.com/docs/react-testing-library/intro/
- Frontend component testing
- userEvent selectOptions: https://testing-library.com/docs/user-event/utility/#selectoptions

## Implementation Checklist

### Backend
- [ ] Add `TaskDifficulty` type to `backend/src/types.ts`
- [ ] Update `StudyTask` interface to include `difficulty: TaskDifficulty`
- [ ] Update `CreateTaskInput` interface to include `difficulty: TaskDifficulty`
- [ ] Add `difficulty: "medium"` to all 4 tasks in `INITIAL_TASKS` array
- [ ] Update `createTask` method to handle difficulty (with default if optional)
- [ ] Add difficulty validation to POST `/api/tasks` endpoint
- [ ] Write tests for difficulty validation
- [ ] Run backend tests: `npm test`
- [ ] Build backend: `npm run build`

### Frontend
- [ ] Add `TaskDifficulty` type to `frontend/lib/types.ts`
- [ ] Update `StudyTask` type to include `difficulty: TaskDifficulty`
- [ ] Add `difficulty` to form state in `add-task-form.tsx` with default "medium"
- [ ] Add difficulty `<select>` element to form
- [ ] Update form submission to include difficulty
- [ ] Update form reset to include difficulty
- [ ] Import `Signal` icon from lucide-react in `task-card.tsx`
- [ ] Add difficulty configuration object with colors
- [ ] Add difficulty display to task card metadata section
- [ ] Write/update tests for form default value
- [ ] Write/update tests for form submission with difficulty
- [ ] Write test for difficulty display on card
- [ ] Run frontend tests: `npm test`
- [ ] Build frontend: `npm run build`
- [ ] Run linter: `npm run lint`

### Integration Testing
- [ ] Start backend server: `cd backend && npm run dev`
- [ ] Start frontend server: `cd frontend && npm run dev`
- [ ] Create task with "easy" difficulty
- [ ] Create task with "medium" difficulty
- [ ] Create task with "hard" difficulty
- [ ] Verify difficulty displays correctly on all three tasks
- [ ] Verify difficulty persists after page refresh
- [ ] Test form validation (all required fields including difficulty)

## Quality Score: 9/10

### Confidence Assessment

**Strengths**:
- ✅ Complete codebase analysis with specific file examples
- ✅ Clear type definitions matching existing patterns
- ✅ Detailed step-by-step implementation with code snippets
- ✅ Comprehensive test strategy covering validation and display
- ✅ Specific validation gates with commands
- ✅ Documented gotchas and common mistakes
- ✅ Integration flow clearly mapped
- ✅ Backward compatibility addressed (default to "medium")

**Potential Improvement** (-1 point):
- Could include mockup/wireframe for UI placement
- Could specify exact pixel spacing for difficulty badge
- Could include accessibility testing checklist (ARIA labels, keyboard navigation)

### Suggested Enhancements (Optional)

1. **Accessibility**: Add `aria-label` to select:
```tsx
<select
  id="difficulty"
  aria-label="Task difficulty level"
  // ...
/>
```

2. **Visual Indicator**: Add difficulty color strip to task card border:
```tsx
className={`... border-l-4 ${difficultyBorderConfig[task.difficulty]}`}
```

3. **Filtering**: Add difficulty filter to task-filters component (future enhancement)

4. **Sorting**: Add sort by difficulty option (future enhancement)

This implementation plan provides complete autonomous implementation capability with high confidence in single-pass success.
