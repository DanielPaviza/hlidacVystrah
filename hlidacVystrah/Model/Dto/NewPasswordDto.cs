
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model.Dto
{
    public class NewPasswordDto
    {
        public string Password {  get; set; }

        public string PasswordResetToken { get; set; }

    }
}