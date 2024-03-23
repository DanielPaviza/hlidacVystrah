
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("locality")]
    public class LocalityTable
    {
        [Key]
        public int id { get; set; }

        public int id_region { get; set; }

        public string name { get; set; }

    }
}