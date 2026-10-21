using Microsoft.EntityFrameworkCore;
using SonicBuss.Models;

namespace SonicBuss.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users => Set<User>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Stop> Stops => Set<Stop>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>().HasIndex(x => x.Phone).IsUnique();
        b.Entity<Booking>().HasIndex(x => x.BookingCode).IsUnique();
        b.Entity<Trip>().HasOne(x => x.Driver).WithMany(x => x.Trips).HasForeignKey(x => x.DriverId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Booking>().HasOne(x => x.User).WithMany(x => x.Bookings).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Booking>().HasOne(x => x.Trip).WithMany(x => x.Bookings).HasForeignKey(x => x.TripId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Booking>().HasOne(x => x.Stop).WithMany().HasForeignKey(x => x.StopId).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Trip>().Property(x => x.Price).HasPrecision(10,2);
    }
}
