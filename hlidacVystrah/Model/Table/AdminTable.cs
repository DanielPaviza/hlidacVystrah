
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("admin")]
    public class AdminTable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public int id_user { get; set; }

        public string? update_events_token { get; set; } = null;

        public string? name { get; set; } = null;

    }
}