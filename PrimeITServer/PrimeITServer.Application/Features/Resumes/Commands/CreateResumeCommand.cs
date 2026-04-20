using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Resumes.Commands;

public sealed record CreateResumeCommand(
    Guid UserId,
    string Summary,
    List<Experience> Experiences,
    List<Education> Educations,
    List<string> Skills) : IRequest;

public sealed class CreateResumeCommandHandler : IRequestHandler<CreateResumeCommand>
{
    private readonly IResumeService _resumeService;

    public CreateResumeCommandHandler(IResumeService resumeService)
    {
        _resumeService = resumeService;
    }

    public async Task Handle(CreateResumeCommand request, CancellationToken cancellationToken)
    {
        // Check if exists
        var existing = await _resumeService.GetByUserIdAsync(request.UserId, cancellationToken);
        
        if (existing is not null)
        {
            existing.Summary = request.Summary;
            existing.Experiences = request.Experiences;
            existing.Educations = request.Educations;
            existing.Skills = request.Skills;
            existing.UpdatedAt = DateTime.UtcNow;

            await _resumeService.UpdateAsync(request.UserId, existing, cancellationToken);
        }
        else
        {
            var newResume = new Resume
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Summary = request.Summary,
                Experiences = request.Experiences,
                Educations = request.Educations,
                Skills = request.Skills,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _resumeService.CreateAsync(newResume, cancellationToken);
        }
    }
}
