namespace Therapp.Application.Users.Dtos;

public class UserMeDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PostCount { get; set; }
    public int SavedCount { get; set; }
}

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; }
    public int PostCount { get; set; }
}

public class UpdateProfileDto
{
    public string DisplayName { get; set; } = null!;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}
