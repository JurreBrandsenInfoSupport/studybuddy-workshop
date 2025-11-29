using System.ComponentModel.DataAnnotations;

namespace StudyBuddy.Api.Models;

public class UpdateTaskStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
