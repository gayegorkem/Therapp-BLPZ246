using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class PostLikeConfiguration : IEntityTypeConfiguration<PostLike>
{
    public void Configure(EntityTypeBuilder<PostLike> b)
    {
        b.ToTable("post_likes");
        b.HasKey(x => new { x.UserId, x.PostId });

        b.Property(x => x.UserId).HasColumnName("user_id");
        b.Property(x => x.PostId).HasColumnName("post_id");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");

        b.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(x => x.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
