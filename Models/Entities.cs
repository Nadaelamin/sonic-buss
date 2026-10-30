namespace SonicBuss.Models;

public enum UserRole { Student, Admin }
public enum BookingStatus { Confirmed, Cancelled }
public enum TripStatus { Open, Closed, FullyBooked, Cancelled, Completed }

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; set; } = UserRole.Student;
    public int CancellationCount { get; set; }
    public DateTime? BannedUntil { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<TripMessage> TripMessages { get; set; } = new List<TripMessage>();
}

public class Driver
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";
    public string VehicleType { get; set; } = "";
    public string VehiclePlate { get; set; } = "";
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}

public class Trip
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string From { get; set; } = "";
    public string To { get; set; } = "";
    public DateTime DepartureAt { get; set; }
    public int TotalSeats { get; set; }
    public decimal Price { get; set; }
    public DateTime BookingOpensAt { get; set; }
    public DateTime BookingClosesAt { get; set; }
    public DateTime CancellationClosesAt { get; set; }
    public TripStatus Status { get; set; } = TripStatus.Open;
    public int DriverId { get; set; }
    public Driver Driver { get; set; } = null!;
    public ICollection<Stop> Stops { get; set; } = new List<Stop>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class Stop
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public int Order { get; set; }
    public string Name { get; set; } = "";
}

public class Booking
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = "";
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;
    public int StopId { get; set; }
    public Stop Stop { get; set; } = null!;
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
}

public class TripMessage
{
    public int Id { get; set; }

    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Message { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}