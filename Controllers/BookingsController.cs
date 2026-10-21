using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.DTOs;
using SonicBuss.Services;
using SonicBuss.Models;
using System.Security.Claims;

namespace SonicBuss.Controllers;
[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController(AppDbContext db, BookingService service) : ControllerBase
{
    int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("mine")]
    public async Task<IActionResult> Mine()
    {
        var rows=await db.Bookings.Include(b=>b.Trip).ThenInclude(t=>t.Driver).Include(b=>b.Stop)
            .Where(b=>b.UserId==UserId).OrderByDescending(b=>b.CreatedAt).ToListAsync();
        return Ok(rows.Select(b=>new {b.Id,b.BookingCode,status=b.Status.ToString(),b.CreatedAt,b.CancelledAt,trip=new {b.Trip.Id,b.Trip.Name,b.Trip.From,b.Trip.To,b.Trip.DepartureAt,b.Trip.Price,b.Trip.CancellationClosesAt,tripStatus=b.Trip.Status.ToString(),driver=new {b.Trip.Driver.Name,b.Trip.Driver.Phone,b.Trip.Driver.VehicleType,b.Trip.Driver.VehiclePlate}},stop=new {b.Stop.Id,b.Stop.Name}}));
    }

    [HttpPost]
    public async Task<IActionResult> Book(BookRequest req)
    {
        var result=await service.BookAsync(UserId,req.TripId,req.StopId);
        if(!result.ok) return BadRequest(new {message=result.message});
        return Ok(new {message=result.message,bookingCode=result.booking!.BookingCode});
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var result=await service.CancelAsync(UserId,id);
        if(!result.ok) return BadRequest(new {message=result.message});
        return Ok(new {message=result.message});
    }
}
