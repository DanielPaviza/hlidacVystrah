
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model.Dto
{
    public class UserDeleteDto : LoginTokenDto
    {
        public string Password {  get; set; }
    }
}