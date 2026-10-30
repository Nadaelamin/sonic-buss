using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SonicBuss.Migrations
{
    public partial class AddTripMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TripMessages",
                columns: table => new
                {
                    Id = table.Column<int>(
                        type: "int",
                        nullable: false
                    )
                    .Annotation(
                        "SqlServer:Identity",
                        "1, 1"
                    ),

                    TripId = table.Column<int>(
                        type: "int",
                        nullable: false
                    ),

                    UserId = table.Column<int>(
                        type: "int",
                        nullable: false
                    ),

                    Message = table.Column<string>(
                        type: "nvarchar(max)",
                        nullable: false
                    ),

                    CreatedAt = table.Column<DateTime>(
                        type: "datetime2",
                        nullable: false
                    )
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "PK_TripMessages",
                        x => x.Id
                    );

                    table.ForeignKey(
                        name: "FK_TripMessages_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );

                    table.ForeignKey(
                        name: "FK_TripMessages_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                });

            migrationBuilder.CreateIndex(
                name: "IX_TripMessages_TripId",
                table: "TripMessages",
                column: "TripId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_TripMessages_UserId",
                table: "TripMessages",
                column: "UserId"
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TripMessages");
        }
    }
}