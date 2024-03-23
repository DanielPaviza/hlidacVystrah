
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class LocalityDetailResponse : EventListResponse
    {

        public string? LocalityName { get; set; } = null;

        public string? RegionName { get; set; } = null;

        public int Cisorp {  get; set; }
    }
}