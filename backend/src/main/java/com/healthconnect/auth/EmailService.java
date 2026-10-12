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
            helper.setText(buildOtpPlainText(recipientName, otp), htmlBody);

            mailSender.send(message);
            log.info("Verification OTP email dispatched successfully to recipient domain: {}", getEmailDomain(toEmail));
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to transmit verification email: {}", e.getMessage());
            throw new RuntimeException("Unable to deliver verification code. Please verify your email address or try again shortly.", e);
        }
    }

    private String buildOtpPlainText(String recipientName, String otp) {
        String greeting = recipientName == null || recipientName.isBlank()
                ? "Hello," : "Hello " + recipientName.trim() + ",";
        return greeting + "\n\nYour HealthNexus verification code is " + otp
                + ". It expires in five minutes. Never share this code with anyone.\n\n"
                + "If you did not request this code, you can ignore this email.\n\nHealthNexus Support Team";
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
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F9FC; color: #172B4D; }
                .wrapper { width: 100%%; table-layout: fixed; background-color: #F6F9FC; padding: 40px 10px; }
                .main { background-color: #FFFFFF; margin: 0 auto; max-width: 580px; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 30px rgba(23,43,77,0.10); }
                .header { background: #FFFFFF; padding: 32px 36px 24px 36px; border-bottom: 1px solid #E2E8F0; text-align: left; }
                .logo-text { font-size: 24px; font-weight: 800; color: #172B4D; letter-spacing: -0.5px; text-decoration: none; }
                .logo-highlight { color: #0F766E; }
                .badge { display: inline-block; padding: 4px 12px; background-color: #EAFBF5; border: 1px solid #B7EEE0; border-radius: 9999px; color: #0F766E; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 10px; }
                .content { padding: 36px; }
                .greeting { font-size: 18px; font-weight: 700; color: #172B4D; margin: 0 0 16px 0; }
                .copy { font-size: 14px; line-height: 24px; color: #52657F; margin: 0 0 24px 0; }
                .otp-card { background: #F8FAFC; border: 1px solid #14B8A6; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
                .otp-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #0F766E; margin-bottom: 10px; }
                .otp-code { font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #172B4D; margin: 0; padding: 8px 0; text-indent: 12px; }
                .expiry-pill { display: inline-block; font-size: 12px; color: #52657F; background-color: #EAF5FF; padding: 4px 12px; border-radius: 6px; margin-top: 12px; }
                .security-notice { background-color: #F8FAFC; border-left: 3px solid #14B8A6; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 24px 0; }
                .security-notice p { margin: 0; font-size: 12px; line-height: 18px; color: #52657F; }
                .security-notice strong { color: #172B4D; }
                .footer { background-color: #F8FAFC; padding: 24px 36px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; line-height: 18px; text-align: center; }
                .footer a { color: #0F766E; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <table class="main" width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td class="header">
                      <div class="logo-text">Health<span class="logo-highlight">Nexus</span></div>
                      <div class="badge">Email verification</div>
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
