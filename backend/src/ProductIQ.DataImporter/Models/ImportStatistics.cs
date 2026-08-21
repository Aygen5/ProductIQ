namespace ProductIQ.DataImporter.Models;

public class ImportStatistics
{
    public long TotalLinesRead { get; set; }
    public long ParsedCount { get; set; }
    public long MalformedLinesCount { get; set; }
    public long FilteredByDomainCount { get; set; }
    public long FilteredByNoMainImageCount { get; set; }
    public long FilteredByMissingNameCount { get; set; }
    public long SuccessfullyNormalizedCount { get; set; }
    public int ImagesCatalogCount { get; set; }
    public long ImageLookupHits { get; set; }
    public long ImageLookupMisses { get; set; }
    public TimeSpan ElapsedTime { get; set; }
}
