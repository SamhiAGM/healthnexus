package com.healthconnect.auth;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${healthnexus.mail.sender-name:HealthNexus Support}")
    private String senderName;

    @Value("${healthnexus.mail.from-address:Healthnexus.support@gmail.com}")
    private String fromAddress;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Checks if outbound email delivery is configured in the current environment.
     */
    public boolean isConfigured() {
        return mailPassword != null && !mailPassword.trim().isBlank();
    }

    /**
     * Dispatches an account verification OTP email with responsive HealthNexus HTML branding.
     */
    public void sendVerificationOtp(String toEmail, String recipientName, String otp) {
        if (!isConfigured()) {
            log.warn("Attempted to send verification email to recipient, but SMTP credentials are unconfigured in this environment.");
            throw new IllegalStateException("Email delivery service is currently unconfigured. Please contact support or try again later.");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

            helper.setFrom(fromAddress, senderName);
            helper.setTo(toEmail.trim().toLowerCase());
            helper.setSubject("Verify Your HealthNexus Account");

            String htmlBody = buildOtpHtmlTemplate(recipientName, otp);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Verification OTP email dispatched successfully to recipient domain: {}", getEmailDomain(toEmail));
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to transmit verification email: {}", e.getMessage());
            throw new RuntimeException("Unable to deliver verification code. Please verify your email address or try again shortly.", e);
        }
    }

    private String getEmailDomain(String email) {
        if (email == null || !email.contains("@")) return "unknown";
        return email.substring(email.indexOf("@"));
    }

    /**
     * Generates responsive HTML email template using HealthNexus navy, white, and teal palette.
     */
    public String buildOtpHtmlTemplate(String recipientName, String otp) {
        String greeting = (recipientName != null && !recipientName.trim().isBlank())
                ? "Hello " + escapeHtml(recipientName.trim()) + ","
                : "Hello,";

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your HealthNexus Account</title>
              <style>
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070F1E; color: #E2E8F0; }
                .wrapper { width: 100%%; table-layout: fixed; background-color: #070F1E; padding: 40px 10px; }
                .main { background-color: #0B1730; margin: 0 auto; max-width: 580px; border-radius: 16px; border: 1px solid #1E293B; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .header { background: linear-gradient(135deg, #0B1730 0%%, #0F2347 100%%); padding: 32px 36px 24px 36px; border-bottom: 1px solid #1E293B; text-align: left; }
                .logo-text { font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; text-decoration: none; }
                .logo-highlight { color: #14B8A6; }
                .badge { display: inline-block; padding: 4px 12px; background-color: rgba(20, 184, 166, 0.15); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 9999px; color: #2DD4BF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 10px; }
                .content { padding: 36px; }
                .greeting { font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0; }
                .copy { font-size: 14px; line-height: 24px; color: #94A3B8; margin: 0 0 24px 0; }
                .otp-card { background: linear-gradient(180deg, #070F1E 0%%, #0A162B 100%%); border: 1px solid #14B8A6; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
                .otp-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #14B8A6; margin-bottom: 10px; }
                .otp-code { font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF; margin: 0; padding: 8px 0; text-indent: 12px; }
                .expiry-pill { display: inline-block; font-size: 12px; color: #CBD5E1; background-color: #1E293B; padding: 4px 12px; border-radius: 6px; margin-top: 12px; }
                .security-notice { background-color: rgba(15, 23, 42, 0.6); border-left: 3px solid #14B8A6; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 24px 0; }
                .security-notice p { margin: 0; font-size: 12px; line-height: 18px; color: #94A3B8; }
                .security-notice strong { color: #E2E8F0; }
                .footer { background-color: #050B15; padding: 24px 36px; border-top: 1px solid #1E293B; font-size: 12px; color: #64748B; line-height: 18px; text-align: center; }
                .footer a { color: #14B8A6; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <table class="main" width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="header">
                      <div class="logo-text">Health<span class="logo-highlight">Nexus</span></div>
                      <div class="badge">Official Verification Service</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="content">
                      <h1 class="greeting">%s</h1>
                      <p class="copy">
                        Thank you for using <strong>HealthNexus</strong>. To complete your account verification and secure your identity within the healthcare network, please enter the six-digit verification code below:
                      </p>
                      
                      <div class="otp-card">
                        <div class="otp-label">Your One-Time Passcode</div>
                        <div class="otp-code">%s</div>
                        <div class="expiry-pill">Expires in <strong>5 minutes</strong></div>
                      </div>
                      
                      <div class="security-notice">
                        <p>
                          <strong>Security Warning:</strong> For your security, never share this verification code with anyone. HealthNexus staff, clinicians, and administrators will <em>never</em> ask for your code.
                        </p>
                      </div>
                      
                      <p class="copy" style="font-size: 13px; margin-bottom: 24px;">
                        If you did not initiate this registration or account verification request, you can safely disregard this email or contact our support desk if you suspect unauthorized activity.
                      </p>
                      
                      <p class="copy" style="margin-bottom: 0; color: #CBD5E1;">
                        Regards,<br>
                        <strong>HealthNexus Support Team</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td class="footer">
                      <p style="margin: 0 0 8px 0;">This is an automated system notification. Please do not reply directly to this email.</p>
                      <p style="margin: 0;">&copy; 2026 HealthNexus Lanka. All rights reserved. • Ministry of Health Compliant</p>
                    </td>
                  </tr>
                </table>
              </div>
            </body>
            </html>
            """.formatted(greeting, otp);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
