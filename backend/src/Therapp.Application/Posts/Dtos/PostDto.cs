namespace Therapp.Application.Posts.Dtos;

public class PostAuthorDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
}

public class PostCategoryDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Color { get; set; } = null!;
    public string Icon { get; set; } = null!;
}

public class PostListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Excerpt { get; set; } = null!;
    public bool IsAnonymous { get; set; }
    public PostCategoryDto Category { get; set; } = null!;
    public PostAuthorDto? Author { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int SaveCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsLikedByMe { get; set; }
    public bool IsSavedByMe { get; set; }
}

public class PostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsAnonymous { get; set; }
    public PostCategoryDto Category { get; set; } = null!;
    public PostAuthorDto? Author { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int SaveCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsLikedByMe { get; set; }
    public bool IsSavedByMe { get; set; }
    public bool IsMine { get; set; }
}
