using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrimeITServer.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mg5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuestionsJson",
                table: "Jobs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AnswersJson",
                table: "JobApplications",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CVPath",
                table: "JobApplications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuestionsJson",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "AnswersJson",
                table: "JobApplications");

            migrationBuilder.DropColumn(
                name: "CVPath",
                table: "JobApplications");
        }
    }
}
