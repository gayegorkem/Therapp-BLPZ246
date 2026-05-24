using Therapp.Application.Comments.Dtos;
using Therapp.Application.Common;

namespace Therapp.Application.Comments;

public interface ICommentService
{
    Task<PagedResult<CommentDto>> GetByPostAsync(Guid postId, PagedQuery q, CancellationToken ct);
    Task<PagedResult<CommentDto>> GetRepliesAsync(Guid parentId, PagedQuery q, CancellationToken ct);
    Task<Result<CommentDto>> CreateAsync(Guid postId, CreateCommentDto dto, CancellationToken ct);
    Task<Result<CommentDto>> ReplyAsync(Guid parentId, CreateCommentDto dto, CancellationToken ct);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct);
    Task<Result> LikeAsync(Guid id, CancellationToken ct);
    Task<Result> UnlikeAsync(Guid id, CancellationToken ct);
}
