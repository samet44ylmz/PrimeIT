using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace PrimeITServer.Application.Features.Applications.Queries;

public sealed record EmployerApplicantDto(
    [property: JsonPropertyName("applicationId")] Guid ApplicationId,
    [property: JsonPropertyName("userId")] Guid UserId,
    [property: JsonPropertyName("fullName")] string FullName,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("jobId")] Guid JobId,
    [property: JsonPropertyName("jobTitle")] string JobTitle,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("appliedAt")] DateTime AppliedAt,
    [property: JsonPropertyName("aiScore")] int? AiScore = null,
    [property: JsonPropertyName("aiEvaluation")] string? AiEvaluation = null,
    [property: JsonPropertyName("employerMessage")] string? EmployerMessage = null);

public sealed record GetEmployerApplicationsQuery(Guid EmployerId, string? Status = null) : IRequest<List<EmployerApplicantDto>>;

public sealed class GetEmployerApplicationsQueryHandler : IRequestHandler<GetEmployerApplicationsQuery, List<EmployerApplicantDto>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly UserManager<AppUser> _userManager;

    public GetEmployerApplicationsQueryHandler(
        IJobApplicationRepository applicationRepository,
        IJobRepository jobRepository,
        UserManager<AppUser> userManager)
    {
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
        _userManager = userManager;
    }

    public async Task<List<EmployerApplicantDto>> Handle(GetEmployerApplicationsQuery request, CancellationToken cancellationToken)
    {
        // 1. Get all jobs owned by the employer
        var jobs = await _jobRepository
            .Where(j => j.EmployerId == request.EmployerId)
            .ToListAsync(cancellationToken);

        var jobIds = jobs.Select(j => j.Id).ToList();

        // 2. Get applications for these jobs, filtered by status if provided
        var applicationQuery = _applicationRepository.Where(a => jobIds.Contains(a.JobId));
        
        if (!string.IsNullOrEmpty(request.Status))
        {
            applicationQuery = applicationQuery.Where(a => a.Status == request.Status);
        }

        var applications = await applicationQuery
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

        // 3. Get user details for these applications
        var userIds = applications.Select(a => a.UserId).Distinct().ToList();
        var users = await _userManager.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        // 4. Map to DTO
        return applications.Select(a =>
        {
            var user = users.FirstOrDefault(u => u.Id == a.UserId);
            var job = jobs.FirstOrDefault(j => j.Id == a.JobId);
            
            return new EmployerApplicantDto(
                a.Id,
                a.UserId,
                user?.FullName ?? "Bilinmeyen Kullanıcı",
                user?.Email ?? "",
                a.JobId,
                job?.Title ?? "Bilinmeyen İlan",
                a.Status,
                a.AppliedAt,
                a.AiScore,
                a.AiEvaluation,
                a.EmployerMessage);
        }).ToList();
    }
}
