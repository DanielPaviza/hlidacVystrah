
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class NotificationAddDto : LoginTokenDto
    {

        public int IdEventType { get; set; }

        public int? IdSeverity { get; set; }

        public int? IdCertainty { get; set; }

        public string? IdArea { get; set; }

        public bool IsRegion { get; set; }
    }
}