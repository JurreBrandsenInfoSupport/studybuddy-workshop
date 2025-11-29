# GitHub Copilot Instructions

Follow these instructions when writing code or documentation for this project.

## Project Overview

StudyBuddy+ is a student task manager application designed to help students organize their study workload. The application features a modern Next.js frontend and a .NET 8.0 backend API, allowing students to create, track, and manage study tasks with time estimation, status tracking, and filtering capabilities.

**Key Goals:**
- Provide an intuitive interface for students to manage study tasks
- Track task progress through different states (todo, in-progress, done)
- Enable time estimation and workload visualization
- Offer comprehensive filtering and sorting capabilities
- Maintain a clean, tested, and maintainable codebase

## Project Structure

The project follows a **monorepo structure** with separate frontend and backend applications:

```
studybuddy-workshop/
├── frontend/                 # Next.js 14 frontend application
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   │   └── __tests__/        # Component tests
│   ├── lib/                  # Utilities, API client, types
│   │   └── __tests__/        # Library tests
│   └── public/               # Static assets
├── backend/                  # .NET 8.0 Web API backend
│   ├── StudyBuddy.Api/       # Main API project
│   │   ├── DTOs/             # Data Transfer Objects (mappers, responses)
│   │   ├── Helpers/          # Utility helpers
│   │   ├── Models/           # Domain models (StudyTask, TaskStatus)
│   │   ├── Services/         # Business logic (TaskService)
│   │   └── Program.cs        # Minimal API endpoint definitions
│   └── StudyBuddy.Api.Tests/ # xUnit test project
└── docker-compose.yml        # Docker orchestration
```

**Architecture Patterns:**
- **Frontend**: Component-based architecture with feature-organized structure
- **Backend**: Minimal APIs with dependency injection, service layer pattern
- **Testing**: Co-located tests with implementation (`__tests__` folders, `.Tests` projects)

**Project Responsibilities:**
- **StudyBuddy.Api**: REST API with minimal endpoints, business logic in services, in-memory data storage
- **StudyBuddy.Api.Tests**: Unit tests for services and integration tests for API endpoints
- **frontend/app**: Next.js pages and routing
- **frontend/components**: Reusable UI components (task cards, forms, filters, dashboard)
- **frontend/lib**: Shared utilities, API client, TypeScript type definitions

## Technology Stack

### Backend (backend/)
- **Framework**: ASP.NET Core 8.0 with Minimal APIs
- **Language**: C# 12
- **Data Storage**: In-memory collections (no database)
- **Dependency Injection**: Built-in ASP.NET Core DI container
- **Testing**: xUnit, FluentAssertions, WebApplicationFactory (integration tests)
- **API Documentation**: Swagger/OpenAPI
- **CORS**: Configured for cross-origin requests from frontend

**Backend Technology Mapping:**
- `Program.cs`: Minimal API endpoints, DI configuration, middleware setup
- `Services/`: Business logic with interface-based dependency injection
- `Models/`: Domain entities and request models
- `DTOs/`: Data transformation and response shaping
- `Helpers/`: Utility functions for data conversion

### Frontend (frontend/)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **React**: Version 19.2.0 with React 19 features
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives (headless components)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Native Fetch API (no axios)
- **Testing**: Jest + React Testing Library
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

**Frontend Technology Mapping:**
- `app/`: Next.js App Router pages (layout.tsx, page.tsx)
- `components/`: React components using Radix UI and Tailwind CSS
- `lib/api.ts`: API client using fetch, communicates with backend
- `lib/types.ts`: TypeScript type definitions matching backend DTOs
- `lib/utils.ts`: Utility functions (cn class merger, etc.)

## Coding Standards

### General
- Write clear, self-documenting code with meaningful variable and function names
- Follow the existing code style and patterns in the project
- Keep functions small and focused on a single responsibility
- Write tests for all new features and bug fixes

### Backend (C#)
- Follow C# naming conventions: PascalCase for classes, methods, properties; camelCase for parameters and local variables
- Use nullable reference types (`?`) appropriately
- Prefer dependency injection over static classes
- Use record types for DTOs and simple data structures when appropriate
- Keep controllers/endpoints thin; put business logic in services
- Use async/await for I/O operations (when applicable)
- Use FluentAssertions syntax in tests for readability
- Follow Minimal API patterns: use `Results.*` for responses

**Example:**
```csharp
// Good: Service with dependency injection
public interface ITaskService { ... }
public class InMemoryTaskService : ITaskService { ... }

// Good: Minimal API endpoint
app.MapGet("/api/tasks", (ITaskService taskService) =>
    Results.Ok(taskService.GetAllTasks()));
```

### Frontend (TypeScript/React)
- Use TypeScript for all files; avoid `any` types
- Follow React hooks best practices (dependency arrays, no conditional hooks)
- Use functional components with hooks (no class components)
- Keep components small and focused; extract reusable logic into custom hooks
- Use meaningful prop names and destructure props
- Follow Tailwind CSS utility-first approach (no custom CSS unless necessary)
- Use the `cn()` utility from `lib/utils.ts` for conditional classes
- Prefer server components by default; use `"use client"` only when needed
- Export types separately from components

**Example:**
```typescript
// Good: Typed component with proper props
interface TaskCardProps {
  task: StudyTask
  onUpdate: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  // Component implementation
}
```

### Testing
- Write unit tests for all services and utility functions
- Write integration tests for API endpoints
- Write component tests for interactive UI components
- Use descriptive test names: `it("should ... when ...")`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies in unit tests
- Use `WebApplicationFactory` for backend integration tests
- Use `render` and `screen` from React Testing Library for frontend tests

## Feature Development Guidelines

### Adding a New Feature

1. **Backend First Approach:**
   - Define the model in `Models/` if new data structures are needed
   - Create or update the service interface and implementation in `Services/`
   - Add DTOs in `DTOs/` for request/response shaping
   - Define the minimal API endpoint in `Program.cs`
   - Write unit tests in `TaskServiceTests.cs` and integration tests in `ApiEndpointsTests.cs`

2. **Frontend Implementation:**
   - Update types in `lib/types.ts` to match backend DTOs
   - Add/update API methods in `lib/api.ts`
   - Create or modify components in `components/`
   - Write component tests in `components/__tests__/`
   - Update the dashboard or page as needed in `app/`

3. **Testing Requirements:**
   - Backend: Minimum 80% code coverage for services
   - Frontend: Test user interactions, state changes, and API integration
   - Run all tests before submitting: `dotnet test` (backend), `pnpm test` (frontend)

4. **Documentation:**
   - Update README files if the feature changes setup or usage
   - Add JSDoc/XML comments for public APIs
   - Update OpenAPI/Swagger documentation (automatic for backend)

### Modifying Existing Features

- Check for existing tests and update them to reflect changes
- Maintain backward compatibility for API contracts when possible
- Update TypeScript types on both ends if data structures change
- Consider impact on existing components and update accordingly

### API Contract Guidelines

- Keep request/response formats consistent
- Use standard HTTP status codes (200 OK, 201 Created, 404 Not Found, 400 Bad Request)
- Return meaningful error messages
- Maintain RESTful conventions: GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for removal
- Backend routes should be prefixed with `/api/`

### Performance Considerations

- Minimize re-renders in React components (use React.memo, useMemo, useCallback when appropriate)
- Keep API responses lean; only send necessary data
- Use optimistic UI updates in frontend for better UX
- Batch related API calls when possible

### Accessibility

- Use semantic HTML elements
- Ensure keyboard navigation works for all interactive elements
- Use Radix UI components (they come with built-in accessibility)
- Provide proper ARIA labels where needed
- Test with keyboard-only navigation
