using Nest;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Entities;

namespace PrimeITServer.Infrastructure.Services;

public sealed class ElasticSearchService : IElasticSearchService
{
    private readonly IElasticClient _elasticClient;

    public ElasticSearchService(IElasticClient elasticClient)
    {
        _elasticClient = elasticClient;
    }

    public async Task IndexJobAsync(PrimeITServer.Domain.Entities.Job job, CancellationToken cancellationToken = default)
    {
        var response = await _elasticClient.IndexDocumentAsync(job, cancellationToken);
        if (!response.IsValid)
        {
            // Log failure in real-world
        }
    }

    public async Task<IEnumerable<PrimeITServer.Domain.Entities.Job>> SearchJobsAsync(string query, CancellationToken cancellationToken = default)
    {
        var response = await _elasticClient.SearchAsync<PrimeITServer.Domain.Entities.Job>(s => s
            .Query(q => q
                .MultiMatch(m => m
                    .Fields(f => f
                        .Field(job => job.Title, boost: 2.0)
                        .Field(job => job.Description)
                        .Field(job => job.Location)
                        .Field(job => job.Company))
                    .Query(query)
                )
            ), cancellationToken
        );

        if (!response.IsValid)
        {
            return Enumerable.Empty<PrimeITServer.Domain.Entities.Job>();
        }

        return response.Documents;
    }

    public async Task DeleteJobAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        await _elasticClient.DeleteAsync<PrimeITServer.Domain.Entities.Job>(jobId, ct: cancellationToken);
    }
}
