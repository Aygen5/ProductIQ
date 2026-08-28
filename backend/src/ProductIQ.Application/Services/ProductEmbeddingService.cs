namespace ProductIQ.Application.Services;

using System.Security.Cryptography;
using System.Text;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;

public class ProductEmbeddingService : IProductEmbeddingService
{
    public string BuildProductEmbeddingText(Product product)
    {
        var sb = new StringBuilder();

        if (!string.IsNullOrWhiteSpace(product.Name))
        {
            sb.Append("Title: ").AppendLine(product.Name.Trim());
        }

        if (!string.IsNullOrWhiteSpace(product.Brand))
        {
            sb.Append("Brand: ").AppendLine(product.Brand.Trim());
        }

        var category = product.Category ?? product.NodePath;
        if (!string.IsNullOrWhiteSpace(category))
        {
            sb.Append("Category: ").AppendLine(category.Trim());
        }

        if (!string.IsNullOrWhiteSpace(product.ProductType))
        {
            sb.Append("Product Type: ").AppendLine(product.ProductType.Trim());
        }

        var model = $"{product.ModelName} {product.ModelNumber}".Trim();
        if (!string.IsNullOrWhiteSpace(model))
        {
            sb.Append("Model: ").AppendLine(model);
        }

        if (!string.IsNullOrWhiteSpace(product.Color))
        {
            sb.Append("Color: ").AppendLine(product.Color.Trim());
        }

        if (!string.IsNullOrWhiteSpace(product.Material))
        {
            sb.Append("Material: ").AppendLine(product.Material.Trim());
        }

        if (product.Dimensions != null)
        {
            var dimParts = new List<string>();
            if (product.Dimensions.Length.HasValue) dimParts.Add($"L:{product.Dimensions.Length}");
            if (product.Dimensions.Width.HasValue) dimParts.Add($"W:{product.Dimensions.Width}");
            if (product.Dimensions.Height.HasValue) dimParts.Add($"H:{product.Dimensions.Height}");
            if (!string.IsNullOrWhiteSpace(product.Dimensions.DimensionUnit)) dimParts.Add(product.Dimensions.DimensionUnit);
            if (product.Dimensions.Weight.HasValue) dimParts.Add($"Weight:{product.Dimensions.Weight} {product.Dimensions.WeightUnit}".Trim());

            if (dimParts.Count > 0)
            {
                sb.Append("Dimensions: ").AppendLine(string.Join(" ", dimParts));
            }
        }

        if (product.Attributes != null && product.Attributes.Count > 0)
        {
            var formattedAttrs = product.Attributes
                .Where(a => !string.IsNullOrWhiteSpace(a.Key) && !string.IsNullOrWhiteSpace(a.Value))
                .OrderBy(a => a.Key, StringComparer.OrdinalIgnoreCase)
                .Select(a => $"{a.Key.Trim()}: {a.Value.Trim()}");

            var attrString = string.Join("; ", formattedAttrs);
            if (!string.IsNullOrWhiteSpace(attrString))
            {
                sb.Append("Attributes: ").AppendLine(attrString);
            }
        }

        if (!string.IsNullOrWhiteSpace(product.Description) &&
            !string.Equals(product.Description.Trim(), product.Name.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            sb.Append("Description: ").AppendLine(product.Description.Trim());
        }

        return sb.ToString().Trim();
    }

    public string ComputeContentHash(string text)
    {
        var bytes = Encoding.UTF8.GetBytes(text ?? string.Empty);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }
}
