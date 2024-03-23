
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class EventNotificationsDto
    {

        public EventDto Event { get; set; }

        public List<NotificationTable> Notifications { get; set; }
     }
}