using StudyBuddy.Api.Models;

namespace StudyBuddy.Api.Helpers;

public static class TaskStatusHelper
{
    public static bool TryParseStatus(string status, out StudyTaskStatus result)
    {
        result = StudyTaskStatus.Todo;
        
        return status.ToLowerInvariant() switch
        {
            "todo" => SetResult(StudyTaskStatus.Todo, out result),
            "in-progress" => SetResult(StudyTaskStatus.InProgress, out result),
            "done" => SetResult(StudyTaskStatus.Done, out result),
            _ => false
        };
    }

    public static string ToApiString(this StudyTaskStatus status)
    {
        return status switch
        {
            StudyTaskStatus.Todo => "todo",
            StudyTaskStatus.InProgress => "in-progress",
            StudyTaskStatus.Done => "done",
            _ => "todo"
        };
    }

    private static bool SetResult(StudyTaskStatus status, out StudyTaskStatus result)
    {
        result = status;
        return true;
    }
}
