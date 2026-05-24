using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Therapp.Api.Extensions;
using Therapp.Application.Notifications;

namespace Therapp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationsController(INotificationService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _svc.ListAsync(page, pageSize, ct));

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount(CancellationToken ct)
        => Ok(new { count = await _svc.GetUnreadCountAsync(ct) });

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> Read(Guid id, CancellationToken ct)
        => (await _svc.MarkReadAsync(id, ct)).ToActionResult();

    [HttpPost("read-all")]
    public async Task<IActionResult> ReadAll(CancellationToken ct)
        => (await _svc.MarkAllReadAsync(ct)).ToActionResult();
}
