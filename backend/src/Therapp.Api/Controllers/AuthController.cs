using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Therapp.Api.Extensions;
using Therapp.Application.Auth;
using Therapp.Application.Auth.Dtos;

namespace Therapp.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken ct)
        => (await _auth.RegisterAsync(dto, ct)).ToActionResult();

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
        => (await _auth.LoginAsync(dto, ct)).ToActionResult();

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto, CancellationToken ct)
        => (await _auth.RefreshAsync(dto.RefreshToken, ct)).ToActionResult();

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto dto, CancellationToken ct)
    {
        await _auth.LogoutAsync(dto.RefreshToken, ct);
        return NoContent();
    }
}
