using StudyBuddy.Api.Models;
using StudyBuddy.Api.Helpers;

namespace StudyBuddy.Api.DTOs;

public static class TaskMapper
{
    public static TaskResponse ToResponse(this StudyTask task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Subject = task.Subject,
            EstimatedMinutes = task.EstimatedMinutes,
            Status = task.Status.ToApiString(),
            CreatedAt = task.CreatedAt.ToString("o") // ISO 8601 format
        };
    }
}
