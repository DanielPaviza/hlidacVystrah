
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class LogsFilterOptionsResponse : BaseResponse
    {
        public List<LogTypeTable> LogTypes { get; set; } = new();
        
        public List<LogServiceTable> LogServices { get; set; } = new();
    }
}