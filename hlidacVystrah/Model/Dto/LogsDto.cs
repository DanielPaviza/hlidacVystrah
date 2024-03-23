
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model.Dto
{
    public class LogsDto : LoginTokenDto
    {

        public int PageSize { get; set; }

        public int PageNumber { get; set; }

        public string? FilterType { get; set; }

        public string? FilterService { get; set; }
    }
}