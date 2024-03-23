
using hlidacVystrah.Model;
using hlidacVystrah.Model.Dto;
using hlidacVystrah.Model.Response;
using hlidacVystrah.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace hlidacVystrah.Services
{

    public class LogService : MasterService, ILogService
    {

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _enviroment;
        private string session;

        public string Service { get; set; } = "LogService";


        public LogService(IWebHostEnvironment enviroment, AppDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _httpContextAccessor = httpContextAccessor;
            session = this.GenerateSessionNumber();
            _enviroment = enviroment;
            _context = context;
        }

        private void Write(string logType, string text, string name)
        {

            try
            {
                string? clientInfoString = null;
                var httpContext = _httpContextAccessor.HttpContext;

                if (httpContext != null)
                    clientInfoString = httpContext.Request.Headers["User-Agent"].ToString();

                _context.Log.Add(
                    new LogTable
                    {
                        id_log_type = logType,
                        id_log_service = this.Service,
                        name = name,
                        text = text,
                        client_info = clientInfoString,
                        session = this.session
                    }
                );
                _context.SaveChanges();
            } catch( Exception ex ) {
                //this.Write("Error", ex.Message, "Log write");
            }      
        }

        public void WriteInfo(string text, string name) {
            this.Write("Info", text, name);
        }

        public void WriteError(string text, string name) {
            this.Write("Error", text, name);
        }

        public void WriteSuccess(string text, string name) {
            this.Write("Success", text, name);
        }

        public void WriteSuccessDev(string text, string name)
        {
            if(_enviroment.IsDevelopment())
                this.Write("Success", ("DEV " + text), name);
        }

        public void WriteInfoDev(string text, string name)
        {
            if (_enviroment.IsDevelopment())
                this.Write("Info", ("DEV " + text), name);
        }

        private string GenerateSessionNumber(int length = 32)
        {
            byte[] randomBytes = new byte[length];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes);
        }

    }
}
