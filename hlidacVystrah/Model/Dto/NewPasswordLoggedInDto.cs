
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model.Dto
{
    public class NewPasswordLoggedInDto: LoginTokenDto
    {
        public string Password {  get; set; }

        public string CurrentPassword { get; set; }
    }
}