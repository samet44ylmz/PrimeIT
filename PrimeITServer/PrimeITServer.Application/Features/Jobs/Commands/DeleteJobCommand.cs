using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Repositories;
using GenericRepository;
using TS.Result;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Commands;

public sealed record DeleteJobCommand(Guid JobId, Guid EmployerId) : IRequest<Result<string>>;

public sealed class DeleteJobCommandHandler : IRequestHandler<DeleteJobCommand, Result<string>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IElasticSearchService _elasticSearchService;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteJobCommandHandler(IJobRepository jobRepository, IElasticSearchService elasticSearchService, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _elasticSearchService = elasticSearchService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(DeleteJobCommand request, CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByExpressionAsync(x => x.Id == request.JobId, cancellationToken);
        
        if (job is null)
        {
            return (404, "İlan bulunamadı.");
        }

        if (job.EmployerId != request.EmployerId)
        {
            return (403, "Bu ilanı silme yetkiniz bulunmamaktadır.");
        }

        _jobRepository.Delete(job);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Remove from ElasticSearch index as well
        await _elasticSearchService.DeleteJobAsync(job.Id, cancellationToken);

        return "İlan başarıyla tamamen kaldırıldı.";
    }
}
