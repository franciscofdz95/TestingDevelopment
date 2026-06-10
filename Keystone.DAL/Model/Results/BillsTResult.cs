using Microsoft.AspNetCore.Http.HttpResults;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Keystone.DAL.Model.Results
{
    public class BillsTResult
    {
        public string ROWNUMBER { get; set; } 
            public string invoice_id { get; set; }
        public DateTime CreatedDT { get; set; }
        public string InvRefNo { get; set; }
        public int Invoice_CID { get; set; }
        public int AP_Vendor_id { get; set; }
        public int AP_Remit_id { get; set; }
        public int Vendor_id { get; set; }
        public string Location_Code { get; set; }
        public string remote_check_location { get; set; }
        public string ScanFolder { get; set; }
        public string Oracle_Site_Code { get; set; }
        public string ImageNumber { get; set; }
        public string  vendor_code { get; set; }
        public string vendor_name_english { get; set; }
        public bool showcheckbox { get; set; }
        public string pay_group { get; set; }
        public string CreatedBy { get; set; }
        public DateTime ApprovedDT { get; set; }
        public string ApprovedBy { get; set; }
        public string invoice_status { get; set; }
        public string ReferenceFilter { get; set; }
        public int reference_id { get; set; }
        public string imageURL { get; set; }
        public string scan_dest { get; set; }
        public int ImageCount { get; set; }
        public string Imagefolder { get; set; }
        public bool on_oracle { get; set; }
        public bool Rejected { get; set; }
        public string RejectedBy { get; set; }
        public DateTime RejectedDate { get; set; }
        public bool RejectedRecall { get; set; }
        public string Comment { get; set; }
        public decimal invoice_amt { get; set; }
        public decimal invoiceAmt { get; set; }
        public string shpmnt_nbr { get; set; }
        public string location_data_entry { get; set; }
        public DateTime ModifiedDT { get; set; }
        public string ModifiedBy { get; set; }
        public int detail_cnt { get; set; }
        public int batch_id { get; set; }
        public bool invalidimage { get; set; }
        public string ScanRejectedBy { get; set; }
        public string RejectScanComments { get; set; }
        public bool IncorrectScan { get; set; }
        public DateTime Scandest_Mod { get; set; }
        public string pay_group_popup { get; set; }
        public bool Paid { get; set; }
        public int TotalRows { get; set; }

    }
}
