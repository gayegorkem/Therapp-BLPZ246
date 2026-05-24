using Therapp.Domain.Common;

namespace Therapp.Domain.Entities;

public class CommentLike : IHasCreatedAt
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CommentId { get; set; }
    public Comment Comment { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
