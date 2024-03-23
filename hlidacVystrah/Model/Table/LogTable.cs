
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("log")]
    public class LogTable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public string id_log_type {  get; set; }

        public string id_log_service { get; set; }

        public string name { get; set; }

        public string text { get; set; }

        public string session { get; set; }

        public string? client_info { get; set; } = null;

        public string timestamp { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");

    }
}