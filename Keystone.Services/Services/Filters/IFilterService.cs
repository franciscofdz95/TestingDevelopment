namespace Keystone.Services.Services.Filters
{
    public interface IFilterService
    {
        Task<IEnumerable<Dictionary<string, object>>> GetAccountingYears();
        Task<IEnumerable<Dictionary<string, object>>> GetAccountingMonths();
        Task<IEnumerable<Dictionary<string, object>>> GetDisplayCurrencies(string locationCode, string countryCode);
        Task<IEnumerable<Dictionary<string, object>>> GetLocationCodes(string geoCode, string geoId, string locationCode);
        Task<IEnumerable<Dictionary<string, object>>> GetServiceCodes();
    }
}
