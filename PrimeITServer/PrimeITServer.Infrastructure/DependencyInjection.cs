using System.Reflection;
using GenericRepository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Infrastructure.Context;
using PrimeITServer.Infrastructure.Options;
using PrimeITServer.Application.Services;
using PrimeITServer.Infrastructure.Services;
using Scrutor;

namespace PrimeITServer.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(configuration.GetConnectionString("PostgreSQL"));
            });

            services.AddScoped<IUnitOfWork>(srv => srv.GetRequiredService<ApplicationDbContext>());

            services
                .AddIdentity<AppUser, IdentityRole<Guid>>(cfr =>
                {
                    cfr.Password.RequiredLength = 1;
                    cfr.Password.RequireNonAlphanumeric = false;
                    cfr.Password.RequireUppercase = false;
                    cfr.Password.RequireLowercase = false;
                    cfr.Password.RequireDigit = false;
                    cfr.SignIn.RequireConfirmedEmail = false;
                    cfr.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                    cfr.Lockout.MaxFailedAccessAttempts = 3;
                    cfr.Lockout.AllowedForNewUsers = true;
                })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.Configure<JwtOptions>(configuration.GetSection("Jwt"));
            services.Configure<MongoDbOptions>(configuration.GetSection("MongoDbOptions"));
            services.ConfigureOptions<JwtTokenOptionsSetup>();
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer();
            services.AddAuthorization();

            services.AddSingleton<Nest.IElasticClient>(sp =>
            {
                var url = configuration["Elasticsearch:Url"] ?? "http://localhost:9200";
                var settings = new Nest.ConnectionSettings(new Uri(url))
                    .DefaultIndex("jobs");
                return new Nest.ElasticClient(settings);
            });

            services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(sp =>
                StackExchange.Redis.ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis") ?? "localhost:6379"));

            services.Scan(action =>
            {
                action
                .FromAssemblies(Assembly.GetExecutingAssembly())
                .AddClasses(publicOnly: false)
                .UsingRegistrationStrategy(RegistrationStrategy.Skip)
                .AsMatchingInterface()
                .AsImplementedInterfaces()
                .WithScopedLifetime();
            });


            services.AddHttpClient();
            services.AddScoped<IAiService, GroqAiService>();

            services.AddHealthChecks()
            .AddCheck("health-check", () => HealthCheckResult.Healthy())
            .AddDbContextCheck<ApplicationDbContext>()
            .AddElasticsearch(configuration["Elasticsearch:Url"] ?? "http://localhost:9200")
            ;

            return services;
        }
    }
}
