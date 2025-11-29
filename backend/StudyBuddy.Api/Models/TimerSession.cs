namespace StudyBuddy.Api.Models;

public class TimerSession
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    public TimerMode Mode { get; set; }
    public int PomodoroIntervals { get; set; } = 0;
}
