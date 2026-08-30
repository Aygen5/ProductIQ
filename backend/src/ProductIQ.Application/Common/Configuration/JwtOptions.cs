namespace ProductIQ.Application.Common.Configuration;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "ProductIQ.API";
    public string Audience { get; set; } = "ProductIQ.Client";
    public string Key { get; set; } = string.Empty;
    public int ExpirationHours { get; set; } = 24;
}
