
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class NotificationDeleteDto : LoginTokenDto
    {

        public int IdNotification { get; set; }
    }
}