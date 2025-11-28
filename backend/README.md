# StudyBuddy+ Backend (.NET 8.0)

A modern ASP.NET Core 8.0 backend API for the StudyBuddy+ student task manager application.

## Features

- ✅ Built with .NET 8.0 and Minimal APIs
- ✅ Clean architecture with dependency injection
- ✅ In-memory database with seeded example data
- ✅ Comprehensive unit and integration tests (34 tests)
- ✅ Swagger/OpenAPI documentation
- ✅ CORS support for frontend integration
- ✅ Docker support

## Technology Stack

- **Framework**: ASP.NET Core 8.0
- **API Style**: Minimal APIs
- **Testing**: xUnit, FluentAssertions, WebApplicationFactory
- **Documentation**: Swagger/OpenAPI
- **Dependency Injection**: Built-in ASP.NET Core DI

## Project Structure

```
backend/
├── StudyBuddy.Api/              # Main API project
│   ├── DTOs/                    # Data Transfer Objects
│   ├── Helpers/                 # Helper utilities
│   ├── Models/                  # Domain models
│   ├── Services/                # Business logic services
│   └── Program.cs               # Application entry point
├── StudyBuddy.Api.Tests/        # Test project
│   ├── ApiEndpointsTests.cs     # Integration tests
│   └── TaskServiceTests.cs      # Unit tests
├── Dockerfile                   # Docker configuration
└── StudyBuddy.sln              # Solution file
```

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later

## Getting Started

### Development

1. **Restore dependencies:**
   ```bash
   cd backend
   dotnet restore
   ```

2. **Build the solution:**
   ```bash
   dotnet build
   ```

3. **Run the application:**
   ```bash
   cd StudyBuddy.Api
   dotnet run
   ```

   The API will be available at http://localhost:5228 (default development port)

4. **Access Swagger UI:**
   Open http://localhost:5228/swagger in your browser

### Testing

Run all tests:
```bash
dotnet test
```

Run tests with coverage:
```bash
dotnet test --collect:"XPlat Code Coverage"
```

Run tests with detailed output:
```bash
dotnet test --logger "console;verbosity=detailed"
```

### Docker

Build and run using Docker:
```bash
docker build -t studybuddy-backend .
docker run -p 3001:3001 studybuddy-backend
```

Or use Docker Compose from the root directory:
```bash
docker compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/{id}` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/{id}` | Update task status |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Example Requests

**Create a task:**
```json
POST /api/tasks
{
  "title": "Complete Math Homework",
  "subject": "Mathematics",
  "estimatedMinutes": 60
}
```

**Update task status:**
```json
PATCH /api/tasks/1
{
  "status": "done"
}
```

Valid status values: `todo`, `in-progress`, `done`

## Architecture & Best Practices

This backend follows modern .NET 8.0 best practices:

### Minimal APIs
- Uses ASP.NET Core Minimal APIs for a lightweight, focused approach
- Explicit endpoint definitions with routing, validation, and documentation
- OpenAPI/Swagger integration for API documentation

### Dependency Injection
- Constructor-based dependency injection
- Service lifetime management (Singleton for in-memory database)
- Clear separation of concerns

### Clean Architecture
- **Models**: Domain entities (StudyTask, StudyTaskStatus)
- **DTOs**: Data transfer objects for API requests/responses
- **Services**: Business logic (ITaskService, InMemoryTaskService)
- **Helpers**: Utility functions (TaskStatusHelper)

### Testing
- Unit tests for service layer
- Integration tests for API endpoints
- Uses WebApplicationFactory for end-to-end testing
- FluentAssertions for readable test assertions

### Error Handling
- Proper HTTP status codes (200, 201, 204, 400, 404)
- Validation for required fields and valid values
- Clear error messages in responses

### Thread Safety
- Singleton service with lock-based thread synchronization
- Safe for concurrent requests

## Configuration

The application can be configured using:
- `appsettings.json` - Default configuration
- `appsettings.Development.json` - Development environment overrides
- Environment variables
- Command line arguments

Example environment variables:
```bash
export ASPNETCORE_ENVIRONMENT=Development
export ASPNETCORE_URLS=http://+:3001
```

## Development Notes

### Adding New Features
1. Create domain models in `Models/`
2. Add DTOs for request/response in `DTOs/`
3. Implement business logic in `Services/`
4. Add API endpoints in `Program.cs`
5. Write tests in `StudyBuddy.Api.Tests/`

### Code Quality
- Follow C# naming conventions
- Use nullable reference types
- Write XML documentation for public APIs
- Maintain test coverage

## License

MIT
