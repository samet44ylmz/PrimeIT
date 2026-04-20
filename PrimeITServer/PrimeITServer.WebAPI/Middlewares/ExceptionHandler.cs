using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using TS.Result;

namespace PrimeITServer.WebAPI.Middlewares
{
    public class ExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            Result<string> errorResult;

            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = 500;

            if (exception.GetType() == typeof(ValidationException))
            {
                httpContext.Response.StatusCode = 403;

                errorResult = Result<string>.Failure(403, ((ValidationException)exception).Errors.Select(s => s.PropertyName).ToList());

                await httpContext.Response.WriteAsync(JsonSerializer.Serialize(errorResult));

                return true;
            }

            var message = exception.Message;
            if (exception.InnerException != null)
            {
                message += " Details: " + exception.InnerException.Message;
            }

            errorResult = Result<string>.Failure(message);

            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(errorResult));

            return true;
        }
    }
}
