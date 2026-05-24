using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Therapp.Api.Extensions;
using Therapp.Application.Posts;
using Therapp.Application.Posts.Dtos;

namespace Therapp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/posts")]
public class PostsController : ControllerBase
{
    private readonly IPostService _svc;
    public PostsController(IPostService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> Feed([FromQuery] FeedQuery q, CancellationToken ct)
        => Ok(await _svc.GetFeedAsync(q, ct));

    [HttpGet("category/{slug}")]
    public async Task<IActionResult> ByCategory(string slug, [FromQuery] FeedQuery q, CancellationToken ct)
        => Ok(await _svc.GetByCategoryAsync(slug, q, ct));

    [HttpGet("me")]
    public async Task<IActionResult> Mine([FromQuery] FeedQuery q, CancellationToken ct)
        => Ok(await _svc.GetMineAsync(q, ct));

    [HttpGet("me/saved")]
    public async Task<IActionResult> MySaved([FromQuery] FeedQuery q, CancellationToken ct)
        => Ok(await _svc.GetMySavedAsync(q, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => (await _svc.GetByIdAsync(id, ct)).ToActionResult();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePostDto dto, CancellationToken ct)
        => (await _svc.CreateAsync(dto, ct)).ToActionResult();

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePostDto dto, CancellationToken ct)
        => (await _svc.UpdateAsync(id, dto, ct)).ToActionResult();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        => (await _svc.DeleteAsync(id, ct)).ToActionResult();

    [HttpPost("{id:guid}/like")]
    public async Task<IActionResult> Like(Guid id, CancellationToken ct)
        => (await _svc.LikeAsync(id, ct)).ToActionResult();

    [HttpDelete("{id:guid}/like")]
    public async Task<IActionResult> Unlike(Guid id, CancellationToken ct)
        => (await _svc.UnlikeAsync(id, ct)).ToActionResult();

    [HttpPost("{id:guid}/save")]
    public async Task<IActionResult> Save(Guid id, CancellationToken ct)
        => (await _svc.SaveAsync(id, ct)).ToActionResult();

    [HttpDelete("{id:guid}/save")]
    public async Task<IActionResult> Unsave(Guid id, CancellationToken ct)
        => (await _svc.UnsaveAsync(id, ct)).ToActionResult();
}
