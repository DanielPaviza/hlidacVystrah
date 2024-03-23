
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("notification")]
    public class NotificationTable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public int id_event_type { get; set; }

        public int? id_severity { get; set; }

        public int? id_certainty { get; set; }

        public int id_area { get; set; }

        public bool isRegion { get; set; }
    }
}