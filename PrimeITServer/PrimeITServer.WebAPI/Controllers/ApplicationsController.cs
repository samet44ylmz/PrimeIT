using MediatR;
using Microsoft.AspNetCore.Mvc;
using PrimeITServer.Application.Features.Applications.Commands;
using PrimeITServer.Application.Features.Applications.Queries;
using System.Security.Claims;

namespace PrimeITServer.WebAPI.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
[Microsoft.AspNetCore.Authorization.Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ApplicationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Apply([FromForm] ApplyToJobCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet]
    public async Task<IActionResult> MyApplications([FromQuery] Guid userId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetMyApplicationsQuery(userId), cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> JobApplications([FromQuery] Guid employerId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetJobApplicationsQuery(employerId), cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetJobApplicationsWithDetails([FromQuery] Guid jobId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetJobApplicationsWithDetailsQuery(jobId), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Evaluate([FromBody] EvaluateApplicationWithAiCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateApplicationStatusCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetEmployerApplications([FromQuery] string? status, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
        
        var employerId = Guid.Parse(userIdClaim);
        var result = await _mediator.Send(new GetEmployerApplicationsQuery(employerId, status), cancellationToken);
        return Ok(result);
    }
}
