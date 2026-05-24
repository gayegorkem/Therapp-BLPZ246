using System.Text.Json;
using FluentValidation;

namespace Therapp.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _log;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> log)
    {
        _next = next;
        _log = log;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (ValidationException vex)
        {
            ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
            ctx.Response.ContentType = "application/json";
            var errors = vex.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage });
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                code = "VALIDATION_ERROR",
                message = "Geçersiz veri gönderdiniz.",
                errors
            }));
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unhandled exception");
            ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                code = "INTERNAL_ERROR",
                message = "Bir hata oluştu, lütfen tekrar deneyin."
            }));
        }
    }
}
