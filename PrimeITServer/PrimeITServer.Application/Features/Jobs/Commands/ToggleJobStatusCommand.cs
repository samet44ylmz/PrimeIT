using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Repositories;
using GenericRepository;
using TS.Result;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Commands;

public sealed record ToggleJobStatusCommand(Guid JobId, Guid EmployerId) : IRequest<Result<string>>;

public sealed class ToggleJobStatusCommandHandler : IRequestHandler<ToggleJobStatusCommand, Result<string>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IElasticSearchService _elasticSearchService;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleJobStatusCommandHandler(IJobRepository jobRepository, IElasticSearchService elasticSearchService, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _elasticSearchService = elasticSearchService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(ToggleJobStatusCommand request, CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByExpressionAsync(x => x.Id == request.JobId, cancellationToken);
        
        if (job is null)
        {
            return (404, "İlan bulunamadı.");
        }

        if (job.EmployerId != request.EmployerId)
        {
            return (403, "Bu işlemi yapma yetkiniz bulunmamaktadır.");
        }

        job.IsActive = !job.IsActive;
        _jobRepository.Update(job);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (job.IsActive)
        {
            // Re-index in ElasticSearch
            await _elasticSearchService.IndexJobAsync(job, cancellationToken);
            return "İlan başarıyla aktifleştirildi.";
        }
        else
        {
            // Remove from ElasticSearch index but stay in DB
            await _elasticSearchService.DeleteJobAsync(job.Id, cancellationToken);
            return "İlan başarıyla pasif hale getirildi.";
        }
    }
}
