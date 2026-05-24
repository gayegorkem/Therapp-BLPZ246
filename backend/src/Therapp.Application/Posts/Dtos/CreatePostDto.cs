namespace Therapp.Application.Posts.Dtos;

public class CreatePostDto
{
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsAnonymous { get; set; }
}
