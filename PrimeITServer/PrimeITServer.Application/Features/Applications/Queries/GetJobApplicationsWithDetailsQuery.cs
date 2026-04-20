using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using Microsoft.AspNetCore.Identity;

using System.Text.Json.Serialization;

namespace PrimeITServer.Application.Features.Applications.Queries;

public sealed record ApplicationDetailDto(
    [property: JsonPropertyName("applicationId")] Guid ApplicationId,
    [property: JsonPropertyName("userId")] Guid UserId,
    [property: JsonPropertyName("fullName")] string FullName,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("appliedAt")] DateTime AppliedAt,
    [property: JsonPropertyName("answersJson")] string AnswersJson,
    [property: JsonPropertyName("cvPath")] string? CVPath,
    [property: JsonPropertyName("aiScore")] int? AiScore = null,
    [property: JsonPropertyName("aiEvaluation")] string? AiEvaluation = null);

public sealed record GetJobApplicationsWithDetailsQuery(Guid JobId) : IRequest<List<ApplicationDetailDto>>;

public sealed class GetJobApplicationsWithDetailsQueryHandler : IRequestHandler<GetJobApplicationsWithDetailsQuery, List<ApplicationDetailDto>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly UserManager<AppUser> _userManager;

    public GetJobApplicationsWithDetailsQueryHandler(
        IJobApplicationRepository applicationRepository,
        UserManager<AppUser> userManager)
    {
        _applicationRepository = applicationRepository;
        _userManager = userManager;
    }

    public async Task<List<ApplicationDetailDto>> Handle(GetJobApplicationsWithDetailsQuery request, CancellationToken cancellationToken)
    {
        var applications = await _applicationRepository
            .Where(a => a.JobId == request.JobId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

        var userIds = applications.Select(a => a.UserId).ToList();
        var users = await _userManager.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        return applications.Select(a =>
        {
            var user = users.FirstOrDefault(u => u.Id == a.UserId);
            return new ApplicationDetailDto(
                a.Id,
                a.UserId,
                user?.FullName ?? "Bilinmeyen Kullanıcı",
                user?.Email ?? "",
                a.Status,
                a.AppliedAt,
                a.AnswersJson,
                a.CVPath,
                a.AiScore,
                a.AiEvaluation);
        }).ToList();
    }
}
