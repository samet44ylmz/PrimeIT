using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;

namespace PrimeITServer.Application.Features.Applications.Queries;

public sealed record JobApplicantDto(
    Guid ApplicationId,
    Guid UserId,
    string JobTitle,
    string Status,
    DateTime AppliedAt);

public sealed record GetJobApplicationsQuery(Guid EmployerId) : IRequest<List<JobApplicantDto>>;

public sealed class GetJobApplicationsQueryHandler : IRequestHandler<GetJobApplicationsQuery, List<JobApplicantDto>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;

    public GetJobApplicationsQueryHandler(
        IJobApplicationRepository applicationRepository,
        IJobRepository jobRepository)
    {
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
    }

    public async Task<List<JobApplicantDto>> Handle(GetJobApplicationsQuery request, CancellationToken cancellationToken)
    {
        // Get employer's jobs
        var employerJobs = await _jobRepository
            .Where(j => j.EmployerId == request.EmployerId)
            .ToListAsync(cancellationToken);

        var jobIds = employerJobs.Select(j => j.Id).ToList();

        // Get all applications for those jobs
        var applications = await _applicationRepository
            .Where(a => jobIds.Contains(a.JobId))
            .ToListAsync(cancellationToken);

        return applications.Select(a =>
        {
            var job = employerJobs.FirstOrDefault(j => j.Id == a.JobId);
            return new JobApplicantDto(
                a.Id,
                a.UserId,
                job?.Title ?? "Bilinmeyen",
                a.Status,
                a.AppliedAt);
        }).OrderByDescending(x => x.AppliedAt).ToList();
    }
}
