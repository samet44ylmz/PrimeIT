using MediatR;
using Microsoft.AspNetCore.Identity;
using PrimeITServer.Domain.Entities;
using TS.Result;

namespace PrimeITServer.Application.Features.Auth.Register;

internal sealed class RegisterCommandHandler(
    UserManager<AppUser> userManager) : IRequestHandler<RegisterCommand, Result<string>>
{
    public async Task<Result<string>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Validate role
        if (request.Role != "Employer" && request.Role != "JobSeeker")
        {
            return (500, "Geçersiz rol. 'Employer' veya 'JobSeeker' olmalıdır.");
        }

        // Check if user already exists
        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return (500, "Bu e-posta adresi zaten kayıtlı.");
        }

        var existingUserName = await userManager.FindByNameAsync(request.UserName);
        if (existingUserName is not null)
        {
            return (500, "Bu kullanıcı adı zaten kullanılıyor.");
        }

        AppUser user = new()
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            UserName = request.UserName,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return (500, string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        var roleResult = await userManager.AddToRoleAsync(user, request.Role);

        if (!roleResult.Succeeded)
        {
            return (500, "Kullanıcı oluşturuldu fakat rol atanamadı: " + string.Join(", ", roleResult.Errors.Select(e => e.Description)));
        }

        return "Kayıt başarılı!";
    }
}
