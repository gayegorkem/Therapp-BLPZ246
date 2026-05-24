using Therapp.Application.Categories.Dtos;

namespace Therapp.Application.Categories;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> ListAsync(CancellationToken ct);
    Task<CategoryDto?> GetBySlugAsync(string slug, CancellationToken ct);
}
