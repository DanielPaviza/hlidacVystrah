
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("log_service")]
    public class LogServiceTable
    {
        [Key]
        public string id { get; set; }
    }
}