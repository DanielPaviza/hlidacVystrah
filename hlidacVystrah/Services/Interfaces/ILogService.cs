using hlidacVystrah.Model;
using hlidacVystrah.Model.Dto;
using hlidacVystrah.Model.Response;

namespace hlidacVystrah.Services.Interfaces
{
    public interface ILogService
    {
        string Service { get; set; }

        void WriteInfo(string text, string name);
        void WriteError(string text, string name);
        void WriteSuccess(string text, string name);
        void WriteSuccessDev(string text, string name);
        void WriteInfoDev(string text, string name);
    }
}
