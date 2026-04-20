using PrimeITServer.Application.Features.Auth.Login;
using PrimeITServer.Domain.Entities;

namespace PrimeITServer.Application.Services
{
    public interface IJwtProvider
    {
        Task<LoginCommandResponse> CreateToken(AppUser user);
    }
}
