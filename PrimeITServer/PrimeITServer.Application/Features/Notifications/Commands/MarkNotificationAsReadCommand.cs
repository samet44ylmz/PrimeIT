using MediatR;
using Microsoft.EntityFrameworkCore;
using PrimeITServer.Domain.Repositories;
using GenericRepository;
using TS.Result;

namespace PrimeITServer.Application.Features.Notifications.Commands;

public sealed record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result<string>>;

public sealed class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, Result<string>>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkNotificationAsReadCommandHandler(INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _notificationRepository.Where(n => n.Id == request.NotificationId).FirstOrDefaultAsync(cancellationToken);
        if (notification == null) return (404, "Bildirim bulunamadı.");

        notification.IsRead = true;
        _notificationRepository.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return "Bildirim okundu olarak işaretlendi.";
    }
}
