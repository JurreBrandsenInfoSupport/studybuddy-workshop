using StudyBuddy.Api.Models;

namespace StudyBuddy.Api.Services;

public interface ITaskService
{
    IEnumerable<StudyTask> GetAllTasks();
    StudyTask? GetTaskById(string id);
    StudyTask CreateTask(CreateTaskRequest request);
    StudyTask? UpdateTask(string id, StudyTaskStatus status);
    bool DeleteTask(string id);
    void Reset();
}

public class InMemoryTaskService : ITaskService
{
    private List<StudyTask> _tasks;
    private int _nextId;
    private readonly object _lock = new();

    public InMemoryTaskService()
    {
        _tasks = GetInitialTasks();
        _nextId = 5;
    }

    private static List<StudyTask> GetInitialTasks()
    {
        var now = DateTime.UtcNow;
        return new List<StudyTask>
        {
            new()
            {
                Id = "1",
                Title = "Complete Calculus Problem Set",
                Subject = "Math",
                EstimatedMinutes = 60,
                Status = StudyTaskStatus.Todo,
                CreatedAt = now.AddDays(-1)
            },
            new()
            {
                Id = "2",
                Title = "Read Chapter 4: Cell Structure",
                Subject = "Biology",
                EstimatedMinutes = 45,
                Status = StudyTaskStatus.InProgress,
                CreatedAt = now.AddDays(-2)
            },
            new()
            {
                Id = "3",
                Title = "Write History Essay Draft",
                Subject = "History",
                EstimatedMinutes = 120,
                Status = StudyTaskStatus.Todo,
                CreatedAt = now.AddHours(-12)
            },
            new()
            {
                Id = "4",
                Title = "Review French Vocabulary",
                Subject = "French",
                EstimatedMinutes = 30,
                Status = StudyTaskStatus.Done,
                CreatedAt = now.AddDays(-3)
            }
        };
    }

    public IEnumerable<StudyTask> GetAllTasks()
    {
        lock (_lock)
        {
            return _tasks.ToList();
        }
    }

    public StudyTask? GetTaskById(string id)
    {
        lock (_lock)
        {
            return _tasks.FirstOrDefault(t => t.Id == id);
        }
    }

    public StudyTask CreateTask(CreateTaskRequest request)
    {
        lock (_lock)
        {
            var task = new StudyTask
            {
                Id = _nextId.ToString(),
                Title = request.Title,
                Subject = request.Subject,
                EstimatedMinutes = request.EstimatedMinutes,
                Status = StudyTaskStatus.Todo,
                CreatedAt = DateTime.UtcNow
            };

            _nextId++;
            _tasks.Add(task);
            return task;
        }
    }

    public StudyTask? UpdateTask(string id, StudyTaskStatus status)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return null;

            task.Status = status;
            return task;
        }
    }

    public bool DeleteTask(string id)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return false;

            _tasks.Remove(task);
            return true;
        }
    }

    public void Reset()
    {
        lock (_lock)
        {
            _tasks = GetInitialTasks();
            _nextId = 5;
        }
    }
}
