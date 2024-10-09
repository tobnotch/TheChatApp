using ChatReact.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatReact.Server.Data
{
  public class ChatContext : DbContext
  {
    public ChatContext(DbContextOptions<ChatContext> options) : base(options) { }

    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<ChatLog> ChatLogs { get; set; }
  }
}
