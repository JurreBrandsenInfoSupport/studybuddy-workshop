using StudyBuddy.Api.Models;

namespace StudyBuddy.Api.Helpers;

public static class SessionTypeHelper
{
    public static bool TryParseSessionType(string sessionType, out SessionType result)
    {
        result = SessionType.Work;

        return sessionType.ToLowerInvariant() switch
        {
            "work" => SetResult(SessionType.Work, out result),
            "short-break" => SetResult(SessionType.ShortBreak, out result),
            "long-break" => SetResult(SessionType.LongBreak, out result),
            _ => false
        };
    }

    public static string ToApiString(this SessionType sessionType)
    {
        return sessionType switch
        {
            SessionType.Work => "work",
            SessionType.ShortBreak => "short-break",
            SessionType.LongBreak => "long-break",
            _ => "work"
        };
    }

    private static bool SetResult(SessionType sessionType, out SessionType result)
    {
        result = sessionType;
        return true;
    }
}
