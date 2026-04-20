namespace PrimeITServer.Domain.Entities;

public sealed class JobApplication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public Guid UserId { get; set; }
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // Pending, Reviewed, Accepted, Rejected
    public string AnswersJson { get; set; } = "[]";
    public string? CVPath { get; set; }
    public string? EmployerMessage { get; set; }
    public int? AiScore { get; set; }
    public string? AiEvaluation { get; set; }
}
