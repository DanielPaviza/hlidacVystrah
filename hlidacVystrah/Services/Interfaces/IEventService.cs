using hlidacVystrah.Model.Response;

namespace hlidacVystrah.Services.Interfaces
{
    public interface IEventService
    {
        EventListResponse GetEvents(string? updateTimestamp = null);
    }
}
