using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Models;

namespace SonicBuss.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var hasher = new PasswordHasher<User>();
        if (!await db.Users.AnyAsync())
        {
            var admin = new User { Name = "Sonic Bus Admin", Phone = "01000000000", Role = UserRole.Admin };
            admin.PasswordHash = hasher.HashPassword(admin, "Admin@123");
            var student = new User { Name = "أحمد محمد", Phone = "01111111111", Role = UserRole.Student };
            student.PasswordHash = hasher.HashPassword(student, "123456");
            db.Users.AddRange(admin, student);
            await db.SaveChangesAsync();
        }
        if (!await db.Trips.AnyAsync())
        {
            var driver = new Driver { Name="محمد حسن", Phone="01012345678", VehicleType="أتوبيس", VehiclePlate="أسوان 1234" };
            var now = DateTime.UtcNow;
            var trip = new Trip
            {
                Name="أسوان → جامعة أسوان",
                From="أسوان",
                To="جامعة أسوان",
                DepartureAt=now.AddDays(1).Date.AddHours(4),
                TotalSeats=30,
                Price=20,
                BookingOpensAt=now.AddHours(-1),
                BookingClosesAt=now.AddHours(18),
                CancellationClosesAt=now.AddHours(16),
                Driver=driver,
                Status=TripStatus.Open
            };
            trip.Stops.Add(new Stop{Name="محطة القطار",Order=1});
            trip.Stops.Add(new Stop{Name="موقف الأقاليم",Order=2});
            trip.Stops.Add(new Stop{Name="السيل",Order=3});
            db.Trips.Add(trip);
            await db.SaveChangesAsync();
        }
    }
}
