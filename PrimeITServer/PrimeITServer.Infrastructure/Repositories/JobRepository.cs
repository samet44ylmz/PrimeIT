using GenericRepository;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using PrimeITServer.Infrastructure.Context;

namespace PrimeITServer.Infrastructure.Repositories;

internal sealed class JobRepository : Repository<Job, ApplicationDbContext>, IJobRepository
{
    public JobRepository(ApplicationDbContext context) : base(context)
    {
    }
}
