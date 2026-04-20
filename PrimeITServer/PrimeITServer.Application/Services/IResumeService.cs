using PrimeITServer.Domain.Entities;

namespace PrimeITServer.Application.Services;

public interface IResumeService
{
    Task<Resume?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task CreateAsync(Resume resume, CancellationToken cancellationToken = default);
    Task UpdateAsync(Guid userId, Resume resume, CancellationToken cancellationToken = default);
}
