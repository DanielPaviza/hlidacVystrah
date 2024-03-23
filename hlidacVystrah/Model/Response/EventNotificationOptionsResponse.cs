
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class EventNotificationOptionsResponse : BaseResponse
    {

        public List<EventTypeDto> EventTypeList { get; set; } = new();

        public List<SeverityDto> SeverityList { get; set; } = new();

        public List<certaintyDto> certaintyList { get; set; } = new();

        public Dictionary<string, List<LocalityDto>> LocalityList { get; set; } = new();
    }
}