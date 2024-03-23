
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class UpdateListResponse : BaseResponse
    {
       
        public List<UpdateDto> PreviousUpdates { get; set; } = new();

        public UpdateDto CurrentUpdate { get; set; } = new();

        public List<UpdateDto> NextUpdates { get; set; } = new();

    }
}