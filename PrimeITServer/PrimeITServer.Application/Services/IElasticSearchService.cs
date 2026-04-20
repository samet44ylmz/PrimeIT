using PrimeITServer.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Services;

public interface IElasticSearchService
{
    Task IndexJobAsync(Job job, CancellationToken cancellationToken = default);
    Task<IEnumerable<Job>> SearchJobsAsync(string query, CancellationToken cancellationToken = default);
    Task DeleteJobAsync(Guid jobId, CancellationToken cancellationToken = default);
}
