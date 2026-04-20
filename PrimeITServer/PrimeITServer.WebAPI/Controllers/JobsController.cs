using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrimeITServer.Application.Features.Jobs.Commands;
using PrimeITServer.Application.Features.Jobs.Queries;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly IMediator _mediator;

    public JobsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("get-all")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var jobs = await _mediator.Send(new GetAllJobsQuery(), cancellationToken);
        return Ok(jobs);
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateJobCommand command, CancellationToken cancellationToken)
    {
        var jobId = await _mediator.Send(command, cancellationToken);
        return Ok(new { JobId = jobId, Message = "Job created and indexed successfully." });
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        var jobs = await _mediator.Send(new SearchJobsQuery(q), cancellationToken);
        return Ok(jobs);
    }

    [HttpGet("get-employer-jobs")]
    public async Task<IActionResult> GetEmployerJobs([FromQuery] Guid employerId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetEmployerJobsQuery(employerId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("get-by-id")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByJobId([FromQuery] Guid id, CancellationToken cancellationToken)
    {
        var all = await _mediator.Send(new GetAllJobsQuery(), cancellationToken);
        var job = all.FirstOrDefault(x => x.Id == id);
        return Ok(job);
    }

    [HttpPut("update")]
    public async Task<IActionResult> Update([FromBody] UpdateJobCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> Delete([FromQuery] Guid jobId, [FromQuery] Guid employerId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteJobCommand(jobId, employerId), cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("toggle-status")]
    public async Task<IActionResult> ToggleStatus([FromQuery] Guid jobId, [FromQuery] Guid employerId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ToggleJobStatusCommand(jobId, employerId), cancellationToken);
        return StatusCode(result.StatusCode, result);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> Sync(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new SyncJobsToElasticSearchCommand(), cancellationToken);
        return StatusCode(result.StatusCode, result);
    }
}
