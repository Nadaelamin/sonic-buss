using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.Models;

namespace SonicBuss.Controllers;

[ApiController]
[Route("api/trips/{tripId}/messages")]
[Authorize]
public class TripMessagesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMessages(int tripId)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        var isAdmin = User.IsInRole(UserRole.Admin.ToString());

        if (!isAdmin)
        {
            var hasBooking = await db.Bookings.AnyAsync(b =>
                b.TripId == tripId &&
                b.UserId == userId.Value &&
                b.Status == BookingStatus.Confirmed);

            if (!hasBooking)
            {
                return Forbid();
            }
        }

        var messages = await db.TripMessages
            .Where(m => m.TripId == tripId)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.Message,
                m.CreatedAt,
                userId = m.UserId,
                userName = m.User.Name,
                role = m.User.Role.ToString()
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(
        int tripId,
        [FromBody] SendTripMessageRequest req)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(req.Message))
        {
            return BadRequest(new
            {
                message = "اكتب رسالة أولًا."
            });
        }

        var tripExists = await db.Trips
            .AnyAsync(t => t.Id == tripId);

        if (!tripExists)
        {
            return NotFound(new
            {
                message = "الرحلة غير موجودة."
            });
        }

        var isAdmin = User.IsInRole(UserRole.Admin.ToString());

        if (!isAdmin)
        {
            var hasBooking = await db.Bookings.AnyAsync(b =>
                b.TripId == tripId &&
                b.UserId == userId.Value &&
                b.Status == BookingStatus.Confirmed);

            if (!hasBooking)
            {
                return Forbid();
            }
        }

        var message = new TripMessage
        {
            TripId = tripId,
            UserId = userId.Value,
            Message = req.Message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        db.TripMessages.Add(message);
        await db.SaveChangesAsync();

        var result = await db.TripMessages
            .Where(m => m.Id == message.Id)
            .Select(m => new
            {
                m.Id,
                m.Message,
                m.CreatedAt,
                userId = m.UserId,
                userName = m.User.Name,
                role = m.User.Role.ToString()
            })
            .FirstAsync();

        return Ok(result);
    }

    private int? GetUserId()
    {
        var claim =
            User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier);

        if (claim is null)
            return null;

        return int.TryParse(claim.Value, out var userId)
            ? userId
            : null;
    }
}

public record SendTripMessageRequest(string Message);