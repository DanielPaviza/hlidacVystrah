
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model.Dto
{
    public class EventDto
    {

        public int? Id { get; set; }

        public string EventType { get; set; }

        public string Severity { get; set; }

        public string Certainty { get; set; }

        public string Onset { get; set; }

        public string? Expires { get; set; }

        public string Description { get; set; }

        public string Instruction { get; set; }

        public Dictionary<string, List<LocalityDto>> LocalityList { get; set; } = new();

        public string? ImgPath { get; set; }

        public string Urgency { get; set; }
    }
}