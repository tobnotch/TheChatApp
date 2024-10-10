using ChatReact.Server.Data;
using ChatReact.Server.Hubs;
using ChatReact.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NLog.Config;
using NLog.Targets;
using NLog.Web;
using NLog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var config = new LoggingConfiguration();

// Skapar loggning till fil med arkivering
var fileTarget = new FileTarget("logfile")
{
  FileName = "logs/TheChatApp.log",
  Layout = "${longdate} ${uppercase:${level}} ${message} ${exception}",
  ArchiveFileName = "logs/archived/log.{#####}.txt",
  ArchiveAboveSize = 10485760,
  MaxArchiveFiles = 7,
  ArchiveNumbering = ArchiveNumberingMode.Rolling,
  ConcurrentWrites = true,
  KeepFileOpen = false,
  Encoding = Encoding.UTF8
};
config.AddTarget(fileTarget);

// Skapar loggning till konsolen
var consoleTarget = new ConsoleTarget("logconsole")
{
  Layout = "${longdate} ${uppercase:${level}} ${message}"
};
config.AddTarget(consoleTarget);

config.AddRule(NLog.LogLevel.Info, NLog.LogLevel.Fatal, consoleTarget);
config.AddRule(NLog.LogLevel.Debug, NLog.LogLevel.Fatal, fileTarget);

LogManager.Configuration = config;

builder.Logging.ClearProviders();
builder.Host.UseNLog();

builder.Services.AddSignalR();
builder.Services.AddControllers();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
      var key = builder.Configuration["Jwt:Key"];

      options.TokenValidationParameters = new TokenValidationParameters
      {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
      };

      options.Events = new JwtBearerEvents
      {
        OnMessageReceived = context =>
        {
          var accessToken = context.Request.Query["access_token"];

          if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/chathub"))
          {
            context.Token = accessToken;
          }

          return Task.CompletedTask;
        }
      };
    });

builder.Services.AddAuthorization();

builder.Services.AddDbContext<ChatContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("ChatDbConnection")));

builder.Services.AddScoped<JwtTokenService>();

builder.WebHost.ConfigureKestrel(options =>
{
  options.ListenAnyIP(5041);
  options.ListenAnyIP(7163, listenOptions =>
  {
    listenOptions.UseHttps();
  });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
  app.UseExceptionHandler("/Home/Error");
  app.UseHsts();
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<ChatHub>("/chathub");
app.MapControllers();

app.Run();
