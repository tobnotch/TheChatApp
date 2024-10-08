using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatReact.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddChatRoomIdToChatMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChatRoomId",
                table: "ChatMessages",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChatRoomId",
                table: "ChatMessages");
        }
    }
}
