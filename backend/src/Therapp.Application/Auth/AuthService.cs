using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Therapp.Application.Abstractions;
using Therapp.Application.Auth.Dtos;
using Therapp.Application.Common;
using Therapp.Domain.Entities;

namespace Therapp.Application.Auth;

public class AuthService : IAuthService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly JwtOptions _opt;

    public AuthService(
        IAppDbContext db,
        IPasswordHasher hasher,
        IJwtTokenService jwt,
        IOptions<JwtOptions> opt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
        _opt = opt.Value;
    }

    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken ct)
    {
        var username = dto.Username.Trim().ToLowerInvariant();
        var email = dto.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Username == username, ct))
            return Result<AuthResponseDto>.Fail(Errors.UsernameTaken);
        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            return Result<AuthResponseDto>.Fail(Errors.EmailTaken);

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = _hasher.Hash(dto.Password),
            DisplayName = dto.DisplayName.Trim(),
            AcceptedDisclaimerAt = DateTime.UtcNow
        };
        _db.Users.Add(user);

        var response = IssueTokens(user);
        await _db.SaveChangesAsync(ct);
        return Result<AuthResponseDto>.Ok(response);
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, CancellationToken ct)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is null || !_hasher.Verify(dto.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Fail(Errors.InvalidCredentials);
        if (user.IsBanned)
            return Result<AuthResponseDto>.Fail(Errors.UserBanned);

        var response = IssueTokens(user);
        await _db.SaveChangesAsync(ct);
        return Result<AuthResponseDto>.Ok(response);
    }

    public async Task<Result<AuthResponseDto>> RefreshAsync(string refreshToken, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return Result<AuthResponseDto>.Fail(Errors.InvalidRefreshToken);

        var hash = _jwt.HashRefreshToken(refreshToken);
        var existing = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == hash, ct);

        if (existing is null || existing.RevokedAt != null || existing.ExpiresAt <= DateTime.UtcNow)
            return Result<AuthResponseDto>.Fail(Errors.InvalidRefreshToken);
        if (existing.User.IsBanned)
            return Result<AuthResponseDto>.Fail(Errors.UserBanned);

        existing.RevokedAt = DateTime.UtcNow;
        var response = IssueTokens(existing.User);
        await _db.SaveChangesAsync(ct);
        return Result<AuthResponseDto>.Ok(response);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(refreshToken)) return;
        var hash = _jwt.HashRefreshToken(refreshToken);
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash, ct);
        if (token is not null && token.RevokedAt is null)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    private AuthResponseDto IssueTokens(User user)
    {
        var access = _jwt.CreateAccessToken(user);
        var (raw, hash) = _jwt.CreateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddDays(_opt.RefreshTokenDays);

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = expiresAt
        });

        return new AuthResponseDto
        {
            AccessToken = access,
            RefreshToken = raw,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(_opt.AccessTokenMinutes),
            User = new AuthUserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                Role = (int)user.Role
            }
        };
    }
}
