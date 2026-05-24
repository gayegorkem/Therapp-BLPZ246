using Therapp.Application.Common;
using Therapp.Application.Notifications.Dtos;
using Therapp.Domain.Enums;

namespace Therapp.Application.Notifications;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> ListAsync(int page, int pageSize, CancellationToken ct);
    Task<int> GetUnreadCountAsync(CancellationToken ct);
    Task<Result> MarkReadAsync(Guid id, CancellationToken ct);
    Task<Result> MarkAllReadAsync(CancellationToken ct);

    // Called by other services
    Task CreateAsync(
        Guid recipientUserId,
        Guid? actorUserId,
        NotificationType type,
        Guid? postId,
        Guid? commentId,
        string? message,
        CancellationToken ct);
}
