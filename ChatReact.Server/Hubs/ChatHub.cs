using ChatReact.Server.Data;
using ChatReact.Server.Models;
using ChatReact.Server.Utils;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ChatReact.Server.Hubs
{
  public class ChatHub : Hub
  {
    private readonly ChatContext _context;

    public ChatHub(ChatContext context)
    {
      _context = context;
    }

    // Loggar när man loggar in
    public override async Task OnConnectedAsync()
    {
      var username = Context.User?.Identity?.Name;

      _context.ChatLogs.Add(new ChatLog
      {
        Username = username,
        Action = "Connected",
      });

      await _context.SaveChangesAsync();

      await base.OnConnectedAsync();
    }

    // Låter användare gå med i ett chattrum, kontrollerar VIP-behörighet och hämtar de senaste 50 meddelandena om användaren är autentiserad
    public async Task JoinRoom(string chatRoomId)
    {
      var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

      if (chatRoomId == "vip" && userRole != "VIP")
      {
        await Clients.Caller.SendAsync("ReceiveMessage", "System", "You are not authorized to join the VIP Vault.");
        return;
      }

      await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);

      if (Context.User?.Identity != null && Context.User.Identity.IsAuthenticated)
      {
        var messages = _context.ChatMessages
          .Where(m => m.ChatRoomId == chatRoomId)
          .OrderBy(m => m.TimeStamp)
          .Take(50)
          .ToList();

        foreach (var message in messages)
        {
          var decryptedMessage = AesEncryption.Decrypt(message.Message);
          await Clients.Caller.SendAsync("ReceiveMessage", message.Username, decryptedMessage);
        }
      }
    }

    // Lagrar meddelande och loggar det samt skickar meddelande i chatten
    public async Task SendMessage(string user, string message, string chatRoomId)
    {
      var encryptedMessage = AesEncryption.Encrypt(message);

      _context.ChatMessages.Add(new ChatMessage
      {
        Username = user,
        Message = encryptedMessage,
        ChatRoomId = chatRoomId
      });

      _context.ChatLogs.Add(new ChatLog
      {
        Username = user,
        Action = "Sent Message",
        Message = encryptedMessage,
        ChatRoomId = chatRoomId
      });

      await _context.SaveChangesAsync();

      await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", user, message);
    }

    // Loggar när man loggar ut
    public override async Task OnDisconnectedAsync(Exception exception)
    {
      var username = Context.User?.Identity?.Name;

      _context.ChatLogs.Add(new ChatLog
      {
        Username = username,
        Action = "Disconnected",
      });

      await _context.SaveChangesAsync();

      await base.OnDisconnectedAsync(exception);
    }
  }
}
