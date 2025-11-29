namespace StudyBuddy.Api.DTOs;

public class TaskResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public int ActualMinutes { get; set; }
    public List<TimerSessionResponse> TimerSessions { get; set; } = new();
}
