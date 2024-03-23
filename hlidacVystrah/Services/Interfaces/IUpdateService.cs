using hlidacVystrah.Model.Response;

namespace hlidacVystrah.Services.Interfaces
{
    public interface IUpdateService
    {
        ParseResponse UpdateEvents(string token);

        UpdateListResponse GetList(UpdateListDto? data);
    }
}
