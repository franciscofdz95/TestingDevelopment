using Keystone.Services.Services.Filters;
using Microsoft.AspNetCore.Mvc;

namespace Keystone.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilterController : Controller
    {
        private readonly IFilterService _filterService;

        public FilterController(IFilterService filterService)
        {
            _filterService = filterService;
        }

        /// <summary>
        /// Returns accounting years from rolling months (used for AcctYear dropdown).
        /// </summary>
        [HttpGet("AcctYear")]
        public async Task<IActionResult> GetAccountingYears()
        {
            try
            {
                var result = await _filterService.GetAccountingYears();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Returns accounting months (used for AcctMonth dropdown).
        /// </summary>
        [HttpGet("AcctMonth")]
        public async Task<IActionResult> GetAccountingMonths()
        {
            try
            {
                var result = await _filterService.GetAccountingMonths();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Returns display currencies. Query param: locationCode,countryCode
        /// </summary>
        [HttpGet("DisplayCurrency")]
        public async Task<IActionResult> GetDisplayCurrencies([FromQuery] string locationCode = "", [FromQuery] string countryCode = "")
        {
            try
            {
                var result = await _filterService.GetDisplayCurrencies(locationCode, countryCode);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Returns location type options (static values matching old ExtJS app).
        /// </summary>
        [HttpGet("LocType")]
        public IActionResult GetLocationTypes()
        {
            var result = new[]
            {
                new { value = "DEP", text = "DEP" },
                new { value = "TP", text = "TP" }
            };
            return Ok(result);
        }

        /// <summary>
        /// Returns location codes for autocomplete.
        /// </summary>
        [HttpGet("LocationCode")]
        public async Task<IActionResult> GetLocationCodes([FromQuery] string geoCode = "", [FromQuery] string geoId = "", [FromQuery] string locationCode = "")
        {
            try
            {
                var result = await _filterService.GetLocationCodes(geoCode, geoId, locationCode);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Returns service codes.
        /// </summary>
        [HttpGet("ServiceCode")]
        public async Task<IActionResult> GetServiceCodes()
        {
            try
            {
                var result = await _filterService.GetServiceCodes();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
