
using System.Xml.Linq;

namespace hlidacVystrah.Model.Response
{
    public class ParseResponse : BaseResponse
    {
        public UpdateCount Count { get; set; } = new();
    }
}