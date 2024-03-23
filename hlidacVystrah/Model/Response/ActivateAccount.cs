
using System.Xml.Linq;

namespace hlidacVystrah.Model.Response
{
    public class ActivateAccount : BaseResponse
    {
        public string? LoginToken { get; set; } = null;
    }
}