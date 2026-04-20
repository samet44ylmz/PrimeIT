using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PrimeITServer.Domain.Entities;

namespace PrimeITServer.Infrastructure.Configurations;

internal sealed class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Company).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Location).HasMaxLength(150);
        builder.Property(x => x.SalaryMin).HasColumnType("decimal(18,2)");
        builder.Property(x => x.SalaryMax).HasColumnType("decimal(18,2)");
    }
}
