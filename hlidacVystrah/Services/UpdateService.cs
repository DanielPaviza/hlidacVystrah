
using hlidacVystrah.Model;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using hlidacVystrah.Model.Dto;
using System.Linq;
using System.Web;
using Newtonsoft.Json.Linq;

namespace hlidacVystrah.Services
{

    public class UpdateService : MasterService, IUpdateService
    {

        private IParseService _parseService;
        private readonly ILogService _logService;

        public UpdateService(AppDbContext context, IParseService parseService, ILogService logService) : base(context)
        {
            _context = context;
            _parseService = parseService;
            _logService = logService;
            _logService.Service = "UpdateService";
        }

        public ParseResponse UpdateEvents(string token) {

            string LOG_NAME = "UpdateEvents";

            string decodedToken = token.Replace(' ', '+');
            AdminTable admin = _context.Admin.FirstOrDefault(a => a.update_events_token == decodedToken && decodedToken != null);
            if (admin == null)
            {
                _logService.WriteError("Unauthorized. Invalid update token.", LOG_NAME);
                return new ParseResponse { ResponseCode = StatusCodes.Status401Unauthorized };
            }

            return _parseService.UpdateEvents();
        }

        private string GetDateFromTimestamp(string timestamp)
        {

            string[] dateSplit = timestamp.Split("T")[0].Split('-');
            string day = dateSplit[2].Length < 2 ? '0' + dateSplit[2] : dateSplit[2];

            return dateSplit[0] + '-' + dateSplit[1] + '-' + day;
        }

        public UpdateListResponse GetList(UpdateListDto? data)
        {
            string LOG_NAME = "GetList";

            try
            {

                UpdateTable? currentUpdate;

                if (data.Timestamp == null)
                {
                    currentUpdate = _context.Update.OrderByDescending(u => u.id).FirstOrDefault();

                } else
                {
                    try
                    {

                        currentUpdate = _context.Update.Where(u => u.timestamp == data.Timestamp).FirstOrDefault();

                        if(currentUpdate == null)
                        {
                            currentUpdate = _context.Update.OrderByDescending(u => u.id).AsEnumerable().Where(u =>
                                GetDateFromTimestamp(u.timestamp) == GetDateFromTimestamp(data.Timestamp)
                            ).FirstOrDefault();
                        }

                    } catch (Exception ex)
                    {
                        return new UpdateListResponse { ResponseCode = StatusCodes.Status400BadRequest };
                    }
                }

                if (currentUpdate == null)
                    return new UpdateListResponse { ResponseCode = StatusCodes.Status400BadRequest };

                int currentUpdateIndex = _context.Update.OrderByDescending(u => u.id).ToList().IndexOf(currentUpdate);
                int rowsToTakeFromEachSide = 3;

                int numOfSkippedRows = currentUpdateIndex - rowsToTakeFromEachSide;
                int numOfNextRowsToTake = rowsToTakeFromEachSide;
                if (numOfSkippedRows < 0)
                {
                    numOfNextRowsToTake = rowsToTakeFromEachSide + numOfSkippedRows;
                    numOfSkippedRows = 0;
                }

                List<UpdateDto> nextUpdates = _context.Update.OrderByDescending(u => u.id)
                .Skip(numOfSkippedRows).Take(numOfNextRowsToTake)
                .Select(u => new UpdateDto
                {
                    Timestamp = u.timestamp,
                    TimestampReadable = TimestampToReadable(u.timestamp)
                }).ToList();

                int numOfPreviousUpdatesToTake = (rowsToTakeFromEachSide * 2) - nextUpdates.Count;
                
                List<UpdateDto> previousUpdates = _context.Update.OrderByDescending(u => u.id)
                    .Skip(currentUpdateIndex + 1).Take(numOfPreviousUpdatesToTake)
                    .Select(u => new UpdateDto
                    {
                        Timestamp = u.timestamp,
                        TimestampReadable = TimestampToReadable(u.timestamp)
                    }).ToList();

                _logService.WriteSuccessDev("ok", LOG_NAME);

                return new UpdateListResponse { 
                    ResponseCode = StatusCodes.Status200OK,
                    PreviousUpdates = previousUpdates,
                    CurrentUpdate = new UpdateDto { Timestamp = currentUpdate.timestamp, TimestampReadable = TimestampToReadable(currentUpdate.timestamp)},
                    NextUpdates = nextUpdates
                };

            } catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new UpdateListResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public static string TimestampToReadable(string? timestamp)
        {

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
    }
}