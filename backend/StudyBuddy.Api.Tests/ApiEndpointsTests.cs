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
}
