using Therapp.Domain.Common;

namespace Therapp.Domain.Entities;

public class Post : SoftDeletableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsAnonymous { get; set; }

    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int SaveCount { get; set; }

    public bool IsHidden { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    public ICollection<SavedPost> Saves { get; set; } = new List<SavedPost>();
}
