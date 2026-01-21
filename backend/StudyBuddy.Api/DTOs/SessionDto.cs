namespace StudyBuddy.Api.DTOs;

public class SessionDto
{
    public string Id { get; set; } = string.Empty;
    public string SessionType { get; set; } = string.Empty;
    public string StartedAt { get; set; } = string.Empty;
    public string CompletedAt { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
}
