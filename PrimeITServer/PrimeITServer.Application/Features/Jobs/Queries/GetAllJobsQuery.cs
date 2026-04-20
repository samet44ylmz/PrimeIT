using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Queries;

public sealed record GetAllJobsQuery() : IRequest<List<Job>>;

public sealed class GetAllJobsQueryHandler : IRequestHandler<GetAllJobsQuery, List<Job>>
{
    private readonly IJobRepository _jobRepository;

    public GetAllJobsQueryHandler(IJobRepository jobRepository)
    {
        _jobRepository = jobRepository;
    }

    public async Task<List<Job>> Handle(GetAllJobsQuery request, CancellationToken cancellationToken)
    {
        return await _jobRepository.Where(j => j.IsActive).ToListAsync(cancellationToken);
    }
}
