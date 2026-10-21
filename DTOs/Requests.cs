namespace SonicBuss.DTOs;
public record RegisterRequest(string Name, string Phone, string Password);
public record LoginRequest(string Phone, string Password);
public record CreateTripRequest(string Name, string From, string To, DateTime DepartureAt, int TotalSeats, decimal Price, DateTime BookingOpensAt, DateTime BookingClosesAt, DateTime CancellationClosesAt, DriverRequest Driver, List<string> Stops);
public record DriverRequest(string Name, string Phone, string VehicleType, string VehiclePlate);
public record BookRequest(int TripId, int StopId);
