using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.DTOs;
using SonicBuss.Models;
using System.Security.Claims;

namespace SonicBuss.Controllers;
[ApiController]
[Route("api/trips")]
public class TripsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAvailable()
    {
        var now=DateTime.UtcNow;
        var trips=await db.Trips.Include(t=>t.Driver).Include(t=>t.Stops).Include(t=>t.Bookings)
            .Where(t=>t.Status!=TripStatus.Cancelled && t.BookingClosesAt>=now)
            .OrderBy(t=>t.DepartureAt).ToListAsync();
        return Ok(trips.Select(t=>new {t.Id,t.Name,t.From,t.To,t.DepartureAt,t.TotalSeats,t.Price,t.BookingOpensAt,t.BookingClosesAt,t.CancellationClosesAt,status=t.Status.ToString(),availableSeats=t.TotalSeats-t.Bookings.Count(b=>b.Status==BookingStatus.Confirmed),driver=new {t.Driver.Name,t.Driver.Phone,t.Driver.VehicleType,t.Driver.VehiclePlate},stops=t.Stops.OrderBy(s=>s.Order).Select(s=>new {s.Id,s.Name,s.Order})}));
    }

    [HttpPost]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> Create(CreateTripRequest req)
    {
        if (req.TotalSeats<=0 || req.Stops.Count==0) return BadRequest(new {message="أدخل عدد المقاعد وأضف نقطة ركوب واحدة على الأقل."});
        if (req.BookingClosesAt < req.BookingOpensAt || req.CancellationClosesAt > req.BookingClosesAt) return BadRequest(new {message="تحقق من أوقات الحجز والإلغاء."});
        var driver=new Driver{Name=req.Driver.Name,Phone=req.Driver.Phone,VehicleType=req.Driver.VehicleType,VehiclePlate=req.Driver.VehiclePlate};
        var trip=new Trip{Name=req.Name,From=req.From,To=req.To,DepartureAt=req.DepartureAt,TotalSeats=req.TotalSeats,Price=req.Price,BookingOpensAt=req.BookingOpensAt,BookingClosesAt=req.BookingClosesAt,CancellationClosesAt=req.CancellationClosesAt,Driver=driver};
        for(int i=0;i<req.Stops.Count;i++) trip.Stops.Add(new Stop{Name=req.Stops[i],Order=i+1});
        db.Trips.Add(trip); await db.SaveChangesAsync(); return Ok(new {message="تم إنشاء الرحلة.",trip.Id});
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> Cancel(int id)
    {
        var trip=await db.Trips.FindAsync(id); if(trip is null) return NotFound(new {message="الرحلة غير موجودة."});
        trip.Status=TripStatus.Cancelled; await db.SaveChangesAsync(); return Ok(new {message="تم إلغاء الرحلة."});
    }
}
