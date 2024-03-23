
using System.Xml.Linq;
using hlidacVystrah.Model;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using hlidacVystrah.Model.Dto;
using Microsoft.Extensions.Options;

namespace hlidacVystrah.Services
{

    public class ParseService : MasterService, IParseService
    {

        private readonly IMailService _mailService;
        private readonly DownloadEventsEndpoint _downloadEventsEndpoint;
        private readonly ILogService _logService;

        public ParseService(AppDbContext context, IMailService mailService, IOptions<DownloadEventsEndpoint> downloadEventsEndpoint, ILogService logService) : base(context)
        {
            _context = context;
            _mailService = mailService;
            _downloadEventsEndpoint = downloadEventsEndpoint.Value;
            _logService = logService;
            _logService.Service = "ParseService";
        }

        private List<EventDto> GetReducedEvents(List<EventDto> events)
        {

            // FILTER EVENTS AND JOIN SIMILAR TOGETHER
            // some events differ only in description, localityList, onset
            List<EventDto> eventsReduced = new();
            foreach (EventDto e in events)
            {

                // event with the same properties
                EventDto? matchingEvent = eventsReduced.FirstOrDefault(reduced =>
                    reduced.EventType == e.EventType &&
                    reduced.Severity == e.Severity &&
                    reduced.Certainty == e.Certainty &&
                    reduced.Urgency == e.Urgency
                );

                if (matchingEvent == null)
                {
                    eventsReduced.Add(e);
                    continue;
                }

                // Expires is the latest value (or null)
                if (matchingEvent.Expires == null || (e.Expires != null && DateTimeOffset.Parse(matchingEvent.Expires) < DateTimeOffset.Parse(e.Expires)))
                {
                    matchingEvent.Expires = e.Expires;
                }

                // Joining locality list
                foreach (var location in e.LocalityList["all"])
                {
                    matchingEvent.LocalityList["all"].Add(location);
                }

                // Onset is the earlier one
                if (DateTimeOffset.Parse(matchingEvent.Onset) > DateTimeOffset.Parse(e.Onset))
                    matchingEvent.Onset = e.Onset;

                // Take the longer description
                if(matchingEvent.Description.Length > e.Description.Length)
                    matchingEvent.Description = e.Description;
            }

            return eventsReduced;
        }

        public ParseResponse UpdateEvents()
        {

            string LOG_NAME = "UpdateEvents";
            this._logService.WriteInfoDev("Start", LOG_NAME);

            bool saveToDb = true; // testing purposes
            string dataUrl = this._downloadEventsEndpoint.Url;
            
            try
            {
                XDocument xdoc = XDocument.Load(dataUrl);
                XElement root = xdoc.Root;

                string dataTimestamp = GetElementValue(root, "sent");

                // if already saved, dont save again
                if(saveToDb)
                    if (_context.Update.Any(el => el.timestamp == dataTimestamp))
                    {
                        this._logService.WriteSuccess("No new data, but ok.", LOG_NAME);
                        return new ParseResponse { ResponseCode = StatusCodes.Status200OK };
                    }

                // add update record
                UpdateTable update = new UpdateTable { timestamp = dataTimestamp };
                _context.Update.Add(update);
                if (saveToDb)
                {
                    this._logService.WriteInfo($"Update {dataTimestamp} added.", LOG_NAME);
                    _context.SaveChanges();
                }

                // Get all events from the xml
                List<EventDto> events = root.Descendants().Where(
                    el =>
                        GetElName(el) == "info" &&
                        GetElementValueLower(el, "language") == "cs" &&
                        GetElementValueLower(el, "responseType") != "none"
                ).Select(_event => new EventDto
                {
                    EventType = GetEventId(_event),
                    Severity = GetElementValue(_event, "severity"),
                    Certainty = GetElementValue(_event, "certainty"),
                    Urgency = GetElementValue(_event, "urgency"),
                    Onset = GetElementValue(_event, "onset"),
                    Expires = GetEventEndingTime(_event),
                    Description = GetElementValue(_event, "description"),
                    Instruction = GetElementValue(_event, "instruction"),
                    LocalityList = this.GetEventLocalityList(_event),
                    ImgPath = _context.EventType.First(et => et.id == Int32.Parse(GetEventId(_event))).img_path
                }).ToList();

                // Reduce events (join similar together)
                events = this.GetReducedEvents(events);

                UpdateCount count = new();
                if (saveToDb)
                {
                    count = this.SaveEventRecords(events, update.id);
                    this._logService.WriteInfo($"Event records saved. Events added: {count.Event.Success}, failed: {count.Event.Failed}", LOG_NAME);
                }

                this.SendEventNotificationsEmails(events);

                this._logService.WriteSuccess("ok", LOG_NAME);
                return new ParseResponse { ResponseCode = StatusCodes.Status200OK, Count = count };
            }
            catch (Exception e)
            {
                this._logService.WriteError(e.Message, LOG_NAME);
                return new ParseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        private bool SendEventNotificationsEmails(List<EventDto> events)
        {

            string LOG_NAME = "SendEventNotificationsEmails";
            this._logService.WriteInfo("Start", LOG_NAME);

            // for each event, save all fitting user notifications
            foreach (EventDto e in events)
            {

                // user email with matching tracked event (user_notification)
                var userNotifications = _context.UserNotification
                    .Join(
                        _context.Notification,
                        un => un.id_notification,
                        n => n.id,
                        (un, n) => new { UserNotification = un, Notification = n }
                    )
                    .Join(
                        _context.User,
                        un => un.UserNotification.id_user,
                        u => u.id,
                        (un, u) => new { User = u, un.Notification }
                    )
                    .Where(joined =>
                        joined.Notification.id_event_type == Int32.Parse(e.EventType) &&
                        (joined.Notification.id_severity == null || joined.Notification.id_severity == _context.Severity.First(saved => saved.name == e.Severity).id) &&
                        (joined.Notification.id_certainty == null || joined.Notification.id_certainty == _context.Certainty.First(saved => saved.name == e.Certainty).id)
                    )
                    .AsEnumerable()
                    .Where(joined =>
                        (joined.Notification.isRegion) ?
                        e.LocalityList["all"].Any(el => _context.Locality.First(l => l.id == el.Cisorp).id_region == joined.Notification.id_area)
                        :
                        e.LocalityList["all"].Any(item => item.Cisorp == joined.Notification.id_area) 
                    )
                    .GroupBy(joined => joined.User.email)
                    .Select(group => new
                    {
                        UserEmail = group.Key,
                        Notifications = group.Select(item => item.Notification).ToList()
                    })
                    .ToList();

                EventDto eventDtoReadable = new EventDto
                {
                    EventType = _context.EventType.First(et => et.id == Int32.Parse(e.EventType)).name,
                    Severity = _context.Severity.First(s => s.name == e.Severity).text,
                    Certainty = _context.Certainty.First(c => c.name == e.Certainty).text,
                    Urgency = _context.Urgency.First(u => u.name == e.Urgency).text,
                    Onset = this.TimestampToReadable(e.Onset),
                    Expires = this.TimestampToReadable(e.Expires),
                    Description = e.Description,
                    Instruction = e.Instruction,
                    ImgPath = e.ImgPath
                };

                foreach (var userNotification in userNotifications)
                {
                    string userEmail = userNotification.UserEmail;
                    foreach (var notification in userNotification.Notifications)
                    {

                        string areaName;
                        if (notification.isRegion)
                        {
                            areaName = _context.Region.First(r => r.id == notification.id_area).name;
                        }
                        else
                        {
                            LocalityTable locality = _context.Locality.First(l => l.id == notification.id_area);
                            areaName = locality.name + ", " + _context.Region.First(r => r.id == locality.id_region).name;
                        }

                        this._mailService.SendEventNotificationMailAsync(userEmail, eventDtoReadable, areaName);
                    }
                }
            }

            this._logService.WriteSuccess("Emails sent", LOG_NAME);

            return true;
        }

        private string TimestampToReadable(string? timestamp)
        {
            if (timestamp == null)
                return "";

            DateTimeOffset localTime = DateTimeOffset.Parse(timestamp);
            return localTime.ToString("dd.MM.yyyy HH:mm:ss");
        }

        private UpdateCount SaveEventRecords(List<EventDto> events, int updateId)
        {
            UpdateCount count = new();

            foreach (EventDto _eventDto in events)
            {
                EventTable _event = new EventTable
                {
                    id_event_type = Int32.Parse(_eventDto.EventType),
                    id_severity = _context.Severity.First(saved => saved.name == _eventDto.Severity).id,
                    id_certainty = _context.Certainty.First(saved => saved.name == _eventDto.Certainty).id,
                    id_urgency = _context.Urgency.First(saved => saved.name == _eventDto.Urgency).id,
                    onset = _eventDto.Onset,
                    expires = _eventDto.Expires,
                    description = _eventDto.Description,
                    instruction = _eventDto.Instruction,
                    id_update = updateId
                };

                // event record duplicate
                if (_context.Event.Local.Any(saved => saved == _event))
                {
                    count.Event.Failed++;
                    continue;
                }

                _context.Event.Add(_event);
                _context.SaveChanges();
                count.Event.Success++;

                foreach (LocalityDto locality in _eventDto.LocalityList["all"])
                {
                    try
                    {
                        _context.EventLocality.Add(new EventLocalityTable
                        {
                            id_event = _event.id,
                            id_locality = locality.Cisorp
                        });
                        count.EventLocality.Success++;
                    }
                    catch
                    {
                        count.EventLocality.Failed++;
                    }
                }

                _context.SaveChanges();
            }

            return count;
        }

        public ParseResponse SaveLocalityList() {

            string xmlPath = "D:\\moje\\programovani\\absolutorium\\random\\kraje_okresy.xml";

            string LOG_NAME = $"SaveLocalityList from {xmlPath}";

            UpdateCount count = new();

            try {

                XDocument xdoc = XDocument.Load(xmlPath);
                XElement root = xdoc.Root;

                List<XElement> polozky = root.Descendants().First(
                    el => GetElName(el) == "data"
                ).Descendants().Where(
                    el => GetElName(el) == "polozka"
                ).ToList();

                foreach (XElement polozka in polozky)
                {

                    List<XElement> vazby = polozka.Descendants().Where(
                        el => GetElName(el) == "polvaz"
                    ).ToList();

                    XElement locality = vazby[0];
                    XElement region = vazby[1];

                    int id;
                    if (!int.TryParse(GetElementValue(locality, "chodnota"), out id))
                    {
                        count.Locality.Failed++;
                        continue;
                    }

                    int idRegion;
                    if (!int.TryParse(GetElementValue(region, "chodnota"), out idRegion))
                    {
                        count.Locality.Failed++;
                        continue;
                    }

                    // if locality is already tracked (or in db), don't add it again
                    if (
                        _context.Locality.Local.Any(r => r.id == id) ||
                        _context.Locality.Any(r => r.id == id)
                       )
                    {
                        count.Locality.Failed++;
                        continue;
                    }

                    _context.Locality.Add(new LocalityTable
                    {
                        id = id,
                        id_region = idRegion,
                        name = GetElementValue(locality, "text")
                    });
                    count.Locality.Success++;
                }
            } catch (Exception ex) {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new ParseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _context.SaveChanges();
            this._logService.WriteSuccess($"Locality list saved. Success: {count.Locality.Success}, Failed: {count.Locality.Failed}", LOG_NAME);

            return new ParseResponse { ResponseCode = StatusCodes.Status200OK, Count = count };
        }

        private ParseResponse SaveRegions() {

            string xmlPath = "D:\\moje\\programovani\\absolutorium\\random\\kraje_okresy.xml";

            string LOG_NAME = $"SaveRegions from {xmlPath}";

            UpdateCount count = new();

            try
            {

                // Load the XML file using XDocument
                XDocument xdoc = XDocument.Load(xmlPath);
                XElement root = xdoc.Root;

                List<XElement> polozky = root.Descendants().First(
                    el => GetElName(el) == "data"
                ).Descendants().Where(
                    el => GetElName(el) == "polozka"
                ).ToList();

                foreach (XElement polozka in polozky)
                {

                    XElement region = polozka.Descendants().Where(
                        el => GetElName(el) == "polvaz"
                    ).ToList()[1];

                    int id;
                    if (!int.TryParse(GetElementValue(region, "chodnota"), out id))
                    {
                        count.Region.Failed++;
                        continue;
                    }

                    // if region is already tracked (or in db), don't add it again
                    if (
                        _context.Region.Local.Any(r => r.id == id) ||
                        _context.Region.Any(r => r.id == id)
                       ) 
                    {
                        count.Region.Failed++;
                        continue;
                    }

                    _context.Region.Add(new RegionTable
                    {
                        id = id,
                        name = GetElementValue(region, "text")
                    });
                    count.Region.Success++;
                }
            }
            catch (Exception ex)
            {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new ParseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _context.SaveChanges();
            this._logService.WriteSuccess($"Regions saved. Success: ${count.Region.Success}, Failed: ${count.Region.Failed}", LOG_NAME);

            return new ParseResponse { ResponseCode = StatusCodes.Status200OK, Count = count };
        }

        private Dictionary<string, List<LocalityDto>> GetEventLocalityList(XElement _event) {

            List<XElement> areas = _event.Descendants().Where(
                el => GetElName(el) == "area"
            ).ToList();

            Dictionary<string, List<LocalityDto>> localityList = new Dictionary<string, List<LocalityDto>>();

            localityList["all"] = areas.Descendants().Where(
                area => GetElName(area) == "geocode"
            ).Select(locality => new LocalityDto
            {
                Cisorp = Int32.Parse(GetElementValue(locality, "value"))
            })
            .ToList();

            return localityList;
        }

        private string GetElName(XElement el)
        {
            return el.Name.LocalName.ToLower();
        }

        private string? GetElementValueLower(XElement el, string name)
        {
            return GetElementValue(el, name)?.ToLower();
        }
        private string? GetElementValue(XElement el, string name)
        {
            return el.Descendants().FirstOrDefault(el => GetElName(el) == name.ToLower())?.Value;
        }
        private string GetEventId(XElement _event)
        {

            List<XElement> parameters = GetParameters(_event);
            foreach (var parameter in parameters)
            {
                if (GetElementValueLower(parameter, "valueName") == "awareness_type")
                    return GetElementValueLower(parameter, "value").Split(';')[0];
            }

            return "-1";
        }

        private string? GetEventEndingTime(XElement _event)
        {

            List<XElement> parameters = GetParameters(_event);
            foreach (var parameter in parameters)
            {
                if (GetElementValueLower(parameter, "valueName") == "eventendingtime")
                    return GetElementValueLower(parameter, "value");
            }

            return null;
        }

        private List<XElement> GetParameters(XElement _event)
        {
            return _event.Descendants().Where(
                el => GetElName(el) == "parameter"
            ).ToList();
        }
    }
}