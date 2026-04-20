using MediatR;
using Microsoft.EntityFrameworkCore;
using GenericRepository;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Domain.Repositories;
using System.Text.Json.Serialization;
using TS.Result;

namespace PrimeITServer.Application.Features.Applications.Commands;

public sealed record UpdateApplicationStatusCommand(
    [property: JsonPropertyName("applicationId")] Guid ApplicationId,
    [property: JsonPropertyName("newStatus")] string NewStatus,
    [property: JsonPropertyName("message")] string? Message) : IRequest<Result<string>>;

public sealed class UpdateApplicationStatusCommandHandler : IRequestHandler<UpdateApplicationStatusCommand, Result<string>>
{
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicationStatusCommandHandler(
        IJobApplicationRepository applicationRepository,
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork)
    {
        _applicationRepository = applicationRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(UpdateApplicationStatusCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository
            .Where(a => a.Id == request.ApplicationId)
            .FirstOrDefaultAsync(cancellationToken);

        if (application is null)
        {
            return (404, "Başvuru bulunamadı.");
        }

        application.Status = request.NewStatus;
        application.EmployerMessage = request.Message;

        // Create Notification for the Candidate
        var notification = new Notification
        {
            AppUserId = application.UserId,
            Type = "StatusUpdate",
            Message = string.IsNullOrWhiteSpace(request.Message) 
                ? "Başvurunuzda yeni bir gelişme (durum güncellemesi) var." 
                : request.Message,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _notificationRepository.Add(notification);
        _applicationRepository.Update(application);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return $"Başvuru durumu başarıyla '{request.NewStatus}' olarak güncellendi.";
    }
}
