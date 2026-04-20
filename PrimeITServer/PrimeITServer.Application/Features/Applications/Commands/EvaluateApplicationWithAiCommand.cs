using MediatR;
using Microsoft.EntityFrameworkCore;
using GenericRepository;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using PrimeITServer.Application.Services;
using TS.Result;

namespace PrimeITServer.Application.Features.Applications.Commands;

public sealed record EvaluateApplicationWithAiCommand(Guid ApplicationId) : IRequest<Result<string>>;

public sealed class EvaluateApplicationWithAiCommandHandler : IRequestHandler<EvaluateApplicationWithAiCommand, Result<string>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IResumeService _resumeService;
    private readonly IAiService _aiService;
    private readonly IUnitOfWork _unitOfWork;

    public EvaluateApplicationWithAiCommandHandler(
        IJobApplicationRepository applicationRepository,
        IJobRepository jobRepository,
        IResumeService resumeService,
        IAiService aiService,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _jobRepository = jobRepository;
        _resumeService = resumeService;
        _aiService = aiService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(EvaluateApplicationWithAiCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository
            .Where(a => a.Id == request.ApplicationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (application is null)
        {
            return (404, "Başvuru bulunamadı.");
        }

        var job = await _jobRepository
            .Where(j => j.Id == application.JobId)
            .FirstOrDefaultAsync(cancellationToken);

        if (job is null)
        {
            return (404, "İlgili iş ilanı bulunamadı.");
        }

        // Fetch Candidate Profile (Resume)
        var resume = await _resumeService.GetByUserIdAsync(application.UserId, cancellationToken);
        var candidateProfile = resume?.Summary ?? "Aday profil özeti bulunamadı.";

        // Call AI Service
        try 
        {
            var (score, evaluation) = await _aiService.EvaluateApplicationAsync(
                job.Description, 
                application.AnswersJson, 
                candidateProfile, 
                cancellationToken);
            
            application.AiScore = score;
            application.AiEvaluation = evaluation;
            application.Status = "Reviewed"; 

            _applicationRepository.Update(application);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return "AI Değerlendirmesi başarıyla tamamlandı.";
        }
        catch (Exception ex)
        {
            return (500, "AI Değerlendirmesi sırasında bir hata oluştu: " + ex.Message);
        }
    }
}
