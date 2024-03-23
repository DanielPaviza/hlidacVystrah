
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class NotificationDto
    {

        public int Id { get; set; }

        public string EventType { get; set; }

        public string? Severity { get; set; }

        public string? Certainty { get; set; }

        public string Area { get; set; }

        public string? EventImg { get; set; }
     }
}