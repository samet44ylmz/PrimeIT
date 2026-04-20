using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrimeITServer.Application.Features.Notifications.Commands;
using PrimeITServer.Application.Features.Notifications.Queries;
using PrimeITServer.WebAPI.Abstractions;
using System.Security.Claims;

namespace PrimeITServer.WebAPI.Controllers;

[Route("api/[controller]")]
[Authorize]
public sealed class NotificationsController : ApiController
{
    public NotificationsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());
        var response = await _mediator.Send(new GetMyNotificationsQuery(userId), cancellationToken);
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("{id}/mark-as-read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(new MarkNotificationAsReadCommand(id), cancellationToken);
        return StatusCode(response.StatusCode, response);
    }
}
