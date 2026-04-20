using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using PrimeITServer.Infrastructure.Context;
using GenericRepository;

namespace PrimeITServer.Infrastructure.Repositories;

internal sealed class NotificationRepository : Repository<Notification, ApplicationDbContext>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
    }
}
