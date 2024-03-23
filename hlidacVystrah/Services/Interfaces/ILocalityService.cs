using hlidacVystrah.Model.Response;

namespace hlidacVystrah.Services.Interfaces
{
    public interface ILocalityService
    {
        LocalityListResponse GetLocalityList();

        LocalityDetailResponse GetLocalityDetail(int id);
    }
}
