using GenericRepository;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using PrimeITServer.Infrastructure.Context;

namespace PrimeITServer.Infrastructure.Repositories;

internal sealed class JobApplicationRepository : Repository<JobApplication, ApplicationDbContext>, IJobApplicationRepository
{
    public JobApplicationRepository(ApplicationDbContext context) : base(context)
    {
    }
}
