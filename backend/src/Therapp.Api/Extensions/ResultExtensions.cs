using Microsoft.AspNetCore.Mvc;
using Therapp.Application.Common;

namespace Therapp.Api.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.Success) return new OkObjectResult(result.Value);
        var err = result.Error!;
        return new ObjectResult(new { code = err.Code, message = err.Message })
        {
            StatusCode = err.StatusCode
        };
    }

    public static IActionResult ToActionResult(this Result result)
    {
        if (result.Success) return new NoContentResult();
        var err = result.Error!;
        return new ObjectResult(new { code = err.Code, message = err.Message })
        {
            StatusCode = err.StatusCode
        };
    }
}
