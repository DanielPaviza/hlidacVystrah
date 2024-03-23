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
    public class AdmController : ControllerBase
    {

        IAdmService _admService;

        public AdmController(IAdmService admService)
        {
            _admService = admService;
        }

        // POST api/adm/tokenlogin
        [HttpPost("tokenlogin")]
        public BaseResponse TokenLogin([FromBody] LoginTokenDto data)
        {
            return _admService.TokenLogin(data);
        }

        // POST api/adm/logs/
        [HttpPost("logs")]
        public LogsResponse GetLogs([FromBody] LogsDto data)
        {
            return _admService.GetLogs(data);
        }        
        
        // POST api/adm/logs/options
        [HttpPost("logs/options")]
        public LogsFilterOptionsResponse GetLogsFilterOptions([FromBody] LoginTokenDto data)
        {
            return _admService.GetLogsFilterOptions(data);
        }        
        
        // POST api/adm/users
        [HttpPost("users")]
        public UserListResponse GetUserList([FromBody] LoginTokenDto data)
        {
            return _admService.GetUserList(data);  
        }        
        
        // POST api/adm/users/makeadmin
        [HttpPost("users/makeadmin")]
        public BaseResponse UserMakeAdmin([FromBody] AdminUserDto data)
        {
            return _admService.UserMakeAdmin(data);
        }        
        
        // POST api/adm/users/removeadmin
        [HttpPost("users/removeadmin")]
        public BaseResponse UserRemoveAdmin([FromBody] AdminUserDto data)
        {
            return _admService.UserRemoveAdmin(data);
        }       
        
        // POST api/adm/users/delete
        [HttpPost("users/delete")]
        public BaseResponse UserDelete(AdminUserDto data)
        {
            return _admService.UserDelete(data);
        }
    }
}
