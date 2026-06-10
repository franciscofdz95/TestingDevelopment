using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Keystone.Services.Services.Bills
{
    public interface IBillsService
    {
        Task<List<DAL.Model.Results.BillsTResult>> GetBills(DAL.Model.Params.BillsTParams param);
    }
}
