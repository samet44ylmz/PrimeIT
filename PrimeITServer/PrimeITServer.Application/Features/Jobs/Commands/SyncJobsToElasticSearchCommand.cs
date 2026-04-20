using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Repositories;
using GenericRepository;
using TS.Result;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Commands;

public sealed record SyncJobsToElasticSearchCommand() : IRequest<Result<string>>;

public sealed class SyncJobsToElasticSearchCommandHandler : IRequestHandler<SyncJobsToElasticSearchCommand, Result<string>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IElasticSearchService _elasticSearchService;

    public SyncJobsToElasticSearchCommandHandler(IJobRepository jobRepository, IElasticSearchService elasticSearchService)
    {
        _jobRepository = jobRepository;
        _elasticSearchService = elasticSearchService;
    }

    public async Task<Result<string>> Handle(SyncJobsToElasticSearchCommand request, CancellationToken cancellationToken)
    {
        // Fetch only active jobs to keep the index clean
        var jobs = await _jobRepository.GetAllByExpressionAsync(x => x.IsActive, cancellationToken);
        
        await _elasticSearchService.SyncAllJobsAsync(jobs, cancellationToken);

        return "Bütün aktif ilanlar ElasticSearch üzerine başarıyla senkronize edildi.";
    }
}
