using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;

namespace PrimeITServer.Application.Features.Jobs.Queries;

public sealed record EmployerJobDto(
    Guid Id,
    string Title,
    string Location,
    DateTime CreatedAt,
    bool IsActive,
    int ApplicationCount);

public sealed record GetEmployerJobsQuery(Guid EmployerId) : IRequest<List<EmployerJobDto>>;

public sealed class GetEmployerJobsQueryHandler : IRequestHandler<GetEmployerJobsQuery, List<EmployerJobDto>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IJobApplicationRepository _applicationRepository;

    public GetEmployerJobsQueryHandler(
        IJobRepository jobRepository,
        IJobApplicationRepository applicationRepository)
    {
        _jobRepository = jobRepository;
        _applicationRepository = applicationRepository;
    }

    public async Task<List<EmployerJobDto>> Handle(GetEmployerJobsQuery request, CancellationToken cancellationToken)
    {
        var jobs = await _jobRepository
            .Where(j => j.EmployerId == request.EmployerId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync(cancellationToken);

        var response = new List<EmployerJobDto>();

        foreach (var job in jobs)
        {
            var count = await _applicationRepository
                .Where(a => a.JobId == job.Id)
                .CountAsync(cancellationToken);

            response.Add(new EmployerJobDto(
                job.Id,
                job.Title,
                job.Location,
                job.CreatedAt,
                job.IsActive,
                count));
        }

        return response;
    }
}
