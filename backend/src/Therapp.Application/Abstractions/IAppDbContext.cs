using Microsoft.EntityFrameworkCore;
using Therapp.Domain.Entities;

namespace Therapp.Application.Abstractions;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Category> Categories { get; }
    DbSet<Post> Posts { get; }
    DbSet<Comment> Comments { get; }
    DbSet<PostLike> PostLikes { get; }
    DbSet<CommentLike> CommentLikes { get; }
    DbSet<SavedPost> SavedPosts { get; }
    DbSet<Report> Reports { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
