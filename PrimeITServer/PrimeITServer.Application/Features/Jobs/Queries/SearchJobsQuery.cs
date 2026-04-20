using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Queries;

public sealed record SearchJobsQuery(string SearchTerm) : IRequest<IEnumerable<Job>>;

public sealed class SearchJobsQueryHandler : IRequestHandler<SearchJobsQuery, IEnumerable<Job>>
{
    private readonly IElasticSearchService _elasticSearchService;

    public SearchJobsQueryHandler(IElasticSearchService elasticSearchService)
    {
        _elasticSearchService = elasticSearchService;
    }

    public async Task<IEnumerable<Job>> Handle(SearchJobsQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            // Empty search term could return popular jobs from Redis instead.
            // But we'll let it pass for now.
             return new List<Job>();
        }

        return await _elasticSearchService.SearchJobsAsync(request.SearchTerm, cancellationToken);
    }
}
