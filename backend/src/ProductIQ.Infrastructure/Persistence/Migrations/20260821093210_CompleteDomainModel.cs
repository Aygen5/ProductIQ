using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductIQ.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CompleteDomainModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:vector", ",,");

            migrationBuilder.AddColumn<long>(
                name: "NodeId",
                table: "products",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NodePath",
                table: "products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "dimension_height",
                table: "products",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "dimension_length",
                table: "products",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "dimension_unit",
                table: "products",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "dimension_weight",
                table: "products",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "dimension_width",
                table: "products",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "weight_unit",
                table: "products",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "duplicate_candidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductAId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductBId = table.Column<Guid>(type: "uuid", nullable: false),
                    OverallScore = table.Column<decimal>(type: "numeric(5,4)", nullable: false),
                    TextSimilarity = table.Column<decimal>(type: "numeric(5,4)", nullable: true),
                    SemanticSimilarity = table.Column<decimal>(type: "numeric(5,4)", nullable: true),
                    AttributeSimilarity = table.Column<decimal>(type: "numeric(5,4)", nullable: true),
                    VisualSimilarity = table.Column<decimal>(type: "numeric(5,4)", nullable: true),
                    BrandMatch = table.Column<bool>(type: "boolean", nullable: false),
                    ModelMatch = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    MatchSignals = table.Column<string>(type: "jsonb", nullable: true),
                    AiExplanation = table.Column<string>(type: "text", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_duplicate_candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_duplicate_candidates_products_ProductAId",
                        column: x => x.ProductAId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_duplicate_candidates_products_ProductBId",
                        column: x => x.ProductBId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "risk_alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    RiskScore = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AnomalyType = table.Column<int>(type: "integer", nullable: false),
                    KeyFindings = table.Column<string>(type: "jsonb", nullable: true),
                    AiReasoning = table.Column<string>(type: "text", nullable: true),
                    RecommendedAction = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_risk_alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_risk_alerts_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "search_query_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QueryText = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ExecutionTimeMs = table.Column<int>(type: "integer", nullable: false),
                    TotalResults = table.Column<int>(type: "integer", nullable: false),
                    AvgRelevanceScore = table.Column<decimal>(type: "numeric(5,4)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_search_query_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "system_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_system_settings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_NodeId",
                table: "products",
                column: "NodeId");

            migrationBuilder.CreateIndex(
                name: "IX_duplicate_candidates_OverallScore",
                table: "duplicate_candidates",
                column: "OverallScore");

            migrationBuilder.CreateIndex(
                name: "IX_duplicate_candidates_ProductAId",
                table: "duplicate_candidates",
                column: "ProductAId");

            migrationBuilder.CreateIndex(
                name: "IX_duplicate_candidates_ProductAId_ProductBId",
                table: "duplicate_candidates",
                columns: new[] { "ProductAId", "ProductBId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_duplicate_candidates_ProductBId",
                table: "duplicate_candidates",
                column: "ProductBId");

            migrationBuilder.CreateIndex(
                name: "IX_duplicate_candidates_Status",
                table: "duplicate_candidates",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_risk_alerts_AnomalyType",
                table: "risk_alerts",
                column: "AnomalyType");

            migrationBuilder.CreateIndex(
                name: "IX_risk_alerts_Level",
                table: "risk_alerts",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_risk_alerts_ProductId",
                table: "risk_alerts",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_risk_alerts_RiskScore",
                table: "risk_alerts",
                column: "RiskScore");

            migrationBuilder.CreateIndex(
                name: "IX_risk_alerts_Status",
                table: "risk_alerts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_search_query_logs_CreatedAt",
                table: "search_query_logs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_system_settings_Category",
                table: "system_settings",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_system_settings_Key",
                table: "system_settings",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "duplicate_candidates");

            migrationBuilder.DropTable(
                name: "risk_alerts");

            migrationBuilder.DropTable(
                name: "search_query_logs");

            migrationBuilder.DropTable(
                name: "system_settings");

            migrationBuilder.DropIndex(
                name: "IX_products_NodeId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "NodeId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "NodePath",
                table: "products");

            migrationBuilder.DropColumn(
                name: "dimension_height",
                table: "products");

            migrationBuilder.DropColumn(
                name: "dimension_length",
                table: "products");

            migrationBuilder.DropColumn(
                name: "dimension_unit",
                table: "products");

            migrationBuilder.DropColumn(
                name: "dimension_weight",
                table: "products");

            migrationBuilder.DropColumn(
                name: "dimension_width",
                table: "products");

            migrationBuilder.DropColumn(
                name: "weight_unit",
                table: "products");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:vector", ",,");
        }
    }
}
