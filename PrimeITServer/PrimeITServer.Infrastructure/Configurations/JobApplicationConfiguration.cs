using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrimeITServer.Domain.Entities;

namespace PrimeITServer.Infrastructure.Configurations;

internal sealed class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    public void Configure(EntityTypeBuilder<JobApplication> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.JobId, x.UserId }).IsUnique(); // One user can apply to a job once
    }
}
