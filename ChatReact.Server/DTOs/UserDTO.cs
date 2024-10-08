namespace ChatReact.Server.DTOs
{
  public class UserDTO
  {
    public required string Username { get; set; }
    public required string Password { get; set; }
    public required string ConfirmPassword { get; set; }
  }
}
