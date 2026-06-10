using Keystone.DAL.Model;
using Keystone.DAL.Provider;
using System.Data;

namespace Keystone.Services.Services.Filters
{
    public class FilterService : IFilterService
    {
        private readonly IDataProvider _dataProvider;

        public FilterService(IDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }

        public async Task<IEnumerable<Dictionary<string, object>>> GetAccountingYears()
        {
            var results = await _dataProvider.ExecuteAsyncGeneric(
                DBConstants.RollingMonths,
                CommandType.StoredProcedure
            );
            return results;
        }

        public async Task<IEnumerable<Dictionary<string, object>>> GetAccountingMonths()
        {
            var results = await _dataProvider.ExecuteAsyncGeneric(
                DBConstants.RollingMonthsMon,
                CommandType.StoredProcedure
            );
            return results;
        }

        public async Task<IEnumerable<Dictionary<string, object>>> GetDisplayCurrencies(string locationCode, string countryCode)
        {
            var parameters = new List<DBParameter>();
            if (!string.IsNullOrEmpty(locationCode))
                parameters.Add(new DBParameter("@location_code", DbType.AnsiString, locationCode));
            if (!string.IsNullOrEmpty(countryCode))
                parameters.Add(new DBParameter("@country_code", DbType.AnsiString, countryCode));

            var results = await _dataProvider.ExecuteAsyncGeneric(
                DBConstants.GetCurrency,
                CommandType.StoredProcedure,
                parameters.ToArray()
            );
            return results;
        }

        public async Task<IEnumerable<Dictionary<string, object>>> GetLocationCodes(string geoCode, string geoId, string locationCode)
        {
            var parameters = new List<DBParameter>
            {
                new DBParameter("@geoid", DbType.AnsiString, geoId ?? ""),
                new DBParameter("@geocode", DbType.AnsiString, geoCode ?? ""),
                new DBParameter("@location_code", DbType.AnsiString, locationCode ?? "")
            };

            var results = await _dataProvider.ExecuteAsyncGeneric(
                DBConstants.AutoCompLocation,
                CommandType.StoredProcedure,
                parameters.ToArray()
            );
            return results;
        }

        public async Task<IEnumerable<Dictionary<string, object>>> GetServiceCodes()
        {
            var results = await _dataProvider.ExecuteAsyncGeneric(
                DBConstants.GetServiceCodes,
                CommandType.StoredProcedure
            );
            return results;
        }
    }
}
