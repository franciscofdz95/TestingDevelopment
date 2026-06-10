using Keystone.DAL.Model;
using Keystone.DAL.Provider;
using System.Data;

namespace Keystone.Services.Services.Session
{
    public class SessionService : ISessionService
    {
        private readonly IDataProvider _dataProvider;
        public SessionService(IDataProvider dataProvider)
        {
            _dataProvider = dataProvider;
        }
        public async Task<int> GetActiveADID(string userName)
        {
            var parameters = new DBParameter[] {
            new DBParameter("@userName",DbType.String, userName)
            };

            var result = await _dataProvider.ExecuteScalarAsync("AppObject.usp_GetUserID_ByUsername", CommandType.StoredProcedure, parameters);
            int tempid = 0;
            if(result != null)
            {
                int.TryParse(result.ToString(), out tempid);
            }
            
            return tempid;
        }
    }
}
