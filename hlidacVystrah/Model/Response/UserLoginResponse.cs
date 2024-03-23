
using System.Xml.Linq;

namespace hlidacVystrah.Model.Response
{
    public class UserLoginResponse : BaseResponse
    {
        public string? Email { get; set; } = null;

        public string? LoginToken { get; set; } = null;

        public bool IsActive { get; set; } = false;
    }
}