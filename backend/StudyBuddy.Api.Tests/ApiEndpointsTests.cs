using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using StudyBuddy.Api.DTOs;
using StudyBuddy.Api.Models;
using StudyBuddy.Api.Services;
using FluentAssertions;
using Xunit;

namespace StudyBuddy.Api.Tests;

public class ApiEndpointsTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly ITaskService _taskService;

    public ApiEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _taskService = _factory.Services.GetRequiredService<ITaskService>();
        // Reset the database before each test
        _taskService.Reset();
    }

    public void Dispose()
    {
        // Reset after each test as well
        _taskService.Reset();
    }

    [Fact]
    public async Task HealthCheck_ShouldReturnOk()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("ok");
    }

    [Fact]
    public async Task GetAllTasks_ShouldReturnAllTasks()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskResponse>>();
        tasks.Should().NotBeNull();
        tasks.Should().HaveCount(4);
        tasks.Should().AllSatisfy(task =>
        {
            task.Id.Should().NotBeNullOrEmpty();
            task.Title.Should().NotBeNullOrEmpty();
            task.Subject.Should().NotBeNullOrEmpty();
            task.EstimatedMinutes.Should().BeGreaterThanOrEqualTo(0);
            task.Status.Should().NotBeNullOrEmpty();
            task.CreatedAt.Should().NotBeNullOrEmpty();
        });
    }

    [Fact]
    public async Task GetTaskById_ShouldReturnTask_WhenTaskExists()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task.Should().NotBeNull();
        task!.Id.Should().Be("1");
        task.Title.Should().Be("Complete Calculus Problem Set");
    }

    [Fact]
    public async Task GetTaskById_ShouldReturn404_WhenTaskDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Task not found");
    }

    [Fact]
    public async Task CreateTask_ShouldCreateTask_WithValidData()
    {
        // Arrange
        var newTask = new CreateTaskRequest
        {
            Title = "Test Task",
            Subject = "Testing",
            EstimatedMinutes = 45
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", newTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task.Should().NotBeNull();
        task!.Title.Should().Be(newTask.Title);
        task.Subject.Should().Be(newTask.Subject);
        task.EstimatedMinutes.Should().Be(newTask.EstimatedMinutes);
        task.Status.Should().Be("todo");
        task.CreatedAt.Should().NotBeNullOrEmpty();

        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString().Should().Contain($"/api/tasks/{task.Id}");
    }

    [Fact]
    public async Task CreateTask_ShouldReturn400_WhenTitleIsMissing()
    {
        // Arrange
        var invalidTask = new { subject = "Testing", estimatedMinutes = 45 };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", invalidTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Missing required fields");
    }

    [Fact]
    public async Task CreateTask_ShouldReturn400_WhenSubjectIsMissing()
    {
        // Arrange
        var invalidTask = new { title = "Test Task", estimatedMinutes = 45 };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", invalidTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Missing required fields");
    }

    [Fact]
    public async Task CreateTask_ShouldHandleZeroMinutes()
    {
        // Arrange
        var newTask = new CreateTaskRequest
        {
            Title = "Quick Task",
            Subject = "Testing",
            EstimatedMinutes = 0
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", newTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task!.EstimatedMinutes.Should().Be(0);
    }

    [Fact]
    public async Task CreateTask_ShouldHandleLargeMinutesValue()
    {
        // Arrange
        var newTask = new CreateTaskRequest
        {
            Title = "Long Task",
            Subject = "Testing",
            EstimatedMinutes = 999999
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", newTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task!.EstimatedMinutes.Should().Be(999999);
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldUpdateStatus_ToDone()
    {
        // Arrange
        var updateRequest = new UpdateTaskStatusRequest { Status = "done" };

        // Act
        var response = await _client.PatchAsync("/api/tasks/1",
            JsonContent.Create(updateRequest));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task.Should().NotBeNull();
        task!.Id.Should().Be("1");
        task.Status.Should().Be("done");
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldUpdateStatus_ToInProgress()
    {
        // Arrange
        var updateRequest = new UpdateTaskStatusRequest { Status = "in-progress" };

        // Act
        var response = await _client.PatchAsync("/api/tasks/1",
            JsonContent.Create(updateRequest));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task!.Status.Should().Be("in-progress");
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldUpdateStatus_ToTodo()
    {
        // Arrange
        var updateRequest = new UpdateTaskStatusRequest { Status = "todo" };

        // Act
        var response = await _client.PatchAsync("/api/tasks/2",
            JsonContent.Create(updateRequest));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task!.Status.Should().Be("todo");
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldReturn400_WhenStatusIsMissing()
    {
        // Arrange
        var updateRequest = new { };

        // Act
        var response = await _client.PatchAsync("/api/tasks/1",
            JsonContent.Create(updateRequest));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Invalid status");
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldReturn400_WhenStatusIsInvalid()
    {
        // Arrange
        var updateRequest = new UpdateTaskStatusRequest { Status = "invalid-status" };

        // Act
        var response = await _client.PatchAsync("/api/tasks/1",
            JsonContent.Create(updateRequest));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Invalid status");
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldReturn404_WhenTaskDoesNotExist()
    {
        // Arrange
        var updateRequest = new UpdateTaskStatusRequest { Status = "done" };

        // Act
        var response = await _client.PatchAsync("/api/tasks/999",
            JsonContent.Create(updateRequest));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Task not found");
    }

    [Fact]
    public async Task DeleteTask_ShouldDeleteTask()
    {
        // First, get the current count of tasks
        var initialResponse = await _client.GetAsync("/api/tasks");
        var initialTasks = await initialResponse.Content.ReadFromJsonAsync<List<TaskResponse>>();
        var initialCount = initialTasks!.Count;

        // Act - Delete a task
        var deleteResponse = await _client.DeleteAsync("/api/tasks/1");

        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify task count decreased
        var finalResponse = await _client.GetAsync("/api/tasks");
        var finalTasks = await finalResponse.Content.ReadFromJsonAsync<List<TaskResponse>>();
        finalTasks!.Count.Should().Be(initialCount - 1);

        // Verify the specific task is gone
        finalTasks.Should().NotContain(t => t.Id == "1");
    }

    [Fact]
    public async Task DeleteTask_ShouldReturn404_WhenTaskDoesNotExist()
    {
        // Act
        var response = await _client.DeleteAsync("/api/tasks/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Task not found");
    }

    [Fact]
    public async Task CreateTask_ShouldHandleSpecialCharactersInTitle()
    {
        // Arrange
        var newTask = new CreateTaskRequest
        {
            Title = "Task with special chars: @#$%^&*()",
            Subject = "Testing",
            EstimatedMinutes = 30
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", newTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task!.Title.Should().Be(newTask.Title);
    }

    [Fact]
    public async Task CreateTask_ShouldHandleVeryLongTitle()
    {
        // Arrange
        var newTask = new CreateTaskRequest
        {
            Title = new string('A', 1000),
            Subject = "Testing",
            EstimatedMinutes = 30
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", newTask);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        task!.Title.Should().Be(newTask.Title);
    }

    // Timer Endpoint Tests

    [Fact]
    public async Task StartTimer_ShouldReturnTimerSession_WithNormalMode()
    {
        // Arrange
        var request = new { mode = "normal" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks/1/timer/start", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var session = await response.Content.ReadFromJsonAsync<TimerSessionResponse>();
        session.Should().NotBeNull();
        session!.TaskId.Should().Be("1");
        session.Mode.Should().Be("normal");
        session.StartedAt.Should().NotBeNullOrEmpty();
        session.EndedAt.Should().BeNull();
    }

    [Fact]
    public async Task StartTimer_ShouldReturnTimerSession_WithPomodoroMode()
    {
        // Arrange
        var request = new { mode = "pomodoro" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks/1/timer/start", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var session = await response.Content.ReadFromJsonAsync<TimerSessionResponse>();
        session.Should().NotBeNull();
        session!.Mode.Should().Be("pomodoro");
    }

    [Fact]
    public async Task StartTimer_ShouldReturn404_WhenTaskDoesNotExist()
    {
        // Arrange
        var request = new { mode = "normal" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks/999/timer/start", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Task not found");
    }

    [Fact]
    public async Task StartTimer_ShouldReturn400_WithInvalidMode()
    {
        // Arrange
        var request = new { mode = "invalid" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks/1/timer/start", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Invalid timer mode");
    }

    [Fact]
    public async Task StopTimer_ShouldReturnSession_WhenTimerIsActive()
    {
        // Arrange
        var startRequest = new { mode = "normal" };
        await _client.PostAsJsonAsync("/api/tasks/1/timer/start", startRequest);
        await Task.Delay(1000); // Wait 1 second

        // Act
        var response = await _client.PostAsync("/api/tasks/1/timer/stop", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var session = await response.Content.ReadFromJsonAsync<TimerSessionResponse>();
        session.Should().NotBeNull();
        session!.EndedAt.Should().NotBeNullOrEmpty();
        session.DurationSeconds.Should().BeGreaterThanOrEqualTo(1);
    }

    [Fact]
    public async Task StopTimer_ShouldReturn404_WhenNoActiveTimer()
    {
        // Act
        var response = await _client.PostAsync("/api/tasks/1/timer/stop", null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("No active timer found");
    }

    [Fact]
    public async Task StopTimer_ShouldUpdateTaskActualMinutes()
    {
        // Arrange
        var startRequest = new { mode = "normal" };
        await _client.PostAsJsonAsync("/api/tasks/1/timer/start", startRequest);
        await Task.Delay(2000); // Wait 2 seconds

        // Act
        await _client.PostAsync("/api/tasks/1/timer/stop", null);

        // Assert
        var taskResponse = await _client.GetAsync("/api/tasks/1");
        var task = await taskResponse.Content.ReadFromJsonAsync<TaskResponse>();
        task!.ActualMinutes.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetActiveTimer_ShouldReturnSession_WhenTimerIsRunning()
    {
        // Arrange
        var startRequest = new { mode = "pomodoro" };
        await _client.PostAsJsonAsync("/api/tasks/1/timer/start", startRequest);

        // Act
        var response = await _client.GetAsync("/api/tasks/1/timer/active");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var session = await response.Content.ReadFromJsonAsync<TimerSessionResponse>();
        session.Should().NotBeNull();
        session!.TaskId.Should().Be("1");
    }

    [Fact]
    public async Task GetActiveTimer_ShouldReturn404_WhenNoActiveTimer()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/1/timer/active");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetTimerSessions_ShouldReturnAllSessionsForTask()
    {
        // Arrange
        var startRequest = new { mode = "normal" };
        await _client.PostAsJsonAsync("/api/tasks/1/timer/start", startRequest);
        await Task.Delay(100);
        await _client.PostAsync("/api/tasks/1/timer/stop", null);
        await _client.PostAsJsonAsync("/api/tasks/1/timer/start", new { mode = "pomodoro" });
        await Task.Delay(100);
        await _client.PostAsync("/api/tasks/1/timer/stop", null);

        // Act
        var response = await _client.GetAsync("/api/tasks/1/timer/sessions");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var sessions = await response.Content.ReadFromJsonAsync<List<TimerSessionResponse>>();
        sessions.Should().NotBeNull();
        sessions.Should().HaveCount(2);
        sessions.Should().AllSatisfy(s => s.TaskId.Should().Be("1"));
    }

    [Fact]
    public async Task GetTimerSessions_ShouldReturnEmpty_WhenNoSessions()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/1/timer/sessions");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var sessions = await response.Content.ReadFromJsonAsync<List<TimerSessionResponse>>();
        sessions.Should().NotBeNull();
        sessions.Should().BeEmpty();
    }

    [Fact]
    public async Task TimerWorkflow_ShouldWorkEndToEnd()
    {
        // Arrange - Start timer
        var startRequest = new { mode = "pomodoro" };
        var startResponse = await _client.PostAsJsonAsync("/api/tasks/1/timer/start", startRequest);
        startResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Check active timer
        var activeResponse = await _client.GetAsync("/api/tasks/1/timer/active");
        activeResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Wait and stop
        await Task.Delay(1500);
        var stopResponse = await _client.PostAsync("/api/tasks/1/timer/stop", null);
        stopResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Verify no active timer
        var noActiveResponse = await _client.GetAsync("/api/tasks/1/timer/active");
        noActiveResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);

        // Verify sessions were recorded
        var sessionsResponse = await _client.GetAsync("/api/tasks/1/timer/sessions");
        var sessions = await sessionsResponse.Content.ReadFromJsonAsync<List<TimerSessionResponse>>();
        sessions.Should().HaveCount(1);

        // Verify task actual minutes updated
        var taskResponse = await _client.GetAsync("/api/tasks/1");
        var task = await taskResponse.Content.ReadFromJsonAsync<TaskResponse>();
        task!.ActualMinutes.Should().BeGreaterThan(0);
        task.TimerSessions.Should().HaveCount(1);
    }
}
