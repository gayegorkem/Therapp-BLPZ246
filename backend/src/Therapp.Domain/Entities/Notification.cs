using Therapp.Domain.Common;
using Therapp.Domain.Enums;

namespace Therapp.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? ActorUserId { get; set; }
    public User? Actor { get; set; }

    public NotificationType Type { get; set; }

    public Guid? PostId { get; set; }
    public Guid? CommentId { get; set; }

    public string? Message { get; set; }
    public bool IsRead { get; set; }
}
