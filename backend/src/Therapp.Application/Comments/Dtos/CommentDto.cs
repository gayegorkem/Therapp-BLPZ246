namespace Therapp.Application.Comments.Dtos;

public class CommentAuthorDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = null!;
    public CommentAuthorDto Author { get; set; } = null!;
    public int LikeCount { get; set; }
    public int ReplyCount { get; set; }
    public bool IsLikedByMe { get; set; }
    public bool IsMine { get; set; }
    public DateTime CreatedAt { get; set; }
}
