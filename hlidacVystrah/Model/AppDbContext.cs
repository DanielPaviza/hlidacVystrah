
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using System.Xml.Linq;

namespace hlidacVystrah.Model
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<EventLocalityTable> EventLocality { get; set; }
        public DbSet<EventTable> Event { get; set; }
        public DbSet<EventTypeTable> EventType { get; set; }
        public DbSet<LocalityTable> Locality { get; set; }
        public DbSet<RegionTable> Region { get; set; }
        public DbSet<SeverityTable> Severity { get; set; }
        public DbSet<CertaintyTable> Certainty { get; set; }
        public DbSet<UpdateTable> Update { get; set; }
        public DbSet<UrgencyTable> Urgency { get; set; }
        public DbSet<UserTable> User { get; set; }
        public DbSet<NotificationTable> Notification { get; set; }
        public DbSet<UserNotificationTable> UserNotification { get; set; }
        public DbSet<LogTable> Log { get; set; }
        public DbSet<LogTypeTable> LogType { get; set; }
        public DbSet<LogServiceTable> LogService { get; set; }
        public DbSet<AdminTable> Admin { get; set; }
    }
}