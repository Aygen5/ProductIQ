namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;

public class SystemSetting : BaseEntity
{
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}
