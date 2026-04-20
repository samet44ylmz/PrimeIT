using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PrimeITServer.Application.Services;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Infrastructure.Options;

namespace PrimeITServer.Infrastructure.Services;

public sealed class ResumeService : IResumeService
{
    private readonly IMongoCollection<Resume> _resumes;

    public ResumeService(IOptions<MongoDbOptions> options)
    {
        var mongoClient = new MongoClient(options.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
        _resumes = mongoDatabase.GetCollection<Resume>("Resumes");
    }

    public async Task CreateAsync(Resume resume, CancellationToken cancellationToken = default)
    {
        await _resumes.InsertOneAsync(resume, cancellationToken: cancellationToken);
    }

    public async Task<Resume?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _resumes.Find(x => x.UserId == userId).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task UpdateAsync(Guid userId, Resume resume, CancellationToken cancellationToken = default)
    {
        await _resumes.ReplaceOneAsync(x => x.UserId == userId, resume, cancellationToken: cancellationToken);
    }
}
