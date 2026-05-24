namespace Therapp.Application.Categories.Dtos;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public string Color { get; set; } = null!;
    public int OrderIndex { get; set; }
    public int PostCount { get; set; }
}
