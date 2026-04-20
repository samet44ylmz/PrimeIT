using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Entities;
using GenericRepository;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Commands;

public sealed record CreateJobCommand(
    Guid EmployerId,
    string Title,
    string Description,
    string Location,
    string Company,
    decimal SalaryMin,
    decimal SalaryMax,
    List<string>? Questions = null) : IRequest<Guid>;

public sealed class CreateJobCommandHandler : IRequestHandler<CreateJobCommand, Guid>
{
    private readonly IElasticSearchService _elasticSearchService;
    private readonly PrimeITServer.Domain.Repositories.IJobRepository _jobRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateJobCommandHandler(
        IElasticSearchService elasticSearchService, 
        PrimeITServer.Domain.Repositories.IJobRepository jobRepository, 
        IUnitOfWork unitOfWork)
    {
        _elasticSearchService = elasticSearchService;
        _jobRepository = jobRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateJobCommand request, CancellationToken cancellationToken)
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            EmployerId = request.EmployerId,
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            Company = request.Company,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            QuestionsJson = System.Text.Json.JsonSerializer.Serialize(request.Questions ?? new List<string>())
        };

        // Save to PostgreSQL via Generic Repository
        await _jobRepository.AddAsync(job, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        // Once saved, index it to ElasticSearch:
        await _elasticSearchService.IndexJobAsync(job, cancellationToken);

        return job.Id;
    }
}
