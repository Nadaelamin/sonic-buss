using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SonicBuss.Data;
using SonicBuss.DTOs;
using SonicBuss.Models;
using SonicBuss.Services;

namespace SonicBuss.Controllers;
[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Phone) || req.Password.Length < 6)
            return BadRequest(new { message = "أدخل الاسم ورقم الهاتف وكلمة مرور من 6 أحرف على الأقل." });
        if (await db.Users.AnyAsync(u => u.Phone == req.Phone)) return Conflict(new { message = "رقم الهاتف مستخدم بالفعل." });
        var user = new User { Name=req.Name.Trim(), Phone=req.Phone.Trim(), Role=UserRole.Student };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, req.Password);
        db.Users.Add(user); await db.SaveChangesAsync();
        return Ok(new { token = jwt.Create(user), user = new { user.Id, user.Name, user.Phone, role=user.Role.ToString() } });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Phone == req.Phone);
        if (user is null) return Unauthorized(new { message = "رقم الهاتف أو كلمة المرور غير صحيحة." });
        var result = new PasswordHasher<User>().VerifyHashedPassword(user,user.PasswordHash,req.Password);
        if (result == PasswordVerificationResult.Failed) return Unauthorized(new { message = "رقم الهاتف أو كلمة المرور غير صحيحة." });
        return Ok(new { token=jwt.Create(user), user=new { user.Id,user.Name,user.Phone,role=user.Role.ToString(),user.CancellationCount,user.BannedUntil } });
    }
}
