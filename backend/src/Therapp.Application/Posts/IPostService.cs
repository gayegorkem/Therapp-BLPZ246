using Therapp.Application.Common;
using Therapp.Application.Posts.Dtos;

namespace Therapp.Application.Posts;

public interface IPostService
{
    Task<PagedResult<PostListItemDto>> GetFeedAsync(FeedQuery q, CancellationToken ct);
    Task<PagedResult<PostListItemDto>> GetByCategoryAsync(string slug, FeedQuery q, CancellationToken ct);
    Task<Result<PostDto>> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Result<PostDto>> CreateAsync(CreatePostDto dto, CancellationToken ct);
    Task<Result<PostDto>> UpdateAsync(Guid id, UpdatePostDto dto, CancellationToken ct);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct);
    Task<Result> LikeAsync(Guid id, CancellationToken ct);
    Task<Result> UnlikeAsync(Guid id, CancellationToken ct);
    Task<Result> SaveAsync(Guid id, CancellationToken ct);
    Task<Result> UnsaveAsync(Guid id, CancellationToken ct);
    Task<PagedResult<PostListItemDto>> GetMineAsync(FeedQuery q, CancellationToken ct);
    Task<PagedResult<PostListItemDto>> GetMySavedAsync(FeedQuery q, CancellationToken ct);
}
