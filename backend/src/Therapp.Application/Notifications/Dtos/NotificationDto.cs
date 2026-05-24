namespace Therapp.Application.Notifications.Dtos;

public class NotificationActorDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public int Type { get; set; }
    public NotificationActorDto? Actor { get; set; }
    public Guid? PostId { get; set; }
    public Guid? CommentId { get; set; }
    public string? Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
