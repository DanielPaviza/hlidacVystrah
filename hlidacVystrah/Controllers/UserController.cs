using Microsoft.AspNetCore.Mvc;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService; 
        }

        // GET api/user/register
        [HttpPost("register")]
        public BaseResponse Register([FromBody] EmailPasswordDto data)
        {
            return _userService.Register(data);
        }        
        
        // GET api/user/login
        [HttpPost("login")]
        public UserLoginResponse Login([FromBody] EmailPasswordDto data)
        {
            return _userService.Login(data);
        }        
        
        // GET api/user/login
        [HttpPost("tokenlogin")]
        public UserLoginResponse TokenLogin([FromBody] LoginTokenDto data)
        {
            return _userService.TokenLogin(data);
        }

        // GET api/user/resetpassword
        [HttpPost("resetpassword")]
        public BaseResponse ResetPassword([FromBody] EmailDto data)
        {
            return _userService.ResetPassword(data);
        }

        // GET api/user/activateaccount
        [HttpPost("activateaccount")]
        public ActivateAccount ActivateAccount([FromBody] ActivationTokenDto data)
        {
            return _userService.ActivateAccount(data);
        }

        // GET api/user/resendactivateaccountemail
        [HttpPost("resendactivateaccountemail")]
        public BaseResponse ReSendActivateAccountEmail([FromBody] LoginTokenDto data)
        {
            return _userService.ReSendActivateAccountEmail(data);
        }
        
        // GET api/user/newpassword
        [HttpPost("newpassword")]
        public BaseResponse NewPassword([FromBody] NewPasswordDto data)
        {
            return _userService.SetNewPassword(data);
        }  
        
        // GET api/user/newpasswordloggedin
        [HttpPost("newpasswordloggedin")]
        public BaseResponse NewPasswordLoggedIn([FromBody] NewPasswordLoggedInDto data)
        {
            return _userService.SetNewPasswordLoggedIn(data);
        }

        // GET api/user/deleteaccount
        [HttpPost("deleteaccount")]
        public BaseResponse DeleteAccount([FromBody] UserDeleteDto data)
        {
            return _userService.DeleteAccount(data);
        }

        [HttpGet("notificationoptions")]
        public EventNotificationOptionsResponse NotificationOptions()
        {
            return _userService.GetEventNotificationOptions();
        }        
        
        [HttpPost("notifications")]
        public NotificationResponse Notifications([FromBody] LoginTokenDto data)
        {
            return _userService.GetEventNotifications(data);
        }

        [HttpPost("addnotification")]
        public BaseResponse NotificationAdd([FromBody] NotificationAddDto data)
        {
            return _userService.NotificationAdd(data);
        }        
        
        [HttpPost("deletenotification")]
        public BaseResponse NotificationDelete([FromBody] NotificationDeleteDto data)
        {
            return _userService.NotificationDelete(data);
        }
    }
}
