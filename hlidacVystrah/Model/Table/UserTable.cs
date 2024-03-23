
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{

    [Table("user")]
    public class UserTable
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public string email { get; set; }

        public string password { get; set; }

        public bool isActive { get; set; }

        public string? password_reset_token { get; set; } = null;

        public DateTime? password_reset_token_expire { get; set; } = null;

        public string activation_token { get; set; }

        public string? login_token { get; set; }

        public DateTime? login_token_expire { get; set; }

        public DateTime created_at {  get; set; }
    }
}