using ChatReact.Server.Data;
using ChatReact.Server.DTOs;
using ChatReact.Server.Models;
using ChatReact.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChatReact.Server.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : Controller
  {
    private readonly ChatContext _context;
    private readonly JwtTokenService _jwtTokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ChatContext context, JwtTokenService jwtTokenService, ILogger<AuthController> logger)
    {
      _context = context;
      _jwtTokenService = jwtTokenService;
      _logger = logger;
    }

    [HttpPost("signup")]
    public IActionResult Signup([FromBody] UserDTO userDTO)
    {
      if (userDTO.Password != userDTO.ConfirmPassword)
      {
        return BadRequest(new { message = "Passwords do not match" });
      }

      var hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDTO.Password);
      var user = new User { Username = userDTO.Username, PasswordHash = hashedPassword, Role = userDTO.Role };

      _context.Users.Add(user);
      _context.SaveChanges();

      return Ok(new { message = "User registered successfully with role: " + user.Role });
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDTO loginDTO)
    {
      var user = _context.Users.SingleOrDefault(u => u.Username == loginDTO.Username);

      if (user == null || !BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
      {
        _logger.LogWarning("Invalid login attempt for user: {Username}", loginDTO.Username);
        return Unauthorized(new { message = "Invalid credentials" });
      }

      var token = _jwtTokenService.GenerateJwtToken(user);
      _logger.LogInformation("User {Username} logged in successfully", user.Username);
      return Ok(new { message = "Logged in successfully", Token = token });
    }
  }
}
