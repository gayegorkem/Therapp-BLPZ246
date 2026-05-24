using Microsoft.EntityFrameworkCore;
using Therapp.Application.Abstractions;
using Therapp.Application.Common;
using Therapp.Application.Notifications.Dtos;
using Therapp.Domain.Entities;
using Therapp.Domain.Enums;

namespace Therapp.Application.Notifications;

public class NotificationService : INotificationService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _current;

    public NotificationService(IAppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    public async Task<PagedResult<NotificationDto>> ListAsync(int page, int pageSize, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Empty(page, pageSize);

        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 50 ? 20 : pageSize;

        var baseQuery = _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt);

        var total = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = (int)n.Type,
                Actor = n.Actor == null ? null : new NotificationActorDto
                {
                    Id = n.Actor.Id,
                    Username = n.Actor.Username,
                    DisplayName = n.Actor.DisplayName,
                    AvatarUrl = n.Actor.AvatarUrl
                },
                PostId = n.PostId,
                CommentId = n.CommentId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<NotificationDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        };
    }

    public async Task<int> GetUnreadCountAsync(CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return 0;
        return await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);
    }

    public async Task<Result> MarkReadAsync(Guid id, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var notif = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, ct);
        if (notif is null) return Result.Fail(Errors.NotFound("Bildirim"));
        if (!notif.IsRead)
        {
            notif.IsRead = true;
            await _db.SaveChangesAsync(ct);
        }
        return Result.Ok();
    }

    public async Task<Result> MarkAllReadAsync(CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var unread = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var n in unread) n.IsRead = true;
        if (unread.Count > 0) await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task CreateAsync(
        Guid recipientUserId,
        Guid? actorUserId,
        NotificationType type,
        Guid? postId,
        Guid? commentId,
        string? message,
        CancellationToken ct)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = recipientUserId,
            ActorUserId = actorUserId,
            Type = type,
            PostId = postId,
            CommentId = commentId,
            Message = message,
            IsRead = false
        });
        await _db.SaveChangesAsync(ct);
    }

    private static PagedResult<NotificationDto> Empty(int page, int pageSize) => new()
    {
        Items = Array.Empty<NotificationDto>(),
        Page = page < 1 ? 1 : page,
        PageSize = pageSize < 1 ? 20 : pageSize,
        TotalCount = 0
    };
}
