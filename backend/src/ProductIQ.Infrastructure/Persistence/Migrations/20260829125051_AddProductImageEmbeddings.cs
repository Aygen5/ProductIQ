using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace ProductIQ.Infrastructure.Persistence.Migrations
{

    public partial class AddProductImageEmbeddings : Migration
    {
    
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "product_image_embeddings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductImageId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModelName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Dimension = table.Column<int>(type: "integer", nullable: false),
                    Vector = table.Column<Vector>(type: "vector(512)", nullable: true),
                    ContentHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_image_embeddings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_image_embeddings_product_images_ProductImageId",
                        column: x => x.ProductImageId,
                        principalTable: "product_images",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_image_embeddings_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_image_embeddings_ProductId",
                table: "product_image_embeddings",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_product_image_embeddings_ProductImageId",
                table: "product_image_embeddings",
                column: "ProductImageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_image_embeddings_ProductImageId_ModelName",
                table: "product_image_embeddings",
                columns: new[] { "ProductImageId", "ModelName" },
                unique: true);
        }

    
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "product_image_embeddings");
        }
    }
}
