using Therapp.Application.Common;
using Therapp.Application.Users.Dtos;

namespace Therapp.Application.Users;

public interface IUserService
{
    Task<Result<UserMeDto>> GetMeAsync(CancellationToken ct);
    Task<Result<UserMeDto>> UpdateMeAsync(UpdateProfileDto dto, CancellationToken ct);
    Task<Result> DeleteMeAsync(CancellationToken ct);
    Task<Result<UserProfileDto>> GetByUsernameAsync(string username, CancellationToken ct);
}
