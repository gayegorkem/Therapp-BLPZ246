namespace Therapp.Application.Common;

public static class Errors
{
    public static Error UsernameTaken      => new("USERNAME_TAKEN", "Bu kullanıcı adı zaten alınmış.", 409);
    public static Error EmailTaken         => new("EMAIL_TAKEN", "Bu e-posta zaten kayıtlı.", 409);
    public static Error InvalidCredentials => new("INVALID_CREDENTIALS", "E-posta veya şifre hatalı.", 401);
    public static Error UserBanned         => new("USER_BANNED", "Hesabınız askıya alınmış.", 403);
    public static Error InvalidRefreshToken => new("INVALID_REFRESH_TOKEN", "Oturum süresi doldu, lütfen tekrar giriş yapın.", 401);
    public static Error Unauthorized       => new("UNAUTHORIZED", "Bu işlem için giriş yapmalısınız.", 401);
    public static Error Forbidden          => new("FORBIDDEN", "Bu işlem için yetkiniz yok.", 403);
    public static Error NotFound(string what) => new("NOT_FOUND", $"{what} bulunamadı.", 404);
    public static Error Validation(string msg) => new("VALIDATION_ERROR", msg, 400);
    public static Error Conflict(string msg)   => new("CONFLICT", msg, 409);
}
