using hlidacVystrah.Model.Dto;
using hlidacVystrah.Model.Response;
using Microsoft.AspNetCore.Mvc;

namespace hlidacVystrah.Services.Interfaces
{
    public interface IUserService
    {
        BaseResponse Register(EmailPasswordDto data);

        UserLoginResponse Login(EmailPasswordDto data);

        BaseResponse ResetPassword(EmailDto data);

        ActivateAccount ActivateAccount(ActivationTokenDto data);

        BaseResponse SetNewPassword(NewPasswordDto data);

        BaseResponse SetNewPasswordLoggedIn(NewPasswordLoggedInDto data);

        UserLoginResponse TokenLogin(LoginTokenDto data);

        BaseResponse DeleteAccount(UserDeleteDto data);

        EventNotificationOptionsResponse GetEventNotificationOptions();

        NotificationResponse GetEventNotifications(LoginTokenDto data);

        BaseResponse NotificationAdd(NotificationAddDto data);

        BaseResponse NotificationDelete(NotificationDeleteDto data);

        BaseResponse ReSendActivateAccountEmail(LoginTokenDto data);
    }
}
