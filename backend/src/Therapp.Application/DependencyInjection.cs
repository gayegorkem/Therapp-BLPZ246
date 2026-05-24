using Microsoft.Extensions.DependencyInjection;
using Therapp.Application.Auth;
using Therapp.Application.Categories;
using Therapp.Application.Comments;
using Therapp.Application.Notifications;
using Therapp.Application.Posts;
using Therapp.Application.Reports;
using Therapp.Application.Users;

namespace Therapp.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IPostService, PostService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
