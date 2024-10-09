namespace ChatReact.Server.Models
{
  public class ChatLog
  {
    public int Id { get; set; }
    public string Username { get; set; }
    public string Action { get; set; }
    public string? Message { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? ChatRoomId { get; set; }
  }
}
