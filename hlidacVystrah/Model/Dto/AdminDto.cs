
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class AdminDto
    {

        public int Id {  get; set; }
        public int IdUser { get; set; }
        public string Email { get; set; }
        public string? Name { get; set; } = null;
     }
}