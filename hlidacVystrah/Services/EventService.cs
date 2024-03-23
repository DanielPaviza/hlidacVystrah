
using hlidacVystrah.Model;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using hlidacVystrah.Model.Dto;
using System.Linq;
using System.Web;
using Newtonsoft.Json.Linq;

namespace hlidacVystrah.Services
{

    public class EventService : MasterService, IEventService
    {

        private IParseService _parseService;
        private readonly ILogService _logService;

        public EventService(AppDbContext context, IParseService parseService, ILogService logService) : base(context)
        {
            _context = context;
            _parseService = parseService;
            _logService = logService;
            _logService.Service = "EventService";
        }

        private string TimestampToReadable(string? timestamp) {

            if (timestamp == null)
                return null;

            DateTimeOffset localTime = DateTimeOffset.Parse(timestamp);
            string readable = localTime.ToString();

            string date = readable.Split(' ')[0];
            string hours = readable.Split(" ")[1];
            hours = hours.Split(":")[0] + ':' + hours.Split(":")[1];

            //today
            if (localTime.Date == DateTimeOffset.Now.Date)
                return $"Dnes v {hours}";

            //yesterday
            if (localTime.Date == DateTimeOffset.Now.Date.AddDays(-1))
                return $"Včera v {hours}";

            return $"{date} {hours}"; ;
        }

        public EventListResponse GetEvents(string? updateTimestamp) {

            string LOG_NAME = "GetEvents";

            List<EventDto> events = new();
            UpdateTable? lastUpdate;

            try
            {
                
               if(updateTimestamp != null)
                {
                    string decodedTimestamp = updateTimestamp.Replace(' ', '+');
                    lastUpdate = _context.Update.Where(u => u.timestamp == decodedTimestamp).FirstOrDefault();
                    if (lastUpdate == null)
                    {
                        _logService.WriteInfoDev("Specific update was not found.", LOG_NAME);
                        return new EventListResponse { ResponseCode = StatusCodes.Status400BadRequest };
                    }
                } else
                {
                    lastUpdate = _context.Update.OrderByDescending(u => u.id).FirstOrDefault();
                    if (lastUpdate == null)
                    {
                        _logService.WriteInfoDev("No update yet, but ok.", LOG_NAME);
                        return new EventListResponse { ResponseCode = StatusCodes.Status200OK };
                    }
                }
                    
                List<IGrouping<int, EventLocalityTable>> eventsGrouped = _context.EventLocality
                    .Join(
                        _context.Event,
                        el => el.id_event,
                        e => e.id,
                        (el, e) => new { EventLocality = el, Event = e }
                    )
                    .Where(joined => joined.Event.id_update == lastUpdate.id)
                    .Select(joined =>joined.EventLocality)
                    .GroupBy(joined => joined.id_event)
                    .ToList();

                foreach (var _event in eventsGrouped)
                {

                    EventTable eventTable = _context.Event.Where(el => el.id == _event.Key).First();
                    EventDto eventDto = new EventDto
                    {
                        Id = _event.Key,
                        EventType = _context.EventType.Where(el => el.id == eventTable.id_event_type).First().name,
                        Severity = _context.Severity.Where(el => el.id == eventTable.id_severity).First().text,
                        Certainty = _context.Certainty.Where(el => el.id == eventTable.id_certainty).First().text,
                        Urgency = _context.Urgency.Where(el => el.id == eventTable.id_urgency).First().text,
                        Onset = TimestampToReadable(eventTable.onset),
                        Expires = TimestampToReadable(eventTable.expires),
                        Description = eventTable.description,
                        Instruction = eventTable.instruction,
                        ImgPath = _context.EventType.Where(el => el.id == eventTable.id_event_type).First().img_path
                    };

                    List<int> cisorps = new();
                    foreach (var locality in _event)
                    {
                        cisorps.Add(locality.id_locality);
                    }

                    Dictionary<string, List<LocalityDto>> localitiesGrouped = _context.Locality.Where(
                        el => cisorps.Contains(el.id)
                    ).GroupBy(el => _context.Region.First(r => r.id == el.id_region).name).ToList().ToDictionary(
                        group => group.Key,
                        group => group.Select(locality => new LocalityDto
                        {
                            Cisorp = locality.id,
                            Name = locality.name
                        }).ToList()
                    );

                    eventDto.LocalityList = localitiesGrouped;

                    events.Add(eventDto);
                }

                // order by severity id
                events = events.OrderByDescending(e => _context.Severity.First(s => s.text == e.Severity).id).ToList();

            } catch (Exception ex)
            {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new EventListResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            this._logService.WriteSuccessDev("DEV ok", LOG_NAME);
            return new EventListResponse
            {
                ResponseCode = StatusCodes.Status200OK,
                DataTimestamp = TimestampToReadable(lastUpdate.timestamp),
                Events = events
            };
        }

        public ParseResponse UpdateEvents(string token) {

            string LOG_NAME = "UpdateEvents";

            string decodedToken = token.Replace(' ', '+');
            AdminTable admin = _context.Admin.FirstOrDefault(a => a.update_events_token == decodedToken && decodedToken != null);
            if(admin == null)
            {
                _logService.WriteError("Unauthorized. Invalid update token.", LOG_NAME);
                return  new ParseResponse { ResponseCode = StatusCodes.Status401Unauthorized };
            }

            return _parseService.UpdateEvents();
        }
    }
}