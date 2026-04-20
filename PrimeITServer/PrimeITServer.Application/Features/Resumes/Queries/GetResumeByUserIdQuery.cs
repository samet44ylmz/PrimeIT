using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Resumes.Queries;

public sealed record GetResumeByUserIdQuery(Guid UserId) : IRequest<Resume?>;

public sealed class GetResumeByUserIdQueryHandler : IRequestHandler<GetResumeByUserIdQuery, Resume?>
{
    private readonly IResumeService _resumeService;

    public GetResumeByUserIdQueryHandler(IResumeService resumeService)
    {
        _resumeService = resumeService;
    }

    public async Task<Resume?> Handle(GetResumeByUserIdQuery request, CancellationToken cancellationToken)
    {
        return await _resumeService.GetByUserIdAsync(request.UserId, cancellationToken);
    }
}
