using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;

namespace PrimeITServer.Application.Features.Applications.Queries;

// DTO for returning application with job info
public sealed record MyApplicationDto(
    Guid ApplicationId,
    Guid JobId,
    string JobTitle,
    string Company,
    string Location,
    string Status,
    string? EmployerMessage,
    DateTime AppliedAt);

public sealed record GetMyApplicationsQuery(Guid UserId) : IRequest<List<MyApplicationDto>>;

public sealed class GetMyApplicationsQueryHandler : IRequestHandler<GetMyApplicationsQuery, List<MyApplicationDto>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;

    public GetMyApplicationsQueryHandler(
        IJobApplicationRepository applicationRepository,
        IJobRepository jobRepository)
    {
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
    }

    public async Task<List<MyApplicationDto>> Handle(GetMyApplicationsQuery request, CancellationToken cancellationToken)
    {
        var applications = await _applicationRepository
            .Where(a => a.UserId == request.UserId)
            .ToListAsync(cancellationToken);

        var jobIds = applications.Select(a => a.JobId).ToList();
        var jobs = await _jobRepository
            .Where(j => jobIds.Contains(j.Id))
            .ToListAsync(cancellationToken);

        return applications.Select(a =>
        {
            var job = jobs.FirstOrDefault(j => j.Id == a.JobId);
            return new MyApplicationDto(
                a.Id,
                a.JobId,
                job?.Title ?? "Bilinmeyen",
                job?.Company ?? "",
                job?.Location ?? "",
                a.Status,
                a.EmployerMessage,
                a.AppliedAt);
        }).OrderByDescending(x => x.AppliedAt).ToList();
    }
}
