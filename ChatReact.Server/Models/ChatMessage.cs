namespace ChatReact.Server.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Message { get; set; }
        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;
    }
}
