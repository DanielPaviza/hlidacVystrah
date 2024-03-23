
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("log_type")]
    public class LogTypeTable
    {
        [Key]
        public string id { get; set; }

    }
}