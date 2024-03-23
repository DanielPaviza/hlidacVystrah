
using hlidacVystrah.Model;
using hlidacVystrah.Model.Dto;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace hlidacVystrah.Services
{

    public class AdmService : MasterService, IAdmService
    {
        private readonly ILogService _logService;

        public AdmService(AppDbContext context, ILogService logService) : base(context)
        {
            _context = context;
            _logService = logService;
            _logService.Service = "AdmService";
        }

        public BaseResponse TokenLogin([FromBody] LoginTokenDto data)
        {

            string LOG_NAME = "TokenLogin";

            try
            {

                UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(user);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new BaseResponse { ResponseCode = authorizeAdminStatusCode };
                }

                _logService.WriteSuccessDev("ok", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };

            } catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public BaseResponse UserDelete(AdminUserDto data)
        {
            string LOG_NAME = "UserDelete";

            try
            {
                UserTable admin = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(admin);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new BaseResponse { ResponseCode = authorizeAdminStatusCode };
                }

                UserTable? user = _context.User.FirstOrDefault(u => u.id == data.Id);
                if (user == null || _context.Admin.Any(a => a.id_user == user.id))
                    return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };

                List<UserNotificationTable> userNotifications = _context.UserNotification.Where(un => un.id_user == user.id).ToList();
                _context.UserNotification.RemoveRange(userNotifications);
                _context.SaveChanges();

                _context.User.Remove(user);
                _context.SaveChanges();
                _logService.WriteSuccess($"Administrator id {_context.Admin.First(a => a.id_user == admin.id).id} deleted user {user.email} and all users notifications.", LOG_NAME);

                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public BaseResponse UserMakeAdmin(AdminUserDto data)
        {

            string LOG_NAME = "UserMakeAdmin";

            try
            {
                UserTable admin = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(admin);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new BaseResponse { ResponseCode = authorizeAdminStatusCode };
                }

                UserTable? user = _context.User.FirstOrDefault(u => u.id == data.Id);
                if(user == null)
                    return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };

                _context.Admin.Add(new AdminTable
                {
                    id_user = user.id
                });
                _context.SaveChanges();

                _logService.WriteSuccess($"User id {user.id} is now administrator.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public BaseResponse UserRemoveAdmin(AdminUserDto data)
        {
            string LOG_NAME = "UserRemoveAdmin";

            try
            {
                UserTable loggedAdmin = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(loggedAdmin);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new BaseResponse { ResponseCode = authorizeAdminStatusCode };
                }

                AdminTable? admin = _context.Admin.FirstOrDefault(a => a.id == data.Id);
                if (admin == null || admin.update_events_token != null)
                    return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };

                _context.Admin.Remove(admin);
                _context.SaveChanges();

                _logService.WriteSuccess($"Administrator rights removed from user {admin.id_user}.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public UserListResponse GetUserList(LoginTokenDto data)
        {

            string LOG_NAME = "GetUserList";

            try
            {
                UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(user);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new UserListResponse { ResponseCode = authorizeAdminStatusCode };
                }

                List<AdminDto> adminList = _context.Admin.Select(a =>
                        new AdminDto { 
                            Id = a.id, 
                            IdUser = a.id_user, 
                            Name = a.name, 
                            Email = _context.User.First(u => u.id == a.id_user).email
                        }
                ).ToList();

                List<UserDto> list = _context.User.Select(u =>
                        new UserDto
                        {
                            Id = u.id,
                            Email = u.email,
                            IsActive = u.isActive,
                            CreatedAt = u.created_at.ToShortDateString() + " " + u.created_at.ToLongTimeString()
                        }
                ).ToList();

                return new UserListResponse
                {
                    ResponseCode = StatusCodes.Status200OK,
                    Admins = adminList,
                    Users = list
                };
            } catch( Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new UserListResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        private int AuthorizeUserAdminStatusCode(UserTable? user)
        {
            if (user == null || !_context.Admin.Any(a => a.id_user == user.id))
                return StatusCodes.Status401Unauthorized;

            if (user.login_token_expire < DateTime.Now)
                return 440;

            return StatusCodes.Status200OK;
        }

        public LogsResponse GetLogs(LogsDto data)
        {

            string LOG_NAME = "GetLogs";

            try
            {

                UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(user);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new LogsResponse { ResponseCode = authorizeAdminStatusCode };
                }

                AdminTable admin = _context.Admin.First(a => a.id_user == user.id);

                LOG_NAME += $" - Admin '{admin.name}' id: ({admin.id})";

                if (data.PageSize < 1 || data.PageNumber < 1)
                {
                    _logService.WriteError("PageSize or PageNumber is negative.", LOG_NAME);
                    return new LogsResponse { ResponseCode = StatusCodes.Status400BadRequest };
                }

                if((data.FilterType != null && !_context.LogType.Any(lt => lt.id == data.FilterType)) || (data.FilterService != null && !_context.LogService.Any(ls => ls.id == data.FilterService)))
                {
                    _logService.WriteError("Invalid filter", LOG_NAME);
                    return new LogsResponse { ResponseCode = StatusCodes.Status400BadRequest };
                }

                List<LogTable> filteredLogs = _context.Log.Where(l =>
                    (data.FilterType == null || l.id_log_type == data.FilterType) &&
                    (data.FilterService == null || l.id_log_service == data.FilterService)
                ).ToList(); 

                int allLogsCount = filteredLogs.Count();
                int recordsToSkip = (data.PageNumber - 1) * data.PageSize;
                List<LogTable> paginatedLogs = filteredLogs.OrderByDescending(log => log.timestamp)
                                         .Skip(recordsToSkip)
                                         .Take(data.PageSize)
                                         .ToList();

                List<string> serviceNames = _context.LogService.ToList().Select(ls => ls.id).ToList();
                List<string> logTypes = _context.LogType.ToList().Select(lt => lt.id).ToList();

                _logService.WriteSuccessDev("ok", LOG_NAME);
                return new LogsResponse
                {
                    ResponseCode = StatusCodes.Status200OK,
                    Logs = paginatedLogs,
                    AllLogsCount = allLogsCount,
                    ServiceNames = serviceNames,
                    LogTypes = logTypes
                };
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new LogsResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public LogsFilterOptionsResponse GetLogsFilterOptions(LoginTokenDto data)
        {

            string LOG_NAME = "GetLogsFilterOptions";

            try
            {

                UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeAdminStatusCode = this.AuthorizeUserAdminStatusCode(user);
                if (authorizeAdminStatusCode != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new LogsFilterOptionsResponse { ResponseCode = authorizeAdminStatusCode };
                }

                AdminTable admin = _context.Admin.First(a => a.id_user == user.id);

                LOG_NAME += $" - Admin '{admin.name}' id: ({admin.id})";

                List<LogTypeTable> logTypes = _context.LogType.ToList();
                List<LogServiceTable> logServices = _context.LogService.ToList();
                _logService.WriteSuccessDev("ok", LOG_NAME);

                return new LogsFilterOptionsResponse { ResponseCode = StatusCodes.Status200OK, LogServices = logServices, LogTypes = logTypes };
            }
            catch(Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new LogsFilterOptionsResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }
    }
}
