using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrimeITServer.Application.Features.Resumes.Commands;
using PrimeITServer.Application.Features.Resumes.Queries;
using System.Security.Claims;
using System.Text.Json.Serialization;
using System.Linq;

namespace PrimeITServer.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Requires authentication, users should only manage their own resume
public class ResumesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ResumesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("my-resume")]
    public async Task<IActionResult> GetMyResume(CancellationToken cancellationToken)
    {
        // Get user ID from claims
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var resume = await _mediator.Send(new GetResumeByUserIdQuery(userId), cancellationToken);
        
        if (resume is null)
        {
            return NotFound("Resume not found.");
        }

        return Ok(resume);
    }

    [HttpPost]
    public async Task<IActionResult> SubmitResume([FromBody] SubmitResumeRequest request, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var command = new CreateResumeCommand(
                userId,
                request.Summary ?? string.Empty,
                (request.Experiences ?? new()).Select(e => new Domain.Entities.Experience
                {
                    CompanyName = e.CompanyName ?? string.Empty,
                    Title = e.Title ?? string.Empty,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Description = e.Description ?? string.Empty
                }).ToList(),
                (request.Educations ?? new()).Select(e => new Domain.Entities.Education
                {
                    SchoolName = e.SchoolName ?? string.Empty,
                    Degree = e.Degree ?? string.Empty,
                    FieldOfStudy = e.FieldOfStudy ?? string.Empty,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate
                }).ToList(),
                request.Skills ?? new());

            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Resume submitted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating profile.", detail = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    [Authorize(Roles = "Employer")]
    public async Task<IActionResult> GetResumeByUserId(Guid userId, CancellationToken cancellationToken)
    {
        var resume = await _mediator.Send(new GetResumeByUserIdQuery(userId), cancellationToken);
        
        if (resume is null)
        {
            return NotFound("Aday henüz özgeçmiş oluşturmamış.");
        }

        return Ok(resume);
    }
}

public sealed record SubmitResumeRequest(
    [property: JsonPropertyName("summary")] string? Summary,
    [property: JsonPropertyName("experiences")] List<ExperienceDto>? Experiences,
    [property: JsonPropertyName("educations")] List<EducationDto>? Educations,
    [property: JsonPropertyName("skills")] List<string>? Skills);

public sealed record ExperienceDto(
    [property: JsonPropertyName("companyName")] string? CompanyName,
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("startDate")] DateTime StartDate,
    [property: JsonPropertyName("endDate")] DateTime? EndDate,
    [property: JsonPropertyName("isCurrent")] bool IsCurrent,
    [property: JsonPropertyName("description")] string? Description);

public sealed record EducationDto(
    [property: JsonPropertyName("schoolName")] string? SchoolName,
    [property: JsonPropertyName("degree")] string? Degree,
    [property: JsonPropertyName("fieldOfStudy")] string? FieldOfStudy,
    [property: JsonPropertyName("startDate")] DateTime StartDate,
    [property: JsonPropertyName("endDate")] DateTime? EndDate);
