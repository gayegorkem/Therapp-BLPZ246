namespace Therapp.Application.Common;

public record Error(string Code, string Message, int StatusCode = 400);
