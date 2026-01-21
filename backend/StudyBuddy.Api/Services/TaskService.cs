using StudyBuddy.Api.Models;
using StudyBuddy.Api.DTOs;
using StudyBuddy.Api.Helpers;

namespace StudyBuddy.Api.Services;

public interface ITaskService
{
    IEnumerable<StudyTask> GetAllTasks();
    StudyTask? GetTaskById(string id);
    StudyTask CreateTask(CreateTaskRequest request);
    StudyTask? UpdateTask(string id, StudyTaskStatus status);
    bool DeleteTask(string id);
    void Reset();
    void StartTimerSession(string taskId, SessionType sessionType);
    void CompleteTimerSession(string taskId, SessionType sessionType, int durationMinutes);
    TimerStatsResponse GetTimerStats(string taskId);
}

public class InMemoryTaskService : ITaskService
{
    private List<StudyTask> _tasks;
    private int _nextId;
    private int _nextSessionId = 1;
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

    public void StartTimerSession(string taskId, SessionType sessionType)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null) return;

            var session = new PomodoroSession
            {
                Id = _nextSessionId.ToString(),
                TaskId = taskId,
                SessionType = sessionType,
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.MinValue, // Not completed yet
                DurationMinutes = 0
            };

            task.Sessions.Add(session);
            _nextSessionId++;
        }
    }

    public void CompleteTimerSession(string taskId, SessionType sessionType, int durationMinutes)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null) return;

            // Find the most recent incomplete session of this type
            var session = task.Sessions
                .Where(s => s.TaskId == taskId &&
                           s.SessionType == sessionType &&
                           s.CompletedAt == DateTime.MinValue)
                .OrderByDescending(s => s.StartedAt)
                .FirstOrDefault();

            if (session != null)
            {
                session.CompletedAt = DateTime.UtcNow;
                session.DurationMinutes = durationMinutes;
            }
            else
            {
                // No session was started - create and complete in one go
                session = new PomodoroSession
                {
                    Id = _nextSessionId.ToString(),
                    TaskId = taskId,
                    SessionType = sessionType,
                    StartedAt = DateTime.UtcNow.AddMinutes(-durationMinutes),
                    CompletedAt = DateTime.UtcNow,
                    DurationMinutes = durationMinutes
                };
                task.Sessions.Add(session);
                _nextSessionId++;
            }

            // Update aggregated stats (only count work sessions for pomodoros)
            if (sessionType == SessionType.Work)
            {
                task.TotalPomodoros++;
                task.TotalFocusMinutes += durationMinutes;
            }
        }
    }

    public TimerStatsResponse GetTimerStats(string taskId)
    {
        lock (_lock)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == taskId);
            if (task == null)
            {
                return new TimerStatsResponse
                {
                    TotalPomodoros = 0,
                    TotalFocusMinutes = 0,
                    RecentSessions = new List<SessionDto>()
                };
            }

            var recentSessions = task.Sessions
                .Where(s => s.CompletedAt != DateTime.MinValue)
                .OrderByDescending(s => s.CompletedAt)
                .Take(10)
                .Select(s => new SessionDto
                {
                    Id = s.Id,
                    SessionType = s.SessionType.ToApiString(),
                    StartedAt = s.StartedAt.ToString("o"),
                    CompletedAt = s.CompletedAt.ToString("o"),
                    DurationMinutes = s.DurationMinutes
                })
                .ToList();

            return new TimerStatsResponse
            {
                TotalPomodoros = task.TotalPomodoros,
                TotalFocusMinutes = task.TotalFocusMinutes,
                RecentSessions = recentSessions
            };
        }
    }
}