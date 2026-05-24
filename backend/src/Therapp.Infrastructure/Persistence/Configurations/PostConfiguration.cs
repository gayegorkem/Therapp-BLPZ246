using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> b)
    {
        b.ToTable("posts");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        b.Property(x => x.UserId).HasColumnName("user_id");
        b.Property(x => x.CategoryId).HasColumnName("category_id");
        b.Property(x => x.Title).HasColumnName("title").HasMaxLength(150).IsRequired();
        b.Property(x => x.Content).HasColumnName("content").IsRequired();
        b.Property(x => x.IsAnonymous).HasColumnName("is_anonymous").HasDefaultValue(false);
        b.Property(x => x.LikeCount).HasColumnName("like_count").HasDefaultValue(0);
        b.Property(x => x.CommentCount).HasColumnName("comment_count").HasDefaultValue(0);
        b.Property(x => x.SaveCount).HasColumnName("save_count").HasDefaultValue(0);
        b.Property(x => x.IsHidden).HasColumnName("is_hidden").HasDefaultValue(false);
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasOne(x => x.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne(x => x.Category)
            .WithMany(c => c.Posts)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => new { x.CategoryId, x.CreatedAt }).HasDatabaseName("ix_posts_category_created");
        b.HasIndex(x => new { x.UserId, x.CreatedAt }).HasDatabaseName("ix_posts_user_created");
        b.HasIndex(x => x.CreatedAt).HasDatabaseName("ix_posts_created");

        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
