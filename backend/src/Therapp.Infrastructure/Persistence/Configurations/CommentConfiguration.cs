using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> b)
    {
        b.ToTable("comments");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        b.Property(x => x.PostId).HasColumnName("post_id");
        b.Property(x => x.UserId).HasColumnName("user_id");
        b.Property(x => x.ParentCommentId).HasColumnName("parent_comment_id");
        b.Property(x => x.Content).HasColumnName("content").HasMaxLength(1000).IsRequired();
        b.Property(x => x.LikeCount).HasColumnName("like_count").HasDefaultValue(0);
        b.Property(x => x.IsHidden).HasColumnName("is_hidden").HasDefaultValue(false);
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasOne(x => x.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(x => x.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(x => x.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => new { x.PostId, x.CreatedAt }).HasDatabaseName("ix_comments_post_created");
        b.HasIndex(x => x.ParentCommentId).HasDatabaseName("ix_comments_parent");

        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
