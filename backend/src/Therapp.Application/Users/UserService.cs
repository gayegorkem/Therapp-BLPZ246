using Microsoft.EntityFrameworkCore;
using Therapp.Application.Abstractions;
using Therapp.Application.Common;
using Therapp.Application.Users.Dtos;

namespace Therapp.Application.Users;

public class UserService : IUserService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _current;

    public UserService(IAppDbContext db, ICurrentUser current)
    {
        _db = db;
        _current = current;
    }

    public async Task<Result<UserMeDto>> GetMeAsync(CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result<UserMeDto>.Fail(Errors.Unauthorized);

        var dto = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserMeDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                DisplayName = u.DisplayName,
                AvatarUrl = u.AvatarUrl,
                Bio = u.Bio,
                Role = (int)u.Role,
                CreatedAt = u.CreatedAt,
                PostCount = u.Posts.Count(p => !p.IsHidden && p.DeletedAt == null),
                SavedCount = _db.SavedPosts.Count(s => s.UserId == u.Id)
            })
            .FirstOrDefaultAsync(ct);

        return dto is null
            ? Result<UserMeDto>.Fail(Errors.NotFound("Kullanıcı"))
            : Result<UserMeDto>.Ok(dto);
    }

    public async Task<Result<UserMeDto>> UpdateMeAsync(UpdateProfileDto dto, CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result<UserMeDto>.Fail(Errors.Unauthorized);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return Result<UserMeDto>.Fail(Errors.NotFound("Kullanıcı"));

        user.DisplayName = dto.DisplayName.Trim();
        user.Bio = string.IsNullOrWhiteSpace(dto.Bio) ? null : dto.Bio.Trim();
        user.AvatarUrl = string.IsNullOrWhiteSpace(dto.AvatarUrl) ? null : dto.AvatarUrl.Trim();

        await _db.SaveChangesAsync(ct);
        return await GetMeAsync(ct);
    }

    public async Task<Result> DeleteMeAsync(CancellationToken ct)
    {
        var userId = _current.UserId;
        if (userId is null) return Result.Fail(Errors.Unauthorized);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return Result.Fail(Errors.NotFound("Kullanıcı"));

        // Soft delete + anonymize
        user.DeletedAt = DateTime.UtcNow;
        user.DisplayName = "Silinmiş Kullanıcı";
        user.Bio = null;
        user.AvatarUrl = null;

        // Revoke all refresh tokens
        var tokens = await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(ct);
        foreach (var t in tokens) t.RevokedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Ok();
    }

    public async Task<Result<UserProfileDto>> GetByUsernameAsync(string username, CancellationToken ct)
    {
        var normalized = username.Trim().ToLowerInvariant();
        var dto = await _db.Users
            .Where(u => u.Username == normalized)
            .Select(u => new UserProfileDto
            {
                Id = u.Id,
                Username = u.Username,
                DisplayName = u.DisplayName,
                AvatarUrl = u.AvatarUrl,
                Bio = u.Bio,
                CreatedAt = u.CreatedAt,
                PostCount = u.Posts.Count(p => !p.IsHidden && !p.IsAnonymous && p.DeletedAt == null)
            })
            .FirstOrDefaultAsync(ct);

        return dto is null
            ? Result<UserProfileDto>.Fail(Errors.NotFound("Kullanıcı"))
            : Result<UserProfileDto>.Ok(dto);
    }
}
