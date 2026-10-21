# Sonic Buss — Student Transportation MVP

Arabic RTL student transportation platform for Aswan, built with ASP.NET Core 8 + SQL Server + HTML/CSS/JavaScript.

## Main roles
- Student: register/login, browse trips, choose stop, book, receive unique booking code, view/cancel bookings.
- Admin: dashboard, create trips, add stops/driver, view bookings, cancel trips.

## Business rules implemented
- Phone is unique.
- Booking is confirmed immediately.
- A student cannot book the same trip twice while an active booking exists.
- Seats decrease on confirmation and return on cancellation.
- Booking opens/closes according to admin-configured window.
- Cancellation is allowed until admin-configured deadline.
- Unique booking code is generated server-side.
- 5 cancellations = warning state by count; 10 cancellations = 3-month ban, then counter resets.
- Admin cannot edit a trip after creation; admin can cancel it.
- Cash payment at boarding.
- Multiple ordered stops per trip; student chooses a stop.
- Trips run regardless of booking count.

## Demo accounts
- Admin: `01000000000` / `Admin@123`
- Student: `01111111111` / `123456`

Change the admin password and JWT secret before production.

## Run
1. Install .NET 8 SDK and SQL Server/LocalDB.
2. Update `appsettings.json` connection string and JWT key.
3. Run `dotnet restore`.
4. Run `dotnet run`.
5. Open the displayed localhost URL.

The app seeds a sample admin, student, driver and trip on first run.
