namespace ProductIQ.Application.DTOs;

public class CatalogHealthDataPointDto
{
    public string Date { get; set; } = string.Empty;
    public double QualityScore { get; set; }
    public int DuplicatesDetected { get; set; }
    public int TotalProducts { get; set; }
}

public class CatalogHealthDto
{
    public string Period { get; set; } = "30D";
    public double CurrentQualityScore { get; set; }
    public int TotalDuplicatesDetected { get; set; }
    public int TotalProducts { get; set; }
    public List<CatalogHealthDataPointDto> DataPoints { get; set; } = new();
}
