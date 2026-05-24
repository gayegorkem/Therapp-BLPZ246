using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class CommentLikeConfiguration : IEntityTypeConfiguration<CommentLike>
{
    public void Configure(EntityTypeBuilder<CommentLike> b)
    {
        b.ToTable("comment_likes");
        b.HasKey(x => new { x.UserId, x.CommentId });

        b.Property(x => x.UserId).HasColumnName("user_id");
        b.Property(x => x.CommentId).HasColumnName("comment_id");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");

        b.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Comment)
            .WithMany(c => c.Likes)
            .HasForeignKey(x => x.CommentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
