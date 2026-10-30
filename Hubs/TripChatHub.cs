using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.Models;

namespace SonicBuss.Hubs;

[Authorize]
public class TripChatHub(AppDbContext db) : Hub
{
    public async Task JoinTrip(int tripId)
    {
        var userId = GetUserId();

        if (userId is null)
            throw new HubException("غير مصرح لك.");

        var isAdmin = Context.User!.IsInRole(UserRole.Admin.ToString());

        if (!isAdmin)
        {
            var hasBooking = await db.Bookings.AnyAsync(b =>
                b.TripId == tripId &&
                b.UserId == userId.Value &&
                b.Status == BookingStatus.Confirmed);

            if (!hasBooking)
                throw new HubException("أنت غير مسجل في هذه الرحلة.");
        }

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            GetTripGroup(tripId));
    }

    public async Task LeaveTrip(int tripId)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            GetTripGroup(tripId));
    }

    public async Task SendMessage(int tripId, string message)
    {
        var userId = GetUserId();

        if (userId is null)
            throw new HubException("غير مصرح لك.");

        if (string.IsNullOrWhiteSpace(message))
            throw new HubException("اكتب رسالة أولًا.");

        var isAdmin = Context.User!.IsInRole(UserRole.Admin.ToString());

        if (!isAdmin)
        {
            var hasBooking = await db.Bookings.AnyAsync(b =>
                b.TripId == tripId &&
                b.UserId == userId.Value &&
                b.Status == BookingStatus.Confirmed);

            if (!hasBooking)
                throw new HubException("أنت غير مسجل في هذه الرحلة.");
        }

        var tripExists = await db.Trips
            .AnyAsync(t => t.Id == tripId);

        if (!tripExists)
            throw new HubException("الرحلة غير موجودة.");

        var tripMessage = new TripMessage
        {
            TripId = tripId,
            UserId = userId.Value,
            Message = message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        db.TripMessages.Add(tripMessage);
        await db.SaveChangesAsync();

        var user = await db.Users
            .Where(u => u.Id == userId.Value)
            .Select(u => new
            {
                u.Id,
                u.Name,
                Role = u.Role.ToString()
            })
            .FirstAsync();

        await Clients
            .Group(GetTripGroup(tripId))
            .SendAsync(
                "ReceiveMessage",
                new
                {
                    id = tripMessage.Id,
                    tripId,
                    userId = user.Id,
                    userName = user.Name,
                    role = user.Role,
                    message = tripMessage.Message,
                    createdAt = tripMessage.CreatedAt
                });
    }

    private int? GetUserId()
    {
        var claim = Context.User?.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier);

        if (claim is null)
            return null;

        return int.TryParse(claim.Value, out var userId)
            ? userId
            : null;
    }

    private static string GetTripGroup(int tripId)
    {
        return $"trip-{tripId}";
    }
}