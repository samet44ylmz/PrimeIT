using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using TS.Result;

namespace PrimeITServer.Application.Features.Notifications.Queries;

public sealed record GetMyNotificationsQuery(Guid UserId) : IRequest<Result<List<Notification>>>;

public sealed class GetMyNotificationsQueryHandler : IRequestHandler<GetMyNotificationsQuery, Result<List<Notification>>>
{
    private readonly INotificationRepository _notificationRepository;

    public GetMyNotificationsQueryHandler(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<Result<List<Notification>>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _notificationRepository
            .Where(n => n.AppUserId == request.UserId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);

        return notifications;
    }
}
