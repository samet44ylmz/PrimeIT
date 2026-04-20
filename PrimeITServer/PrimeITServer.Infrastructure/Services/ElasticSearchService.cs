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
                    .Fuzziness(Fuzziness.Auto)
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

    public async Task CreateIndexWithMappingAsync(CancellationToken cancellationToken = default)
    {
        var existsResponse = await _elasticClient.Indices.ExistsAsync("jobs", ct: cancellationToken);
        if (existsResponse.Exists)
        {
            await _elasticClient.Indices.DeleteAsync("jobs", ct: cancellationToken);
        }

        await _elasticClient.Indices.CreateAsync("jobs", c => c
            .Settings(s => s
                .Analysis(a => a
                    .Analyzers(an => an
                        .Custom("turkish_analyzer", ca => ca
                            .Tokenizer("standard")
                            .Filters("lowercase", "turkish_lowercase", "turkish_stop", "turkish_stemmer")
                        )
                    )
                    .TokenFilters(tf => tf
                        .Stemmer("turkish_stemmer", st => st.Language("turkish"))
                        .Stop("turkish_stop", st => st.StopWords("_turkish_"))
                        .Lowercase("turkish_lowercase", l => l.Language("turkish"))
                    )
                )
            )
            .Map<Job>(m => m
                .AutoMap()
                .Properties(p => p
                    .Text(t => t.Name(n => n.Title).Analyzer("turkish_analyzer").Boost(2.0))
                    .Text(t => t.Name(n => n.Description).Analyzer("turkish_analyzer"))
                    .Text(t => t.Name(n => n.Location).Analyzer("turkish_analyzer"))
                    .Text(t => t.Name(n => n.Company).Analyzer("turkish_analyzer"))
                )
            ), cancellationToken);
    }

    public async Task SyncAllJobsAsync(IEnumerable<Job> jobs, CancellationToken cancellationToken = default)
    {
        await CreateIndexWithMappingAsync(cancellationToken);

        var bulkResponse = await _elasticClient.IndexManyAsync(jobs, "jobs", cancellationToken);
        if (!bulkResponse.IsValid)
        {
            // Log bulk errors
        }
    }
}
