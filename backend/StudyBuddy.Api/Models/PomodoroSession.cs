namespace StudyBuddy.Api.Models;

public class PomodoroSession
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public SessionType SessionType { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime CompletedAt { get; set; }
    public int DurationMinutes { get; set; }
}
