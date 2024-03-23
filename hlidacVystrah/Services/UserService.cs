
using hlidacVystrah.Model;
using System.Text;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using hlidacVystrah.Model.Dto;

namespace hlidacVystrah.Services
{

    public class UserService : MasterService, IUserService
    {

        IMailService _mailService;
        private int passwordMinLength = 6;
        private readonly ILogService _logService;


        public UserService(AppDbContext context, IMailService mailService, ILogService logService) : base(context)
        {
            _context = context;
            _mailService = mailService;
            _logService = logService;
            _logService.Service = "UserService";
        }

        public BaseResponse NotificationDelete(NotificationDeleteDto data)
        {

            string LOG_NAME = "NotificationDelete";

            try
            {
                UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
                if (authorizeTokenStatus != 200) {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new BaseResponse { ResponseCode = authorizeTokenStatus };
                }

                LOG_NAME += $" - User id: {user.id}";

                UserNotificationTable? userNotification = _context.UserNotification.FirstOrDefault(un =>
                    un.id == data.IdNotification
                );

                if(userNotification == null)
                {
                    this._logService.WriteInfo($"Notification id: {data.IdNotification} does not exist.", LOG_NAME);
                    return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
                }

                _context.UserNotification.Remove(userNotification);
                _context.SaveChanges();

                this._logService.WriteSuccess($"Deleted notification id: {userNotification.id}", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            } catch(Exception ex)
            {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public BaseResponse NotificationAdd(NotificationAddDto data)
        {

            string LOG_NAME = "NotificationAdd";

            try
            {
                UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
                int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
                if (authorizeTokenStatus != 200)
                {
                    this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                    return new BaseResponse { ResponseCode = authorizeTokenStatus };
                }

                LOG_NAME += $" - User id: {user.id}";

                if(data.IdArea == null)
                    return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };

                if (data.IsRegion)
                {

                    RegionTable region = _context.Region.FirstOrDefault(r => r.name == data.IdArea);
                    if (region == null)
                    {
                        this._logService.WriteInfo($"Attempt to add region that does not exist.", LOG_NAME);
                        return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
                    }

                    data.IdArea = region.id.ToString();
                }
                else
                {
                    if (!_context.Locality.Any(l => l.id == Int32.Parse(data.IdArea)))
                    {
                        this._logService.WriteInfo($"Attempt to add locality that does not exist.", LOG_NAME);
                        return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
                    }
                }

                NotificationTable notificationTable = new NotificationTable
                {
                    id_event_type = data.IdEventType,
                    id_severity = data.IdSeverity,
                    id_certainty = data.IdCertainty,
                    id_area = Int32.Parse(data.IdArea),
                    isRegion = data.IsRegion
                };

                UserNotificationTable userNotificationTable = new UserNotificationTable
                {
                    id_user = user.id
                };

                NotificationTable? matchingNotification = _context.Notification.FirstOrDefault(n =>
                    n.id_event_type == notificationTable.id_event_type &&
                    n.id_severity == notificationTable.id_severity &&
                    n.id_certainty == notificationTable.id_certainty &&
                    n.id_area == notificationTable.id_area &&
                    n.isRegion == notificationTable.isRegion
                );

                if (matchingNotification == null)
                {
                    _context.Notification.Add(notificationTable);
                    _context.SaveChanges();
                    this._logService.WriteInfo($"Notification did not yet exist. New one created with id: {notificationTable.id}.", LOG_NAME);
                    userNotificationTable.id_notification = notificationTable.id;
                } else
                {
                    
                    // if user has the same notification already tracked (duplicate)
                    if(_context.UserNotification.Any(un => 
                        un.id_user == user.id &&
                        un.id_notification == matchingNotification.id
                    ))
                    {
                        this._logService.WriteInfo($"User already tracks notification id: {matchingNotification.id}.", LOG_NAME);
                        return new BaseResponse { ResponseCode = StatusCodes.Status409Conflict };
                    }

                    userNotificationTable.id_notification = matchingNotification.id;
                }

                _context.UserNotification.Add(userNotificationTable);
                _context.SaveChanges();

                this._logService.WriteSuccess($"Added user_notification id: {userNotificationTable.id}", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            } catch (Exception ex)
            {
                this._logService.WriteError(ex.Message, LOG_NAME);
                if (ex.InnerException != null && ex.InnerException.Message.Contains("The INSERT statement conflicted with the FOREIGN KEY constraint"))
                {
                    
                    return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
                }
                else
                {
                    this._logService.WriteError(ex.Message, LOG_NAME);
                    return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
                }
            }
        }

        public NotificationResponse GetEventNotifications(LoginTokenDto data)
        {

            string LOG_NAME = "GetEventNotifications";

            UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
            int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
            if (authorizeTokenStatus != 200)
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new NotificationResponse { ResponseCode = authorizeTokenStatus };
            }

            LOG_NAME += $" - User id: {user.id}";

            try
            {
                List<UserNotificationTable> userNotificationTables = _context.UserNotification.Where(
                    un => un.id_user == user.id
                ).ToList();

                List<NotificationDto> userNotifications = new();

                foreach (UserNotificationTable unt in userNotificationTables)
                {

                    NotificationTable notification = _context.Notification.SingleOrDefault(n => n.id == unt.id_notification);
                    string area = notification.isRegion ? _context.Region.First(r => r.id == notification.id_area).name : _context.Locality.First(l => l.id == notification.id_area).name;
                    string? severity = _context.Severity.FirstOrDefault(s => s.id == notification.id_severity)?.text;
                    string? certainty = _context.Certainty.FirstOrDefault(c => c.id == notification.id_certainty)?.text;

                    userNotifications.Add(new NotificationDto
                    {
                        Id = unt.id,
                        EventType = _context.EventType.First(e => e.id == notification.id_event_type).name,
                        Severity = severity,
                        Certainty = certainty,
                        Area = area,
                        EventImg = _context.EventType.First(e => e.id == notification.id_event_type).img_path
                    });
                }

                this._logService.WriteSuccessDev($"ok", LOG_NAME);
                return new NotificationResponse { ResponseCode = StatusCodes.Status200OK, Notifications = userNotifications };
            }
            catch (Exception ex)
            {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new NotificationResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public EventNotificationOptionsResponse GetEventNotificationOptions()
        {

            string LOG_NAME = "GetEventNotificationOptions";

            try
            {
                List<EventTypeDto> eventTypeList = _context.EventType.Select(eventType => new EventTypeDto
                {
                    Id = eventType.id,
                    Name = eventType.name
                }).ToList();

                List<SeverityDto> severityList = _context.Severity.Select(severity => new SeverityDto
                {
                    Id = severity.id,
                    Text = severity.text
                }).ToList();

                List<certaintyDto> certaintyList = _context.Certainty.Select(certainty => new certaintyDto
                {
                    Id = certainty.id,
                    Text = certainty.text
                }).ToList();

                Dictionary<string, List<LocalityDto>> localityList = _context.Locality
                    .GroupBy(el => _context.Region.First(r => r.id == el.id_region).name).ToList()
                    .OrderBy(group => group.Key)
                    .ToDictionary(
                    group => group.Key,
                    group => group.Select(locality => new LocalityDto
                    {
                        Cisorp = locality.id,
                        Name = locality.name
                    }).ToList()
                );

                List<LocalityDto> localityList2 = _context.Locality.Select(locality => new LocalityDto
                {
                    Cisorp = locality.id,
                    Name = locality.name
                }).OrderBy(localityDto => localityDto.Name).ToList();


                _logService.WriteSuccessDev("ok", LOG_NAME);

                return new EventNotificationOptionsResponse
                {
                    ResponseCode = StatusCodes.Status200OK,
                    EventTypeList = eventTypeList,
                    SeverityList = severityList,
                    certaintyList = certaintyList,
                    LocalityList = localityList
                };

            } catch (Exception ex)
            {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new EventNotificationOptionsResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            } 
        }

        public BaseResponse DeleteAccount(UserDeleteDto data)
        {

            string LOG_NAME = "DeleteAccount";

            UserTable? user = _context.User.FirstOrDefault(u => 
                u.login_token == data.LoginToken &&
                u.password == this.HashPassword(data.Password)
            );
            int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
            if (authorizeTokenStatus != 200)
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new BaseResponse { ResponseCode = authorizeTokenStatus };
            }

            LOG_NAME += $" - User id: {user.id}";

            try
            {

                List<UserNotificationTable> userNotifications = _context.UserNotification.Where(un => user.id == un.id_user).ToList();
                _context.UserNotification.RemoveRange(userNotifications);
                _context.SaveChanges();
                _context.User.Remove(user);
                _context.SaveChanges();
            } catch(Exception ex) {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _logService.WriteSuccess($"Account deleted.", LOG_NAME);
            return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
        }

        public BaseResponse SetNewPasswordLoggedIn(NewPasswordLoggedInDto data)
        {

            string LOG_NAME = "SetNewPasswordLoggedIn";

            UserTable? user = _context.User.FirstOrDefault(u => 
                u.login_token == data.LoginToken &&
                u.password == this.HashPassword(data.CurrentPassword)
            );
            int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
            if (authorizeTokenStatus != 200)
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new BaseResponse { ResponseCode = authorizeTokenStatus };
            }

            LOG_NAME += $" - User id: {user.id}";

            if (data.Password.Length < passwordMinLength)
            {
                this._logService.WriteInfo($"Password too short.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
            }

            try
            {
                user.password = this.HashPassword(data.Password);
                _context.SaveChanges();

            } catch(Exception ex) {
                this._logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }


            this._logService.WriteSuccess("ok", LOG_NAME);
            return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
        }

        public BaseResponse SetNewPassword(NewPasswordDto data)
        {

            string LOG_NAME = "SetNewPassword";

            UserTable? user = _context.User.FirstOrDefault(u => u.password_reset_token == data.PasswordResetToken);

            if (user == null || user.password_reset_token_expire < DateTime.Now)
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status401Unauthorized };
            }

            LOG_NAME += $" - User id: {user.id}";

            if (data.Password.Length < passwordMinLength)
            {
                this._logService.WriteError($"Password too short", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
            }

            try
            {
                user.password = this.HashPassword(data.Password);
                user.password_reset_token = "";
                _context.SaveChanges();

            } catch(Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _logService.WriteSuccess("ok", LOG_NAME);
            return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
        }

        public ActivateAccount ActivateAccount(ActivationTokenDto data)
        {

            string LOG_NAME = "ActivateAccount";

            UserTable? user = _context.User.FirstOrDefault(u => u.activation_token == data.ActivationToken);
            if (user == null)
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new ActivateAccount { ResponseCode = StatusCodes.Status400BadRequest };
            }

            LOG_NAME += $" - User id: {user.id}";

            if (user.isActive) {
                this._logService.WriteInfo($"User already active.", LOG_NAME);
                return new ActivateAccount { ResponseCode = StatusCodes.Status400BadRequest };
            }

            try
            {
                user.isActive = true;
                _context.SaveChanges();
                this.UserSetNewLoginToken(user);
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new ActivateAccount { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _logService.WriteSuccess("ok", LOG_NAME);
            return new ActivateAccount { ResponseCode = StatusCodes.Status200OK, LoginToken = user.login_token };
        }

        public BaseResponse ResetPassword(EmailDto data)
        {

            string LOG_NAME = "ResetPassword";

            UserTable? user = _context.User.FirstOrDefault(u => u.email == data.Email.ToLower());
            if(user == null)
            {
                _logService.WriteInfo($"Non existing email", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
            }

            LOG_NAME += $" - User id: {user.id}";

            try
            {
                user.password_reset_token = this.GeneratePasswordResetToken();
                user.password_reset_token_expire = DateTime.Now.AddHours(24);
                _context.SaveChanges();
                _logService.WriteInfoDev("Password reset token generated", LOG_NAME);
            } catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            bool emailSent = _mailService.SendPasswordResetMail(user);
            if (!emailSent)
            {
                _logService.WriteError("Email send failed.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _logService.WriteSuccess("ok", LOG_NAME);
            return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
        }

        public UserLoginResponse Login(EmailPasswordDto data)
        {

            string LOG_NAME = "Login";

            UserTable user = _context.User.FirstOrDefault(u => u.email == data.Email.ToLower());
            if(user == null || user.password != this.HashPassword(data.Password))
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new UserLoginResponse { ResponseCode = StatusCodes.Status401Unauthorized };
            }

            LOG_NAME += $" - User id: {user.id}";

            if (user.login_token == null || user.login_token_expire < DateTime.Now)
            {
                try
                {
                    this.UserSetNewLoginToken(user);
                    _logService.WriteInfoDev("New login token set.", LOG_NAME);
                }
                catch (Exception ex)
                {
                    _logService.WriteError(ex.Message, LOG_NAME);
                    return new UserLoginResponse { ResponseCode = StatusCodes.Status500InternalServerError };
                }
            }

            _logService.WriteSuccess("ok", LOG_NAME);
            return new UserLoginResponse { ResponseCode = StatusCodes.Status200OK, Email = user.email, LoginToken = user.login_token, IsActive = user.isActive };
        }

        private void UserSetNewLoginToken(UserTable user)
        {
            user.login_token = this.GenerateLoginToken();
            user.login_token_expire = DateTime.Now.AddHours(3);
            _context.SaveChanges();
        }

        private int AuthorizeUserTokenStatusCode(UserTable? user)
        {
            if (user == null)
                return StatusCodes.Status401Unauthorized;

            if (user.login_token_expire < DateTime.Now)
                return 440;

            return StatusCodes.Status200OK;
        }

        public UserLoginResponse TokenLogin(LoginTokenDto data) 
        {

            string LOG_NAME = "TokenLogin";

            UserTable user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
            int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
            if (authorizeTokenStatus != 200)
            {
                //this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new UserLoginResponse { ResponseCode = authorizeTokenStatus };
            }

            LOG_NAME += $" - User id: {user.id}";

            try
            {
                user.login_token_expire = DateTime.Now.AddHours(3);
                _logService.WriteInfoDev("Login token expire extended by 3h", LOG_NAME);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new UserLoginResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }

            _logService.WriteSuccessDev("ok", LOG_NAME);
            return new UserLoginResponse { ResponseCode = StatusCodes.Status200OK, Email = user.email, IsActive = user.isActive };
        }
        public BaseResponse ReSendActivateAccountEmail(LoginTokenDto data)
        {

            string LOG_NAME = "ReSendActivateAccountEmail";

            UserTable? user = _context.User.FirstOrDefault(u => u.login_token == data.LoginToken);
            int authorizeTokenStatus = this.AuthorizeUserTokenStatusCode(user);
             if (authorizeTokenStatus != 200)
            {
                this._logService.WriteInfo($"Unauthorized access attempt.", LOG_NAME);
                return new UserLoginResponse { ResponseCode = authorizeTokenStatus };
            }

            LOG_NAME += $" - User id: {user.id}";

            bool emailSent = _mailService.SendRegistrationMail(user);
            if(emailSent)
            {
                this._logService.WriteSuccess($"ok", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            } else
            {
                _logService.WriteError("Email send failed.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        public BaseResponse Register(EmailPasswordDto data) {

            string LOG_NAME = "Register";
            string emailLower = data.Email.ToLower();

            // Return bad request if the email isnt the right format or if the password isnt at least 6 characters long
            if (!this.EmailIsValid(emailLower) || data.Password.Length < passwordMinLength)
            {
                this._logService.WriteInfo($"Invalid information. Either invalid email or password too short.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status400BadRequest };
            }

            LOG_NAME += $" - User email: {emailLower}";

            // Return 409 conflict if the email is already registered
            if (_context.User.Any(user => user.email == emailLower))
            {
                this._logService.WriteInfo($"Email is already registered.", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status409Conflict };
            }

            try
            {

                UserTable user = new UserTable
                {
                    email = emailLower,
                    password = this.HashPassword(data.Password),
                    isActive = false,
                    activation_token = this.GenerateActivationToken(),
                    created_at = DateTime.Now
                };

                _context.User.Add(user);
                _context.SaveChanges();
                _mailService.SendRegistrationMail(user);

                _logService.WriteSuccess("ok", LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status200OK };
            }
            catch (Exception ex)
            {
                _logService.WriteError(ex.Message, LOG_NAME);
                return new BaseResponse { ResponseCode = StatusCodes.Status500InternalServerError };
            }
        }

        private string GenerateActivationToken()
        {
            string token;
            do
            {
                token = this.GenerateToken();
            } while (_context.User.Any(u => u.activation_token == token));

            return token;
        }

        private string GenerateLoginToken()
        {
            string token;
            do
            {
                token = this.GenerateToken();
            } while (_context.User.Any(u => u.login_token == token));

            return token;
        }
        
        private string GeneratePasswordResetToken()
        {
            string token;
            do
            {
                token = this.GenerateToken();
            } while (_context.User.Any(u => u.password_reset_token == token));

            return token;
        }

        private string GenerateToken(int length = 32)
        {
            byte[] randomBytes = new byte[length];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                // ComputeHash - returns byte array
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));

                // Convert byte array to a string representation
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2")); // "x2" means hexadecimal format with two characters
                }

                return builder.ToString();
            }
        }

        private bool EmailIsValid(string email) {
            string emailPattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
            Regex regex = new Regex(emailPattern);

            return regex.IsMatch(email);
        }
    }
}