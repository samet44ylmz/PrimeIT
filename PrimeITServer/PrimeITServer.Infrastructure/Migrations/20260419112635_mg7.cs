using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrimeITServer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mg7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AiScore",
                table: "JobApplications",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiEvaluation",
                table: "JobApplications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiScore",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "AiEvaluation",
                table: "JobApplications");
        }
    }
}
