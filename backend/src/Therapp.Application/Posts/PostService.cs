using Microsoft.EntityFrameworkCore;
using Therapp.Application.Abstractions;
using Therapp.Application.Common;
using Therapp.Application.Notifications;
using Therapp.Application.Posts.Dtos;
using Therapp.Domain.Entities;
using Therapp.Domain.Enums;

namespace Therapp.Application.Posts;

public class PostService : IPostService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _current;
    private readonly INotificationService _notifier;

    public PostService(IAppDbContext db, ICurrentUser current, INotificationService notifier)
    {
        _db = db;
        _current = current;
        _notifier = notifier;
    }

    // ---------- Reads ----------

    public Task<PagedResult<PostListItemDto>> GetFeedAsync(FeedQuery q, CancellationToken ct) =>
        PageAsync(_db.Posts.Where(p => !p.IsHidden), q, ct);

    public async Task<PagedResult<PostListItemDto>> GetByCategoryAsync(string slug, FeedQuery q, CancellationToken ct)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive, ct);
        if (category is null) return Empty(q);

        return await PageAsync(
            _db.Posts.Where(p => !p.IsHidden && p.CategoryId == category.Id),
            q, ct);
    }

    public async Task<Result<PostDto>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        var post = await _db.Posts
            .Where(p => p.Id == id && !p.IsHidden)
            .Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                IsAnonymous = p.IsAnonymous,
                Category = new PostCategoryDto
                {
                    Id = p.Category.Id,
                    Slug = p.Category.Slug,
                    Name = p.Category.Name,
                    Color = p.Category.Color,
                    Icon = p.Category.Icon
                },
                Author = p.IsAnonymous ? null : new PostAuthorDto
                {
                    Id = p.User.Id,
                    Username = p.User.Username,
                    DisplayName = p.User.DisplayName,
                    AvatarUrl = p.User.AvatarUrl
                },
                LikeCount = p.LikeCount,
                CommentCount = p.CommentCount,
                SaveCount = p.SaveCount,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                IsLikedByMe = userId != null && p.Likes.Any(l => l.UserId == userId),
                IsSavedByMe = userId != null && p.Saves.Any(s => s.UserId == userId),
                IsMine = userId != null && p.UserId == userId
            })
            .FirstOrDefaultAsync(ct);

        return post is null
            ? Result<PostDto>.Fail(Errors.NotFound("Gönderi"))
            : Result<PostDto>.Ok(post);
    }

    public async Task<PagedResult<PostListItemDto>> GetMineAsync(FeedQuery q, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Empty(q);
        return await PageAsync(_db.Posts.Where(p => p.UserId == userId), q, ct);
    }

    public async Task<PagedResult<PostListItemDto>> GetMySavedAsync(FeedQuery q, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Empty(q);

        var query = _db.SavedPosts
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => s.Post)
            .Where(p => !p.IsHidden && p.DeletedAt == null);

        return await PageAsync(query, q, ct, skipSort: true);
    }

    // ---------- Writes ----------

    public async Task<Result<PostDto>> CreateAsync(CreatePostDto dto, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result<PostDto>.Fail(Errors.Unauthorized);

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId && c.IsActive, ct);
        if (!categoryExists) return Result<PostDto>.Fail(Errors.NotFound("Kategori"));

        var post = new Post
        {
            UserId = userId.Value,
            CategoryId = dto.CategoryId,
            Title = dto.Title.Trim(),
            Content = dto.Content.Trim(),
            IsAnonymous = dto.IsAnonymous
        };
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(post.Id, ct);
    }

    public async Task<Result<PostDto>> UpdateAsync(Guid id, UpdatePostDto dto, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result<PostDto>.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post is null) return Result<PostDto>.Fail(Errors.NotFound("Gönderi"));
        if (post.UserId != userId) return Result<PostDto>.Fail(Errors.Forbidden);

        post.Title = dto.Title.Trim();
        post.Content = dto.Content.Trim();
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post is null) return Result.Fail(Errors.NotFound("Gönderi"));

        var isOwner = post.UserId == userId;
        var isMod = _current.IsInRole(nameof(UserRole.Moderator)) || _current.IsInRole(nameof(UserRole.Admin));
        if (!isOwner && !isMod) return Result.Fail(Errors.Forbidden);

        post.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result> LikeAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id && !p.IsHidden, ct);
        if (post is null) return Result.Fail(Errors.NotFound("Gönderi"));

        var already = await _db.PostLikes.AnyAsync(l => l.UserId == userId && l.PostId == id, ct);
        if (already) return Result.Ok();

        _db.PostLikes.Add(new PostLike { UserId = userId.Value, PostId = id });
        post.LikeCount += 1;
        await _db.SaveChangesAsync(ct);

        if (post.UserId != userId.Value)
        {
            await _notifier.CreateAsync(post.UserId, userId.Value, NotificationType.PostLike, post.Id, null, null, ct);
        }

        return Result.Ok();
    }

    public async Task<Result> UnlikeAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post is null) return Result.Fail(Errors.NotFound("Gönderi"));

        var like = await _db.PostLikes.FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == id, ct);
        if (like is null) return Result.Ok();

        _db.PostLikes.Remove(like);
        if (post.LikeCount > 0) post.LikeCount -= 1;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result> SaveAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id && !p.IsHidden, ct);
        if (post is null) return Result.Fail(Errors.NotFound("Gönderi"));

        var already = await _db.SavedPosts.AnyAsync(s => s.UserId == userId && s.PostId == id, ct);
        if (already) return Result.Ok();

        _db.SavedPosts.Add(new SavedPost { UserId = userId.Value, PostId = id });
        post.SaveCount += 1;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result> UnsaveAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post is null) return Result.Fail(Errors.NotFound("Gönderi"));

        var saved = await _db.SavedPosts.FirstOrDefaultAsync(s => s.UserId == userId && s.PostId == id, ct);
        if (saved is null) return Result.Ok();

        _db.SavedPosts.Remove(saved);
        if (post.SaveCount > 0) post.SaveCount -= 1;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ---------- Helpers ----------

    private async Task<PagedResult<PostListItemDto>> PageAsync(
        IQueryable<Post> baseQuery, FeedQuery q, CancellationToken ct, bool skipSort = false)
    {
        var userId = _current.UserId;

        var query = baseQuery;
        if (!skipSort)
        {
            query = q.Sort == FeedSort.Popular
                ? query.OrderByDescending(p => p.LikeCount).ThenByDescending(p => p.CreatedAt)
                : query.OrderByDescending(p => p.CreatedAt);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(p => new PostListItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Excerpt = p.Content.Length > 200 ? p.Content.Substring(0, 200) : p.Content,
                IsAnonymous = p.IsAnonymous,
                Category = new PostCategoryDto
                {
                    Id = p.Category.Id,
                    Slug = p.Category.Slug,
                    Name = p.Category.Name,
                    Color = p.Category.Color,
                    Icon = p.Category.Icon
                },
                Author = p.IsAnonymous ? null : new PostAuthorDto
                {
                    Id = p.User.Id,
                    Username = p.User.Username,
                    DisplayName = p.User.DisplayName,
                    AvatarUrl = p.User.AvatarUrl
                },
                LikeCount = p.LikeCount,
                CommentCount = p.CommentCount,
                SaveCount = p.SaveCount,
                CreatedAt = p.CreatedAt,
                IsLikedByMe = userId != null && p.Likes.Any(l => l.UserId == userId),
                IsSavedByMe = userId != null && p.Saves.Any(s => s.UserId == userId),
            })
            .ToListAsync(ct);

        return new PagedResult<PostListItemDto>
        {
            Items = items,
            Page = q.Page,
            PageSize = q.PageSize,
            TotalCount = total
        };
    }

    private static PagedResult<PostListItemDto> Empty(FeedQuery q) => new()
    {
        Items = Array.Empty<PostListItemDto>(),
        Page = q.Page,
        PageSize = q.PageSize,
        TotalCount = 0
    };
}
