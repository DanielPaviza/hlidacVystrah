
using System.Xml.Linq;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Model.Response
{
    public class UserListResponse : BaseResponse
    {
        public List<UserDto> Users { get; set; } = new();

        public List<AdminDto> Admins { get; set; }
    }
}