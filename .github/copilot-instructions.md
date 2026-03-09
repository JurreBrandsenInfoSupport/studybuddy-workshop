# StudyBuddy+ Workshop - AI Coding Agent Instructions

## Project Overview
StudyBuddy+ is a student task manager with a **Next.js 14 frontend** (TypeScript, React 19, Tailwind CSS) and **.NET 8.0 backend** (Minimal APIs, in-memory data). Both are fully tested and can run via Docker or locally.

## Architecture & Data Flow

### Backend (.NET 8.0 Minimal APIs)
- **Entry Point**: [backend/StudyBuddy.Api/Program.cs](backend/StudyBuddy.Api/Program.cs) - All endpoints defined here using Minimal APIs pattern (no controllers)
- **Service Layer**: [backend/StudyBuddy.Api/Services/TaskService.cs](backend/StudyBuddy.Api/Services/TaskService.cs) implements `ITaskService` with singleton in-memory storage
- **Data Storage**: In-memory lists with seed data (4 initial tasks) - no database required
- **API Pattern**: Endpoints return `Results.Ok()`, `Results.NotFound()`, etc. with DTOs, not models directly

### Frontend (Next.js App Router)
- **Main Component**: [frontend/components/study-dashboard.tsx](frontend/components/study-dashboard.tsx) - Client component managing all task state
- **API Client**: [frontend/lib/api.ts](frontend/lib/api.ts) - Native fetch, reads `NEXT_PUBLIC_API_URL` from env
- **Communication**: Frontend → Backend via REST API (no shared state/WebSockets)
- **State Management**: React `useState` only - no Redux/Zustand

## Critical Development Workflows

### Running Locally (Recommended for Development)
```bash
# Terminal 1: Backend
cd backend/StudyBuddy.Api
dotnet run  # Runs on http://localhost:5000 by default

# Terminal 2: Frontend
cd frontend
pnpm install
pnpm run dev  # Runs on http://localhost:3000
```

### Running Tests
```bash
# Backend (xUnit + FluentAssertions)
cd backend
dotnet test  # 34 tests should pass

# Frontend (Jest + React Testing Library)
cd frontend
pnpm test  # 53 tests should pass
pnpm test:coverage  # Generates coverage in coverage/lcov-report/
```

### Docker (Alternative - May Have SSL Issues)
```bash
docker compose up --build  # Backend on :3001, Frontend on :3000
```

## Project-Specific Conventions

### Backend Patterns
- **No Controllers**: Use `app.MapGet()`, `app.MapPost()`, etc. in [Program.cs](backend/StudyBuddy.Api/Program.cs)
- **DTOs vs Models**: API endpoints use `TaskResponse` (DTO), services use `StudyTask` (Model). Convert via `.ToResponse()` extension method in [DTOs/TaskMapper.cs](backend/StudyBuddy.Api/DTOs/TaskMapper.cs)
- **Status Handling**: Use `TaskStatusHelper.TryParseStatus()` to convert string → `StudyTaskStatus` enum
- **Dependency Injection**: Services registered as singletons in `Program.cs` (due to in-memory storage)
- **Error Responses**: Return `{ error: "message" }` objects, not plain strings

### Frontend Patterns
- **Client Components**: Use `"use client"` directive (all interactive components need this)
- **API Calls**: Always use functions from [lib/api.ts](frontend/lib/api.ts), never inline fetch
- **Type Safety**: Import types from [lib/types.ts](frontend/lib/types.ts) (`StudyTask`, `TaskStatus`, etc.)
- **UI Components**: Radix UI primitives styled with Tailwind (no custom component library)
- **Error Handling**: Display user-friendly messages via alert/error state, log technical details to console

### Testing Conventions
- **Backend Tests**: Use `WebApplicationFactory<Program>` for integration tests in [ApiEndpointsTests.cs](backend/StudyBuddy.Api.Tests/ApiEndpointsTests.cs)
  - Reset service state with `_taskService.Reset()` before/after each test
  - Use FluentAssertions (`.Should().Be()`, `.Should().HaveCount()`, etc.)
- **Frontend Tests**: Mock [lib/api.ts](frontend/lib/api.ts) functions using `jest.mock()` in [components/__tests__/](frontend/components/__tests__/)
  - Use `@testing-library/react` for component rendering and user interactions
  - Test files live alongside components in `__tests__/` subdirectories

## Key Integration Points

### Backend ↔ Frontend API Contract
- **Base URL**: `NEXT_PUBLIC_API_URL` env var (default: `http://localhost:5000` dev, `http://localhost:3001` Docker)
- **Endpoints**: All under `/api/tasks` - see [StudyBuddy.Api.http](backend/StudyBuddy.Api/StudyBuddy.Api.http) for examples
- **CORS**: Backend allows all origins via `AddCors()` in [Program.cs](backend/StudyBuddy.Api/Program.cs)

## When Adding New Features

1. **Backend**: Add endpoint in [Program.cs](backend/StudyBuddy.Api/Program.cs), add service method in [TaskService.cs](backend/StudyBuddy.Api/Services/TaskService.cs), add test in [ApiEndpointsTests.cs](backend/StudyBuddy.Api.Tests/ApiEndpointsTests.cs)
2. **Frontend**: Add API function in [lib/api.ts](frontend/lib/api.ts), update component logic, add test in `components/__tests__/`
3. **Types**: Keep [frontend/lib/types.ts](frontend/lib/types.ts) and [backend/DTOs](backend/StudyBuddy.Api/DTOs/) in sync

## Common Gotchas

- Backend dev port is `:5000`, Docker backend is `:3001` - frontend env var must match
- Frontend tests fail if you don't mock API calls (tests run without server)
- Backend `ITaskService` is singleton - state persists across requests (by design for in-memory storage)
- Status values are lowercase in API (`"todo"`, `"in-progress"`, `"done"`) but PascalCase in C# enums
