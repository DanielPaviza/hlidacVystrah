
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class LogsResponse : BaseResponse
    {
        public List<LogTable> Logs { get; set; } = new();

        public int AllLogsCount { get; set; }

        public List<string> ServiceNames { get; set; } = new();

        public List<string> LogTypes { get; set; } = new();
    }
}