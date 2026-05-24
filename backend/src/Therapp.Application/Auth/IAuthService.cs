using Therapp.Application.Auth.Dtos;
using Therapp.Application.Common;

namespace Therapp.Application.Auth;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken ct);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, CancellationToken ct);
    Task<Result<AuthResponseDto>> RefreshAsync(string refreshToken, CancellationToken ct);
    Task LogoutAsync(string refreshToken, CancellationToken ct);
}
