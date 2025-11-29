using StudyBuddy.Api.Services;
using StudyBuddy.Api.Models;
using StudyBuddy.Api.DTOs;
using StudyBuddy.Api.Helpers;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddSingleton<ITaskService, InMemoryTaskService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("HealthCheck")
    .WithOpenApi();

// Get all tasks
app.MapGet("/api/tasks", (ITaskService taskService) =>
{
    var tasks = taskService.GetAllTasks();
    return Results.Ok(tasks.Select(t => t.ToResponse()));
})
.WithName("GetAllTasks")
.WithOpenApi();

// Get a single task by ID
app.MapGet("/api/tasks/{id}", (string id, ITaskService taskService) =>
{
    var task = taskService.GetTaskById(id);
    if (task == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }
    return Results.Ok(task.ToResponse());
})
.WithName("GetTaskById")
.WithOpenApi();

// Create a new task
app.MapPost("/api/tasks", ([FromBody] CreateTaskRequest request, ITaskService taskService) =>
{
    // Validate required fields
    if (string.IsNullOrWhiteSpace(request.Title) ||
        string.IsNullOrWhiteSpace(request.Subject))
    {
        return Results.BadRequest(new { error = "Missing required fields" });
    }

    var task = taskService.CreateTask(request);
    return Results.Created($"/api/tasks/{task.Id}", task.ToResponse());
})
.WithName("CreateTask")
.WithOpenApi();

// Update task status
app.MapPatch("/api/tasks/{id}", ([FromRoute] string id, [FromBody] UpdateTaskStatusRequest request, ITaskService taskService) =>
{
    // Validate status
    if (string.IsNullOrWhiteSpace(request.Status) ||
        !TaskStatusHelper.TryParseStatus(request.Status, out var status))
    {
        return Results.BadRequest(new { error = "Invalid status" });
    }

    var updatedTask = taskService.UpdateTask(id, status);
    if (updatedTask == null)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    return Results.Ok(updatedTask.ToResponse());
})
.WithName("UpdateTaskStatus")
.WithOpenApi();

// Delete a task
app.MapDelete("/api/tasks/{id}", (string id, ITaskService taskService) =>
{
    var deleted = taskService.DeleteTask(id);
    if (!deleted)
    {
        return Results.NotFound(new { error = "Task not found" });
    }

    return Results.NoContent();
})
.WithName("DeleteTask")
.WithOpenApi();

// Start timer
app.MapPost("/api/tasks/{id}/timer/start", (
    string id,
    [FromBody] StartTimerRequest request,
    ITaskService taskService) =>
{
    try
    {
        // Parse timer mode
        if (!Enum.TryParse<TimerMode>(request.Mode, true, out var mode))
        {
            return Results.BadRequest(new { error = "Invalid timer mode. Use 'normal' or 'pomodoro'" });
        }

        var session = taskService.StartTimer(id, mode);
        return Results.Ok(session.ToResponse());
    }
    catch (InvalidOperationException ex)
    {
        return Results.NotFound(new { error = ex.Message });
    }
})
.WithName("StartTimer")
.WithOpenApi();

// Stop timer
app.MapPost("/api/tasks/{id}/timer/stop", (string id, ITaskService taskService) =>
{
    var session = taskService.StopTimer(id);
    if (session == null)
        return Results.NotFound(new { error = "No active timer found" });

    return Results.Ok(session.ToResponse());
})
.WithName("StopTimer")
.WithOpenApi();

// Get active timer
app.MapGet("/api/tasks/{id}/timer/active", (string id, ITaskService taskService) =>
{
    var session = taskService.GetActiveTimer(id);
    if (session == null)
        return Results.NotFound();

    return Results.Ok(session.ToResponse());
})
.WithName("GetActiveTimer")
.WithOpenApi();

// Get timer sessions
app.MapGet("/api/tasks/{id}/timer/sessions", (string id, ITaskService taskService) =>
{
    var sessions = taskService.GetTaskSessions(id);
    return Results.Ok(sessions.Select(s => s.ToResponse()));
})
.WithName("GetTimerSessions")
.WithOpenApi();

app.Run();

// Make the implicit Program class public for testing
public partial class Program { }
