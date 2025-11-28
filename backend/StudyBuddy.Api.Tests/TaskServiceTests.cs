using StudyBuddy.Api.Models;
using StudyBuddy.Api.Services;
using FluentAssertions;

namespace StudyBuddy.Api.Tests;

public class TaskServiceTests
{
    private InMemoryTaskService _service = null!;

    [Fact]
    public void GetAllTasks_ShouldReturnInitialTasks()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var tasks = _service.GetAllTasks().ToList();

        // Assert
        tasks.Should().HaveCount(4);
        tasks.Should().AllSatisfy(task =>
        {
            task.Id.Should().NotBeNullOrEmpty();
            task.Title.Should().NotBeNullOrEmpty();
            task.Subject.Should().NotBeNullOrEmpty();
            task.EstimatedMinutes.Should().BeGreaterThanOrEqualTo(0);
            task.CreatedAt.Should().BeBefore(DateTime.UtcNow.AddMinutes(1));
        });
    }

    [Fact]
    public void GetAllTasks_ShouldReturnCopyOfTasks()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var tasks1 = _service.GetAllTasks();
        var tasks2 = _service.GetAllTasks();

        // Assert
        tasks1.Should().NotBeSameAs(tasks2);
        tasks1.Should().BeEquivalentTo(tasks2);
    }

    [Fact]
    public void GetTaskById_ShouldReturnTask_WhenTaskExists()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var task = _service.GetTaskById("1");

        // Assert
        task.Should().NotBeNull();
        task!.Id.Should().Be("1");
        task.Title.Should().Be("Complete Calculus Problem Set");
    }

    [Fact]
    public void GetTaskById_ShouldReturnNull_WhenTaskDoesNotExist()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var task = _service.GetTaskById("999");

        // Assert
        task.Should().BeNull();
    }

    [Fact]
    public void CreateTask_ShouldCreateNewTask_WithDefaultStatusTodo()
    {
        // Arrange
        _service = new InMemoryTaskService();
        var request = new CreateTaskRequest
        {
            Title = "Test Task",
            Subject = "Testing",
            EstimatedMinutes = 30
        };

        // Act
        var task = _service.CreateTask(request);

        // Assert
        task.Should().NotBeNull();
        task.Id.Should().Be("5"); // Next ID after initial 4 tasks
        task.Title.Should().Be(request.Title);
        task.Subject.Should().Be(request.Subject);
        task.EstimatedMinutes.Should().Be(request.EstimatedMinutes);
        task.Status.Should().Be(StudyTaskStatus.Todo);
        task.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void CreateTask_ShouldIncrementId_ForEachNewTask()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var task1 = _service.CreateTask(new CreateTaskRequest
        {
            Title = "Task 1",
            Subject = "Subject 1",
            EstimatedMinutes = 30
        });
        var task2 = _service.CreateTask(new CreateTaskRequest
        {
            Title = "Task 2",
            Subject = "Subject 2",
            EstimatedMinutes = 45
        });

        // Assert
        task1.Id.Should().Be("5");
        task2.Id.Should().Be("6");
    }

    [Fact]
    public void CreateTask_ShouldAddTaskToList()
    {
        // Arrange
        _service = new InMemoryTaskService();
        var initialCount = _service.GetAllTasks().Count();

        // Act
        _service.CreateTask(new CreateTaskRequest
        {
            Title = "New Task",
            Subject = "Subject",
            EstimatedMinutes = 60
        });

        // Assert
        var newCount = _service.GetAllTasks().Count();
        newCount.Should().Be(initialCount + 1);
    }

    [Fact]
    public void UpdateTask_ShouldUpdateTaskStatus()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var updatedTask = _service.UpdateTask("1", StudyTaskStatus.Done);

        // Assert
        updatedTask.Should().NotBeNull();
        updatedTask!.Id.Should().Be("1");
        updatedTask.Status.Should().Be(StudyTaskStatus.Done);
    }

    [Fact]
    public void UpdateTask_ShouldReturnNull_WhenTaskDoesNotExist()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var updatedTask = _service.UpdateTask("999", StudyTaskStatus.Done);

        // Assert
        updatedTask.Should().BeNull();
    }

    [Fact]
    public void UpdateTask_ShouldPreserveOtherFields()
    {
        // Arrange
        _service = new InMemoryTaskService();
        var originalTask = _service.GetTaskById("1");

        // Act
        var updatedTask = _service.UpdateTask("1", StudyTaskStatus.Done);

        // Assert
        updatedTask!.Title.Should().Be(originalTask!.Title);
        updatedTask.Subject.Should().Be(originalTask.Subject);
        updatedTask.EstimatedMinutes.Should().Be(originalTask.EstimatedMinutes);
    }

    [Fact]
    public void DeleteTask_ShouldDeleteTask_AndReturnTrue()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var result = _service.DeleteTask("1");

        // Assert
        result.Should().BeTrue();
        var task = _service.GetTaskById("1");
        task.Should().BeNull();
    }

    [Fact]
    public void DeleteTask_ShouldReturnFalse_WhenTaskDoesNotExist()
    {
        // Arrange
        _service = new InMemoryTaskService();

        // Act
        var result = _service.DeleteTask("999");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void DeleteTask_ShouldReduceTasksCount()
    {
        // Arrange
        _service = new InMemoryTaskService();
        var initialCount = _service.GetAllTasks().Count();

        // Act
        _service.DeleteTask("1");

        // Assert
        var newCount = _service.GetAllTasks().Count();
        newCount.Should().Be(initialCount - 1);
    }

    [Fact]
    public void Reset_ShouldResetDatabaseToInitialState()
    {
        // Arrange
        _service = new InMemoryTaskService();
        _service.CreateTask(new CreateTaskRequest { Title = "Test", Subject = "Test", EstimatedMinutes = 30 });
        _service.DeleteTask("1");
        _service.UpdateTask("2", StudyTaskStatus.Done);

        // Act
        _service.Reset();

        // Assert
        var tasks = _service.GetAllTasks().ToList();
        tasks.Should().HaveCount(4);
        _service.GetTaskById("1").Should().NotBeNull();
        _service.GetTaskById("2")!.Status.Should().Be(StudyTaskStatus.InProgress);
    }

    [Fact]
    public void Reset_ShouldResetIdCounter()
    {
        // Arrange
        _service = new InMemoryTaskService();
        _service.CreateTask(new CreateTaskRequest { Title = "Test", Subject = "Test", EstimatedMinutes = 30 });
        _service.Reset();

        // Act
        var newTask = _service.CreateTask(new CreateTaskRequest { Title = "Test", Subject = "Test", EstimatedMinutes = 30 });

        // Assert
        newTask.Id.Should().Be("5");
    }
}
