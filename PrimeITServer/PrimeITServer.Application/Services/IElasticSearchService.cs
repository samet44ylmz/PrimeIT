using PrimeITServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Services;

public interface IElasticSearchService
{
    Task IndexJobAsync(PrimeITServer.Domain.Entities.Job job, CancellationToken cancellationToken = default);
    Task<IEnumerable<PrimeITServer.Domain.Entities.Job>> SearchJobsAsync(string query, CancellationToken cancellationToken = default);
    Task DeleteJobAsync(Guid jobId, CancellationToken cancellationToken = default);
    Task CreateIndexWithMappingAsync(CancellationToken cancellationToken = default);
    Task SyncAllJobsAsync(IEnumerable<PrimeITServer.Domain.Entities.Job> jobs, CancellationToken cancellationToken = default);
}
