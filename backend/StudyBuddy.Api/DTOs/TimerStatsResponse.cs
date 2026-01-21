namespace StudyBuddy.Api.DTOs;

public class TimerStatsResponse
{
    public int TotalPomodoros { get; set; }
    public int TotalFocusMinutes { get; set; }
    public List<SessionDto> RecentSessions { get; set; } = new();
}
