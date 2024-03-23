
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("event")]
    public class EventTable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public int id_event_type { get; set; }

        public int id_severity { get; set; }

        public int id_certainty { get; set; }

        public int id_urgency { get; set; }

        public string onset { get; set; }

        public string? expires { get; set; }

        public string description { get; set; }

        public string instruction { get; set; }

        public int id_update { get; set; }
    }
}