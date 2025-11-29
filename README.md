# StudyBuddy+ app

A student task manager application with a Next.js frontend and .NET 8.0 backend.

## Project Structure

```
studybuddy-workshop/
├── frontend/          # Next.js frontend application
├── backend/           # .NET 8.0 Web API backend
└── docker-compose.yml # Docker orchestration
```

## Quick Start (Recommended for Development)

### 1. Start the Backend

```bash
cd backend/StudyBuddy.Api
dotnet run
```

The backend API will run on http://localhost:5000 (development) or http://localhost:3001 (production/Docker)

### 2. Start the Frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env.local  # Copy environment variables
pnpm install
pnpm run dev
```

The frontend will run on http://localhost:3000

## Docker Setup (Alternative)

You can also run the application using Docker Compose:

```bash
docker compose up --build
```

This will start both services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

**Note:** Some environments may have SSL certificate issues with Docker builds. If you encounter these, use the development setup above instead.

## Technology Stack

### Backend (.NET 8.0)
- **Framework**: ASP.NET Core 8.0
- **API Style**: Minimal APIs
- **Architecture**: Clean architecture with dependency injection
- **Testing**: xUnit, FluentAssertions (34 passing tests)
- **Documentation**: Swagger/OpenAPI
- **Database**: In-memory with seeded data

### Frontend (Next.js)
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library (53 passing tests)
- **Type Safety**: TypeScript

## API Endpoints

- `GET /health` - Health check
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get a single task
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/{id}` - Update task status
- `DELETE /api/tasks/{id}` - Delete a task

## Features

- ✅ Create, read, update, and delete study tasks
- ✅ Track task status (todo, in-progress, done)
- ✅ Estimate time for each task
- ✅ Filter and sort tasks
- ✅ In-memory database with seeded example data
- ✅ Docker support for easy deployment
- ✅ Comprehensive test suites (frontend and backend)
- ✅ Modern .NET 8.0 backend with Minimal APIs
- ✅ Clean architecture and best practices

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run tests with detailed output
dotnet test --logger "console;verbosity=detailed"
```

**Backend Test Coverage:**
- 34 passing tests
- Unit tests for service layer
- Integration tests for all API endpoints
- Thread-safety and concurrency tests

### Frontend Tests

The frontend includes a comprehensive test suite built with Jest and React Testing Library.

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Frontend Coverage Metrics:**
- Overall: 84.1% statement coverage, 91.07% branch coverage
- API Module: 100% coverage
- Components: 87.5% - 100% coverage
- Total: 53 passing tests

### What's Tested

**Backend:**
- ✅ All API endpoints and status codes
- ✅ Request validation and error handling
- ✅ Business logic in service layer
- ✅ Database operations (CRUD)
- ✅ Thread safety and concurrency

**Frontend:**
- ✅ All major user interactions and workflows
- ✅ Form validation and error handling
- ✅ API integration and error states
- ✅ Task creation, updating, and deletion
- ✅ Filtering and sorting functionality
- ✅ Loading and error states
- ✅ UI component rendering and interactions

## Prerequisites

### For Backend Development
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later

### For Frontend Development
- Node.js 18+ and pnpm

### For Docker
- Docker and Docker Compose

## Development Notes

### Backend Architecture

The backend follows modern .NET 8.0 best practices:

- **Minimal APIs** - Lightweight, focused API endpoints
- **Dependency Injection** - Clean separation of concerns
- **Clean Architecture** - Models, DTOs, Services, Helpers
- **Thread Safety** - Lock-based synchronization for concurrent access
- **Comprehensive Testing** - Unit and integration tests

See [backend/README.md](backend/README.md) for detailed backend documentation.

### Migration from Node.js

The backend has been migrated from Node.js/Express to .NET 8.0 while maintaining:
- All original API endpoints and functionality
- The same request/response formats
- Compatibility with the existing frontend
- In-memory database with the same seeded data

Benefits of the .NET 8.0 migration:
- Better performance and scalability
- Type safety throughout the codebase
- Modern development practices
- Built-in dependency injection
- Superior testing frameworks
- Better tooling and IDE support

## License

MIT