using ChatReact.Server.Data;
using ChatReact.Server.Hubs;
using ChatReact.Server.Utils;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using System.Security.Claims;

namespace ChatReact.UnitTests.Server.Hubs
{
  public class ChatHubTests
  {
    private readonly ChatHub _chatHub;
    private readonly ChatContext _chatContext;

    public ChatHubTests()
    {
      // Skapa en in-memory databas för tester
      var mockDb = new DbContextOptionsBuilder<ChatContext>()
          .UseInMemoryDatabase(databaseName: "TestDatabase")
          .Options;

      _chatContext = new ChatContext(mockDb);
      _chatHub = new ChatHub(_chatContext);

      // Simulera HubCallerContext
      var mockContext = Substitute.For<HubCallerContext>();
      var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Name, "testUser") }));

      // Ställ in egenskaperna för mockContext
      mockContext.User.Returns(user);
      mockContext.ConnectionId.Returns("testConnectionId");
      _chatHub.Context = mockContext; // Sätt den mockade kontexten

      var mockClients = Substitute.For<IHubCallerClients>();
      var mockClientProxy = Substitute.For<IClientProxy>();
      mockClients.Group(Arg.Any<string>()).Returns(mockClientProxy);
      _chatHub.Clients = mockClients; // Sätt den mockade Clients
    }

    [Fact]
    public async Task OnConnectedAsync_ShouldLogConnection()
    {
      // Arrange
      var username = "testUser";

      // Act
      await _chatHub.OnConnectedAsync();

      // Assert
      var log = await _chatContext.ChatLogs.FirstOrDefaultAsync();
      Assert.NotNull(log);
      Assert.Equal(username, log.Username);
      Assert.Equal("Connected", log.Action);
    }

    [Fact]
    public async Task SendMessage_ShouldSaveMessageAndLog()
    {
      // Arrange
      string user = "testUser";
      string message = "Hello, world!";
      string chatRoomId = "main";

      // Act
      await _chatHub.SendMessage(user, message, chatRoomId);

      // Assert
      var savedMessage = await _chatContext.ChatMessages.FirstOrDefaultAsync();
      var savedLog = await _chatContext.ChatLogs.FirstOrDefaultAsync();

      Assert.NotNull(savedMessage);
      Assert.Equal(user, savedMessage.Username);
      Assert.Equal(chatRoomId, savedMessage.ChatRoomId);

      Assert.NotNull(savedLog);
      Assert.Equal(user, savedLog.Username);
      Assert.Equal("Sent Message", savedLog.Action);
      Assert.Equal(chatRoomId, savedLog.ChatRoomId);
    }

    [Fact]
    public async Task OnDisconnectedAsync_ShouldLogDisconnection()
    {
      // Arrange
      var exception = new Exception("Test disconnect exception");

      // Act
      await _chatHub.OnDisconnectedAsync(exception);

      // Assert
      var log = await _chatContext.ChatLogs.FirstOrDefaultAsync();
      Assert.NotNull(log);
      Assert.Equal("testUser", log.Username);
      Assert.Equal("Disconnected", log.Action);
    }

    [Fact]
    public void TestEncryptionAndDecryption()
    {
      var originalMessage = "Hello, this is a test message!";
      var encryptedMessage = AesEncryption.Encrypt(originalMessage);
      var decryptedMessage = AesEncryption.Decrypt(encryptedMessage);

      Assert.Equal(originalMessage, decryptedMessage);
    }
  }
}
