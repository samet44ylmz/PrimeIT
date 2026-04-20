using Microsoft.AspNetCore.Identity;
using PrimeITServer.Domain.Entities;

namespace PrimeITServer.WebAPI.Middlewares
{
    public static class ExtensionsMiddleware
    {
        public static async Task CreateFirstUser(WebApplication app)
        {
            using (var scoped = app.Services.CreateScope())
            {
                var roleManager = scoped.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
                var userManager = scoped.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

                // Seed roles
                string[] roles = { "Employer", "JobSeeker" };
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new IdentityRole<Guid> { Name = role });
                    }
                }

                if (!userManager.Users.Any(p => p.UserName == "admin"))
                {
                    AppUser user = new()
                    {
                        UserName = "admin",
                        Email = "admin@admin.com",
                        FirstName = "Samet",
                        LastName = "Yılmaz",
                        EmailConfirmed = true
                    };

                    await userManager.CreateAsync(user, "1");
                    await userManager.AddToRoleAsync(user, "Employer");
                }
            }
        }
    }
}
