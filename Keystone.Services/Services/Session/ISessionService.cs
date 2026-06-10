using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Keystone.Services.Services.Session
{
    public interface ISessionService
    {
        Task<int> GetActiveADID(string userName);
    }
}
