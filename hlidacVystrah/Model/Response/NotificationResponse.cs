
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class NotificationResponse : BaseResponse
    {

        public List<NotificationDto> Notifications { get; set; } = new();
    }
}