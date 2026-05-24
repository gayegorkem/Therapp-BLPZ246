using Microsoft.EntityFrameworkCore;
using Therapp.Application.Abstractions;
using Therapp.Application.Comments.Dtos;
using Therapp.Application.Common;
using Therapp.Application.Notifications;
using Therapp.Domain.Entities;
using Therapp.Domain.Enums;

namespace Therapp.Application.Comments;

public class CommentService : ICommentService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _current;
    private readonly INotificationService _notifier;

    public CommentService(IAppDbContext db, ICurrentUser current, INotificationService notifier)
    {
        _db = db;
        _current = current;
        _notifier = notifier;
    }

    // ---------- Reads ----------

    public async Task<PagedResult<CommentDto>> GetByPostAsync(Guid postId, PagedQuery q, CancellationToken ct)
    {
        var postExists = await _db.Posts.AnyAsync(p => p.Id == postId && !p.IsHidden, ct);
        if (!postExists) return Empty(q);

        var baseQuery = _db.Comments
            .Where(c => c.PostId == postId && c.ParentCommentId == null && !c.IsHidden)
            .OrderBy(c => c.CreatedAt);

        return await ProjectPagedAsync(baseQuery, q, ct);
    }

    public async Task<PagedResult<CommentDto>> GetRepliesAsync(Guid parentId, PagedQuery q, CancellationToken ct)
    {
        var baseQuery = _db.Comments
            .Where(c => c.ParentCommentId == parentId && !c.IsHidden)
            .OrderBy(c => c.CreatedAt);

        return await ProjectPagedAsync(baseQuery, q, ct);
    }

    // ---------- Writes ----------

    public async Task<Result<CommentDto>> CreateAsync(Guid postId, CreateCommentDto dto, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result<CommentDto>.Fail(Errors.Unauthorized);

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId && !p.IsHidden, ct);
        if (post is null) return Result<CommentDto>.Fail(Errors.NotFound("Gönderi"));

        var comment = new Comment
        {
            PostId = postId,
            UserId = userId.Value,
            Content = dto.Content.Trim()
        };
        _db.Comments.Add(comment);
        post.CommentCount += 1;
        await _db.SaveChangesAsync(ct);

        if (post.UserId != userId.Value)
        {
            await _notifier.CreateAsync(post.UserId, userId.Value, NotificationType.Comment, post.Id, comment.Id, null, ct);
        }

        return await LoadDtoAsync(comment.Id, ct);
    }

    public async Task<Result<CommentDto>> ReplyAsync(Guid parentId, CreateCommentDto dto, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result<CommentDto>.Fail(Errors.Unauthorized);

        var parent = await _db.Comments.FirstOrDefaultAsync(c => c.Id == parentId && !c.IsHidden, ct);
        if (parent is null) return Result<CommentDto>.Fail(Errors.NotFound("Yorum"));

        // Only one level of nesting in MVP
        if (parent.ParentCommentId != null)
            return Result<CommentDto>.Fail(Errors.Validation("Yanıta yanıt verilemez."));

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == parent.PostId && !p.IsHidden, ct);
        if (post is null) return Result<CommentDto>.Fail(Errors.NotFound("Gönderi"));

        var reply = new Comment
        {
            PostId = parent.PostId,
            UserId = userId.Value,
            ParentCommentId = parentId,
            Content = dto.Content.Trim()
        };
        _db.Comments.Add(reply);
        post.CommentCount += 1;
        await _db.SaveChangesAsync(ct);

        if (parent.UserId != userId.Value)
        {
            await _notifier.CreateAsync(parent.UserId, userId.Value, NotificationType.Reply, post.Id, reply.Id, null, ct);
        }

        return await LoadDtoAsync(reply.Id, ct);
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (comment is null) return Result.Fail(Errors.NotFound("Yorum"));

        var isOwner = comment.UserId == userId;
        var isMod = _current.IsInRole(nameof(UserRole.Moderator)) || _current.IsInRole(nameof(UserRole.Admin));
        if (!isOwner && !isMod) return Result.Fail(Errors.Forbidden);

        comment.DeletedAt = DateTime.UtcNow;

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == comment.PostId, ct);
        if (post is not null && post.CommentCount > 0) post.CommentCount -= 1;

        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result> LikeAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == id && !c.IsHidden, ct);
        if (comment is null) return Result.Fail(Errors.NotFound("Yorum"));

        var already = await _db.CommentLikes.AnyAsync(l => l.UserId == userId && l.CommentId == id, ct);
        if (already) return Result.Ok();

        _db.CommentLikes.Add(new CommentLike { UserId = userId.Value, CommentId = id });
        comment.LikeCount += 1;
        await _db.SaveChangesAsync(ct);

        if (comment.UserId != userId.Value)
        {
            await _notifier.CreateAsync(comment.UserId, userId.Value, NotificationType.CommentLike, comment.PostId, comment.Id, null, ct);
        }

        return Result.Ok();
    }

    public async Task<Result> UnlikeAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (comment is null) return Result.Fail(Errors.NotFound("Yorum"));

        var like = await _db.CommentLikes.FirstOrDefaultAsync(l => l.UserId == userId && l.CommentId == id, ct);
        if (like is null) return Result.Ok();

        _db.CommentLikes.Remove(like);
        if (comment.LikeCount > 0) comment.LikeCount -= 1;
        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    // ---------- Helpers ----------

    private async Task<Result<CommentDto>> LoadDtoAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        var dto = await _db.Comments
            .Where(c => c.Id == id)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                ParentCommentId = c.ParentCommentId,
                Content = c.Content,
                Author = new CommentAuthorDto
                {
                    Id = c.User.Id,
                    Username = c.User.Username,
                    DisplayName = c.User.DisplayName,
                    AvatarUrl = c.User.AvatarUrl
                },
                LikeCount = c.LikeCount,
                ReplyCount = c.Replies.Count(r => !r.IsHidden),
                IsLikedByMe = userId != null && c.Likes.Any(l => l.UserId == userId),
                IsMine = userId != null && c.UserId == userId,
                CreatedAt = c.CreatedAt
            })
            .FirstOrDefaultAsync(ct);

        return dto is null
            ? Result<CommentDto>.Fail(Errors.NotFound("Yorum"))
            : Result<CommentDto>.Ok(dto);
    }

    private async Task<PagedResult<CommentDto>> ProjectPagedAsync(
        IOrderedQueryable<Comment> baseQuery, PagedQuery q, CancellationToken ct)
    {
        var userId = _current.UserId;
        var total = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                PostId = c.PostId,
                ParentCommentId = c.ParentCommentId,
                Content = c.Content,
                Author = new CommentAuthorDto
                {
                    Id = c.User.Id,
                    Username = c.User.Username,
                    DisplayName = c.User.DisplayName,
                    AvatarUrl = c.User.AvatarUrl
                },
                LikeCount = c.LikeCount,
                ReplyCount = c.Replies.Count(r => !r.IsHidden),
                IsLikedByMe = userId != null && c.Likes.Any(l => l.UserId == userId),
                IsMine = userId != null && c.UserId == userId,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<CommentDto>
        {
            Items = items,
            Page = q.Page,
            PageSize = q.PageSize,
            TotalCount = total
        };
    }

    private static PagedResult<CommentDto> Empty(PagedQuery q) => new()
    {
        Items = Array.Empty<CommentDto>(),
        Page = q.Page,
        PageSize = q.PageSize,
        TotalCount = 0
    };
}
