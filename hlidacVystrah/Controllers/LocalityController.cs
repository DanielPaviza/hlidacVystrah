using Microsoft.AspNetCore.Mvc;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;

namespace hlidacVystrah.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocalityController : ControllerBase
    {

        ILocalityService _localityService;

        public LocalityController(ILocalityService localityService)
        {
            _localityService = localityService;
        }

        // GET api/locality/list
        [HttpGet("list")]
        public LocalityListResponse Get()
        {
            return _localityService.GetLocalityList();
        }

        // GET api/locality/{id}
        [HttpGet("{id}")]
        public LocalityDetailResponse Get(int id)
        {
            return _localityService.GetLocalityDetail(id);
        }

    }
}
