using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.Models;

namespace SonicBuss.Services;

public class BookingService(AppDbContext db)
{
    public async Task<(bool ok, string message, Booking? booking)> BookAsync(int userId, int tripId, int stopId)
    {
        var user = await db.Users.FindAsync(userId);
        var trip = await db.Trips.Include(t => t.Bookings).Include(t => t.Stops).FirstOrDefaultAsync(t => t.Id == tripId);
        if (user is null || trip is null) return (false, "البيانات غير صحيحة.", null);
        if (user.Role != UserRole.Student) return (false, "الحجز متاح للطلاب فقط.", null);
        if (user.BannedUntil.HasValue && user.BannedUntil > DateTime.UtcNow) return (false, $"الحساب محظور حتى {user.BannedUntil:yyyy-MM-dd}.", null);
        var now = DateTime.UtcNow;
        if (trip.Status == TripStatus.Cancelled) return (false, "هذه الرحلة ملغاة.", null);
        if (now < trip.BookingOpensAt) return (false, "الحجز لم يفتح بعد.", null);
        if (now > trip.BookingClosesAt) return (false, "فترة الحجز انتهت.", null);
        if (!trip.Stops.Any(s => s.Id == stopId)) return (false, "نقطة الركوب غير صحيحة.", null);
        if (trip.Bookings.Any(b => b.UserId == userId && b.Status == BookingStatus.Confirmed)) return (false, "لا يمكنك حجز نفس الرحلة مرتين.", null);
        var seats = trip.Bookings.Count(b => b.Status == BookingStatus.Confirmed);
        if (seats >= trip.TotalSeats) return (false, "اكتملت مقاعد الرحلة.", null);

        string code;
        do { code = "B" + Random.Shared.Next(100000, 999999); }
        while (await db.Bookings.AnyAsync(b => b.BookingCode == code));

        var booking = new Booking { BookingCode = code, UserId = userId, TripId = tripId, StopId = stopId };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();
        return (true, "تم تأكيد الحجز بنجاح.", booking);
    }

    public async Task<(bool ok, string message)> CancelAsync(int userId, int bookingId)
    {
        var booking = await db.Bookings.Include(b => b.Trip).FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);
        var user = await db.Users.FindAsync(userId);
        if (booking is null || user is null) return (false, "الحجز غير موجود.");
        if (booking.Status == BookingStatus.Cancelled) return (false, "الحجز ملغي بالفعل.");
        if (booking.Trip.Status == TripStatus.Cancelled) return (false, "الرحلة ملغاة بالفعل.");
        if (DateTime.UtcNow > booking.Trip.CancellationClosesAt) return (false, "انتهى موعد إلغاء الحجز.");
        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        user.CancellationCount++;
        if (user.CancellationCount == 5) { /* warning state is derived by count */ }
        if (user.CancellationCount >= 10)
        {
            user.BannedUntil = DateTime.UtcNow.AddMonths(3);
            user.CancellationCount = 0;
        }
        await db.SaveChangesAsync();
        return (true, "تم إلغاء الحجز وإعادة المقعد للرحلة.");
    }
}
