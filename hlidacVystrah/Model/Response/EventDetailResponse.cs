
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class EventDetailResponse : BaseResponse
    {
        public string? DataTimestamp { get; set; } = null;

        public EventDto Event { get; set; } = new();

    }
}