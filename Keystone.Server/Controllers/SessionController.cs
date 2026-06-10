using Keystone.Services.Services.Session;
using Microsoft.AspNetCore.Mvc;

namespace Keystone.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class SessionController : Controller
    {
        private readonly ISessionService _iSessionService;
        public SessionController(ISessionService iSessionService)
        {
            _iSessionService = iSessionService;
        }

        [HttpGet("GetUserIDByUserName")]
        public async Task<IActionResult> GetUserIDByUserName(string userName)
        {
            try
            {
                var result = await _iSessionService.GetActiveADID(userName);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
