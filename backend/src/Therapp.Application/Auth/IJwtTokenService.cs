using Therapp.Domain.Entities;

namespace Therapp.Application.Auth;

public interface IJwtTokenService
{
    string CreateAccessToken(User user);
    (string Raw, string Hash) CreateRefreshToken();
    string HashRefreshToken(string raw);
}
