using Microsoft.AspNetCore.Mvc;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using hlidacVystrah.Model;
using System.Collections.Generic;
using hlidacVystrah.Model.Dto;
using hlidacVystrah.Services;

namespace hlidacVystrah.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UpdateController : ControllerBase
    {

        IUpdateService _updateService;

        public UpdateController(IUpdateService updateService)
        {
            _updateService = updateService;
        }

        // GET api/update
        [HttpGet]
        public ParseResponse Update([FromQuery] string token)
        {
            return _updateService.UpdateEvents(token);
        }

        // POST api/update/list
        [HttpPost("list")]
        public UpdateListResponse GetList([FromBody] UpdateListDto? data)
        {
            return _updateService.GetList(data);
        }
    }
}
