using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.Models;

namespace SonicBuss.Controllers;
[ApiController]
[Route("api/admin")]
[Authorize(Roles="Admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var bookings=await db.Bookings.ToListAsync();
        return Ok(new {students=await db.Users.CountAsync(u=>u.Role==UserRole.Student),trips=await db.Trips.CountAsync(),activeTrips=await db.Trips.CountAsync(t=>t.Status!=TripStatus.Cancelled),bookings=bookings.Count(b=>b.Status==BookingStatus.Confirmed),cancelledBookings=bookings.Count(b=>b.Status==BookingStatus.Cancelled)});
    }

    [HttpGet("trips/{tripId}/bookings")]
    public async Task<IActionResult> TripBookings(int tripId)
    {
        var rows=await db.Bookings.Include(b=>b.User).Include(b=>b.Stop).Where(b=>b.TripId==tripId).OrderBy(b=>b.CreatedAt).ToListAsync();
        return Ok(rows.Select(b => new
        {
            Id = b.Id,
            BookingCode = b.BookingCode,
            Status = b.Status.ToString(),
            Student = new
            {
                Id = b.User.Id,
                Name = b.User.Name,
                Phone = b.User.Phone
            },
            Stop = b.Stop.Name,
            CreatedAt = b.CreatedAt,
            CancelledAt = b.CancelledAt
        }));
    }

    [HttpGet("trips")]
    public async Task<IActionResult> Trips()
    {
        var rows=await db.Trips.Include(t=>t.Driver).Include(t=>t.Stops).Include(t=>t.Bookings).OrderByDescending(t=>t.DepartureAt).ToListAsync();
        return Ok(rows.Select(t=>new {t.Id,t.Name,t.From,t.To,t.DepartureAt,t.TotalSeats,t.Price,status=t.Status.ToString(),availableSeats=t.TotalSeats-t.Bookings.Count(b=>b.Status==BookingStatus.Confirmed),driver=new {t.Driver.Name,t.Driver.Phone,t.Driver.VehicleType,t.Driver.VehiclePlate},stops=t.Stops.OrderBy(s=>s.Order).Select(s=>s.Name)}));
    }

    [HttpGet("students")]
    public async Task<IActionResult> Students() => Ok(await db.Users.Where(u=>u.Role==UserRole.Student).Select(u=>new {u.Id,u.Name,u.Phone,u.CancellationCount,u.BannedUntil}).ToListAsync());
}
