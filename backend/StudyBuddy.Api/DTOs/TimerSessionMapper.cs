using StudyBuddy.Api.Models;

namespace StudyBuddy.Api.DTOs;

public static class TimerSessionMapper
{
    public static TimerSessionResponse ToResponse(this TimerSession session)
    {
        return new TimerSessionResponse
        {
            Id = session.Id,
            TaskId = session.TaskId,
            StartedAt = session.StartedAt.ToString("o"),
            EndedAt = session.EndedAt?.ToString("o"),
            DurationSeconds = session.DurationSeconds,
            Mode = session.Mode.ToString().ToLowerInvariant(),
            PomodoroIntervals = session.PomodoroIntervals
        };
    }
}
