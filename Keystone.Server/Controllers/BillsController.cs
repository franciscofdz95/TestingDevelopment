using Keystone.DAL.Model.Params;
using Keystone.Services.Services.Bills;
using Microsoft.AspNetCore.Mvc;

namespace Keystone.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class BillsController : Controller
    {
        private readonly IBillsService _billsService;
        public BillsController(IBillsService billsService)
        {
            _billsService = billsService;
        }

        [HttpGet("GetBills")]
        public async Task<IActionResult> GetBills([FromQuery] BillsTParams _billsParam)
        {
            try
            {
                var bills = await _billsService.GetBills(_billsParam);
                return Ok(bills);
            }
            catch(Exception ex)
            {
                    return BadRequest(ex.Message);
            }
        }
    }
}
