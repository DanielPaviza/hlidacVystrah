using hlidacVystrah.Model;
using hlidacVystrah.Services;
using hlidacVystrah.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();

builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true) // Production settings
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true) // Development settings
    .AddEnvironmentVariables();

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(
    builder.Configuration.GetConnectionString("DefaultConnection")
    ), ServiceLifetime.Transient);

builder.Services.AddTransient<IEventService, EventService>();
builder.Services.AddTransient<IParseService, ParseService>();
builder.Services.AddTransient<ILocalityService, LocalityService>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IMailService, MailService>();
builder.Services.AddTransient<ILogService, LogService>();
builder.Services.AddTransient<IAdmService, AdmService>();
builder.Services.AddTransient<IUpdateService, UpdateService>();
builder.Services.AddHttpContextAccessor();
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.Configure<DownloadEventsEndpoint>(builder.Configuration.GetSection("DownloadEventsEndpoint"));
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Your API V1");
    });
} else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html"); ;

app.Run();
