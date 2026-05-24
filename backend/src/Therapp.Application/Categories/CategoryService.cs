using Microsoft.EntityFrameworkCore;
using Therapp.Application.Abstractions;
using Therapp.Application.Categories.Dtos;

namespace Therapp.Application.Categories;

public class CategoryService : ICategoryService
{
    private readonly IAppDbContext _db;
    public CategoryService(IAppDbContext db) => _db = db;

    public async Task<IReadOnlyList<CategoryDto>> ListAsync(CancellationToken ct) =>
        await _db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.OrderIndex)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Slug = c.Slug,
                Name = c.Name,
                Description = c.Description,
                Icon = c.Icon,
                Color = c.Color,
                OrderIndex = c.OrderIndex,
                PostCount = c.Posts.Count(p => !p.IsHidden)
            })
            .ToListAsync(ct);

    public async Task<CategoryDto?> GetBySlugAsync(string slug, CancellationToken ct) =>
        await _db.Categories
            .Where(c => c.Slug == slug && c.IsActive)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Slug = c.Slug,
                Name = c.Name,
                Description = c.Description,
                Icon = c.Icon,
                Color = c.Color,
                OrderIndex = c.OrderIndex,
                PostCount = c.Posts.Count(p => !p.IsHidden)
            })
            .FirstOrDefaultAsync(ct);
}
