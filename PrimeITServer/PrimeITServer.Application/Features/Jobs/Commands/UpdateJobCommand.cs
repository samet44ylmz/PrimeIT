using MediatR;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Repositories;
using GenericRepository;
using TS.Result;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeITServer.Application.Features.Jobs.Commands;

public sealed record UpdateJobCommand(
    Guid JobId,
    Guid EmployerId,
    string Title,
    string Description,
    string Location,
    string Company,
    decimal SalaryMin,
    decimal SalaryMax,
    List<string>? Questions = null) : IRequest<Result<string>>;

public sealed class UpdateJobCommandHandler : IRequestHandler<UpdateJobCommand, Result<string>>
{
    private readonly IJobRepository _jobRepository;
    private readonly IElasticSearchService _elasticSearchService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateJobCommandHandler(IJobRepository jobRepository, IElasticSearchService elasticSearchService, IUnitOfWork unitOfWork)
    {
        _jobRepository = jobRepository;
        _elasticSearchService = elasticSearchService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UpdateJobCommand request, CancellationToken cancellationToken)
    {
        var job = await _jobRepository.GetByExpressionAsync(x => x.Id == request.JobId, cancellationToken);
        
        if (job is null)
        {
            return (404, "İlan bulunamadı.");
        }

        if (job.EmployerId != request.EmployerId)
        {
            return (403, "Bu ilanı düzenleme yetkiniz bulunmamaktadır.");
        }

        job.Title = request.Title;
        job.Description = request.Description;
        job.Location = request.Location;
        job.Company = request.Company;
        job.SalaryMin = request.SalaryMin;
        job.SalaryMax = request.SalaryMax;
        job.QuestionsJson = System.Text.Json.JsonSerializer.Serialize(request.Questions ?? new List<string>());

        _jobRepository.Update(job);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Update ElasticSearch index
        await _elasticSearchService.IndexJobAsync(job, cancellationToken);

        return "İlan başarıyla güncellendi.";
    }
}
