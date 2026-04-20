using PrimeITServer.Domain.Abstractions;

namespace PrimeITServer.Domain.Entities;

public sealed class Notification : Entity
{
    public Guid AppUserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // e.g., "StatusUpdate", "InterviewOffer"
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
