using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Therapp.Api.Extensions;
using Therapp.Application.Users;
using Therapp.Application.Users.Dtos;

namespace Therapp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _svc;
    public UsersController(IUserService svc) => _svc = svc;

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
        => (await _svc.GetMeAsync(ct)).ToActionResult();

    [HttpPatch("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto, CancellationToken ct)
        => (await _svc.UpdateMeAsync(dto, ct)).ToActionResult();

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe(CancellationToken ct)
        => (await _svc.DeleteMeAsync(ct)).ToActionResult();

    [HttpGet("{username}")]
    public async Task<IActionResult> ByUsername(string username, CancellationToken ct)
        => (await _svc.GetByUsernameAsync(username, ct)).ToActionResult();
}
