namespace StudyBuddy.Api.DTOs;

public class TimerSessionResponse
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public string StartedAt { get; set; } = string.Empty;
    public string? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    public string Mode { get; set; } = string.Empty;
    public int PomodoroIntervals { get; set; }
}
