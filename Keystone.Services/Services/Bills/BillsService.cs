using Keystone.DAL.Model;
using Keystone.DAL.Provider;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Keystone.Services.Services.Bills
{
    public class BillsService : IBillsService
    {
        private readonly IDataProvider _dataprovider;
        public BillsService(IDataProvider dataProvider)
        {
           _dataprovider = dataProvider;
        }

        public async Task<List<DAL.Model.Results.BillsTResult>> GetBills(DAL.Model.Params.BillsTParams param)
        {
            List<DBParameter> args = new List<DBParameter>();
            //args.Add(new DBParameter("@AcctYear", DbType.AnsiString, param.AcctYear));
            ////args.Add(new DBParameter("@InvRefNo", DbType.AnsiString, param.InvoiceRefNo));
            //args.Add(new DBParameter("@location_code", DbType.AnsiString, param.LocCode));
            //args.Add(new DBParameter("@invoice_status", DbType.AnsiString, param.InvoiceStatus));
            ////args.Add(new DBParameter("@invoice_id", DbType.AnsiString, param.InvoiceId));
            ///
            args.Add(new DBParameter("@AcctYear", DbType.AnsiString, "2026"));
            args.Add(new DBParameter("@AcctMonth", DbType.AnsiString, "6"));
            args.Add(new DBParameter("@display_currency", DbType.AnsiString, "USD"));
            args.Add(new DBParameter("@location_code", DbType.AnsiString, "LAX"));
            args.Add(new DBParameter("@invoice_status", DbType.AnsiString, "Logged"));
            args.Add(new DBParameter("@start", DbType.AnsiString, "0"));
            var result = await _dataprovider.ExecuteAsync<DAL.Model.Results.BillsTResult>(DBConstants.Bills, System.Data.CommandType.StoredProcedure, args.ToArray());
            return result.ToList();
        }
    }
}
