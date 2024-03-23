using hlidacVystrah.Model;
using hlidacVystrah.Model.Dto;
using hlidacVystrah.Model.Response;

namespace hlidacVystrah.Services.Interfaces
{
    public interface IMailService
    {
        bool SendRegistrationMail(UserTable user);

        bool SendPasswordResetMail(UserTable user);

        Task<bool> SendEventNotificationMailAsync(string email, EventDto eventDetail, string areaName);
    }
}
