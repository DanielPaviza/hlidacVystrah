
using System.Xml.Linq;

namespace hlidacVystrah.Model
{
    public class UpdateCount
    {

        public SuccessCount Locality { get; set; } = new();

        public SuccessCount Region { get; set; } = new();

        public SuccessCount Event { get; set; } = new();

        public SuccessCount EventLocality { get; set; } = new();

    }
}