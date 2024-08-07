using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Infrastructure.Data
{
    public class EmailRepository : IEmailRepository
    {
        private readonly IConfiguration _config;

        public EmailRepository(IConfiguration config)
        {
            _config = config;
        }
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var apiKey = _config["SendGrid:ApiKey"];
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("alexkotashvili@gmail.com", "Your App Name");
            var toEmail = new EmailAddress(to);
            var msg = MailHelper.CreateSingleEmail(from, toEmail, subject, body, body);

            var response = await client.SendEmailAsync(msg);
        }
    }
}