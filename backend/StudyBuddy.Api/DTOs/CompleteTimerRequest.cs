namespace StudyBuddy.Api.DTOs;

public class CompleteTimerRequest
{
    public string SessionType { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
}
