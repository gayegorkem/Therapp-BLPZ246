using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Therapp.Api.Extensions;
using Therapp.Application.Comments;
using Therapp.Application.Comments.Dtos;
using Therapp.Application.Common;

namespace Therapp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _svc;
    public CommentsController(ICommentService svc) => _svc = svc;

    [HttpGet("posts/{postId:guid}/comments")]
    public async Task<IActionResult> ByPost(Guid postId, [FromQuery] PagedQuery q, CancellationToken ct)
        => Ok(await _svc.GetByPostAsync(postId, q, ct));

    [HttpGet("comments/{id:guid}/replies")]
    public async Task<IActionResult> Replies(Guid id, [FromQuery] PagedQuery q, CancellationToken ct)
        => Ok(await _svc.GetRepliesAsync(id, q, ct));

    [HttpPost("posts/{postId:guid}/comments")]
    public async Task<IActionResult> Create(Guid postId, [FromBody] CreateCommentDto dto, CancellationToken ct)
        => (await _svc.CreateAsync(postId, dto, ct)).ToActionResult();

    [HttpPost("comments/{id:guid}/replies")]
    public async Task<IActionResult> Reply(Guid id, [FromBody] CreateCommentDto dto, CancellationToken ct)
        => (await _svc.ReplyAsync(id, dto, ct)).ToActionResult();

    [HttpDelete("comments/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        => (await _svc.DeleteAsync(id, ct)).ToActionResult();

    [HttpPost("comments/{id:guid}/like")]
    public async Task<IActionResult> Like(Guid id, CancellationToken ct)
        => (await _svc.LikeAsync(id, ct)).ToActionResult();

    [HttpDelete("comments/{id:guid}/like")]
    public async Task<IActionResult> Unlike(Guid id, CancellationToken ct)
        => (await _svc.UnlikeAsync(id, ct)).ToActionResult();
}
