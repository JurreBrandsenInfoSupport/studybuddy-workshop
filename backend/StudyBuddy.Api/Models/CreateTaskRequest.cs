using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Api.Models;

public class CreateTaskRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Subject { get; set; } = string.Empty;
    
    [Range(0, int.MaxValue)]
    public int EstimatedMinutes { get; set; }
}
