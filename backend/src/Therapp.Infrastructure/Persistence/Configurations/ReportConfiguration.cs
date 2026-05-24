using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class ReportConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> b)
    {
        b.ToTable("reports");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        b.Property(x => x.ReporterUserId).HasColumnName("reporter_user_id");
        b.Property(x => x.TargetType).HasColumnName("target_type").HasConversion<short>();
        b.Property(x => x.TargetId).HasColumnName("target_id");
        b.Property(x => x.Reason).HasColumnName("reason").HasConversion<short>();
        b.Property(x => x.Description).HasColumnName("description").HasMaxLength(500);
        b.Property(x => x.Status).HasColumnName("status").HasConversion<short>().HasDefaultValue(Therapp.Domain.Enums.ReportStatus.Pending);
        b.Property(x => x.ResolvedByUserId).HasColumnName("resolved_by_user_id");
        b.Property(x => x.ResolvedAt).HasColumnName("resolved_at");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        b.HasOne(x => x.Reporter)
            .WithMany()
            .HasForeignKey(x => x.ReporterUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.ResolvedBy)
            .WithMany()
            .HasForeignKey(x => x.ResolvedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => new { x.Status, x.CreatedAt }).HasDatabaseName("ix_reports_status_created");
        b.HasIndex(x => new { x.TargetType, x.TargetId }).HasDatabaseName("ix_reports_target");
    }
}
