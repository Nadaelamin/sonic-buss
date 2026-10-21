using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SonicBuss.Models;

namespace SonicBuss.Services;

public class JwtService(IConfiguration config)
{
    public string Create(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("phone", user.Phone)
        };
        var token = new JwtSecurityToken(config["Jwt:Issuer"], config["Jwt:Audience"], claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(config["Jwt:ExpiresMinutes"] ?? "720")), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
