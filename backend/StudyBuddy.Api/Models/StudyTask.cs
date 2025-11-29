namespace StudyBuddy.Api.Models;

public class StudyTask
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public StudyTaskStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ActualMinutes { get; set; } = 0;
    public List<TimerSession> TimerSessions { get; set; } = new();
}
