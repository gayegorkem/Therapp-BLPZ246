using Therapp.Domain.Common;

namespace Therapp.Domain.Entities;

public class Category : BaseEntity
{
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public string Color { get; set; } = null!;
    public int OrderIndex { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Post> Posts { get; set; } = new List<Post>();
}
