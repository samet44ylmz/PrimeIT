using MediatR;
using Microsoft.EntityFrameworkCore;
using GenericRepository;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using TS.Result;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace PrimeITServer.Application.Features.Applications.Commands;

public sealed record JobAnswerDto(string Question, string Answer);

public sealed record ApplyToJobCommand(
    Guid JobId,
    Guid UserId,
    List<JobAnswerDto>? Answers = null,
    IFormFile? CV = null) : IRequest<Result<string>>;

public sealed class ApplyToJobCommandHandler : IRequestHandler<ApplyToJobCommand, Result<string>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApplyToJobCommandHandler(
        IJobApplicationRepository applicationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(ApplyToJobCommand request, CancellationToken cancellationToken)
    {
        // Check if already applied
        var existing = await _applicationRepository
            .Where(a => a.JobId == request.JobId && a.UserId == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existing is not null)
        {
            return (400, "Bu ilana zaten başvurdunuz.");
        }

        string? cvPath = null;
        if (request.CV != null)
        {
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(request.CV.FileName);
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cvs");
            
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            var filePath = Path.Combine(path, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.CV.CopyToAsync(stream);
            }
            cvPath = "/uploads/cvs/" + fileName;
        }

        var application = new JobApplication
        {
            Id = Guid.NewGuid(),
            JobId = request.JobId,
            UserId = request.UserId,
            AppliedAt = DateTime.UtcNow,
            Status = "Pending",
            AnswersJson = JsonSerializer.Serialize(request.Answers ?? new List<JobAnswerDto>()),
            CVPath = cvPath
        };

        await _applicationRepository.AddAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return "Başvurunuz başarıyla alındı!";
    }
}
