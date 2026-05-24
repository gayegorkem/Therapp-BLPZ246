using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class SavedPostConfiguration : IEntityTypeConfiguration<SavedPost>
{
    public void Configure(EntityTypeBuilder<SavedPost> b)
    {
        b.ToTable("saved_posts");
        b.HasKey(x => new { x.UserId, x.PostId });

        b.Property(x => x.UserId).HasColumnName("user_id");
        b.Property(x => x.PostId).HasColumnName("post_id");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");

        b.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Post)
            .WithMany(p => p.Saves)
            .HasForeignKey(x => x.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => new { x.UserId, x.CreatedAt }).HasDatabaseName("ix_saved_posts_user_created");
    }
}
