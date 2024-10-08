using ChatReact.Server.Data;
using ChatReact.Server.Models;
using Microsoft.AspNetCore.SignalR;

namespace ChatReact.Server.Hubs
{
  public class ChatHub : Hub
  {
    private readonly ChatContext _context;

    public ChatHub(ChatContext context)
    {
      _context = context;
    }

    //public override async Task OnConnectedAsync()
    //{
    //  if (Context.User?.Identity != null && Context.User.Identity.IsAuthenticated)
    //  {
    //    var messages = _context.ChatMessages
    //        .OrderBy(m => m.TimeStamp)
    //        .Take(50)
    //        .ToList();

    //    foreach (var message in messages)
    //    {
    //      await Clients.Caller.SendAsync("ReceiveMessage", message.Username, message.Message);
    //    }
    //  }
    //  else
    //  {
    //    await Clients.Caller.SendAsync("ReceiveMessage", "System", "You are not authorized.");
    //  }
    //  await base.OnConnectedAsync();
    //}

    public async Task JoinRoom(string chatRoomId)
    {
      await Groups.AddToGroupAsync(Context.ConnectionId, chatRoomId);
      //await Clients.Caller.SendAsync("ReceiveMessage", "System", $"Connected to room: {chatRoomId}");

      if (Context.User?.Identity != null && Context.User.Identity.IsAuthenticated)
      {
        var messages = _context.ChatMessages
          .Where(m => m.ChatRoomId == chatRoomId)
          .OrderBy(m => m.TimeStamp)
          .Take(50)
          .ToList();

        foreach (var message in messages)
        {
          await Clients.Caller.SendAsync("ReceiveMessage", message.Username, message.Message);
        }
      }
    }

    public async Task SendMessage(string user, string message, string chatRoomId)
    {
      var chatMessage = new ChatMessage { Username = user, Message = message, ChatRoomId = chatRoomId };
      _context.ChatMessages.Add(chatMessage);
      await _context.SaveChangesAsync();

      await Clients.Group(chatRoomId).SendAsync("ReceiveMessage", user, message);
    }
  }
}
