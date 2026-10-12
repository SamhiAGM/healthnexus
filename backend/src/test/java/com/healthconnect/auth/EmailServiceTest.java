package com.healthconnect.auth;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender);
        ReflectionTestUtils.setField(emailService, "senderName", "HealthNexus Support");
        ReflectionTestUtils.setField(emailService, "fromAddress", "Healthnexus.support@gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPassword", "test_smtp_pass");
    }

    @Test
    @DisplayName("Email Template: Generates responsive HealthNexus HTML email with required security notices and OTP")
    void testBuildOtpHtmlTemplate() {
        String html = emailService.buildOtpHtmlTemplate("Dr. Samantha", "849201");

        assertNotNull(html);
        assertTrue(html.contains("HealthNexus"), "Must include HealthNexus branding");
        assertTrue(html.contains("Hello Dr. Samantha,"), "Must include personalized greeting");
        assertTrue(html.contains("849201"), "Must display the 6-digit OTP code");
        assertTrue(html.contains("5 minutes"), "Must state 5-minute expiration notice");
        assertTrue(html.contains("Security Warning:"), "Must include security warning not to share code");
        assertTrue(html.contains("HealthNexus Support Team"), "Must include HealthNexus Support Team signature");
        assertTrue(html.contains("automated system notification"), "Must state this is an automated message");
    }

    @Test
    @DisplayName("Email Dispatch: Successfully sends email when SMTP credentials configured")
    void testSendVerificationOtp_Success() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendVerificationOtp("patient@example.com", "Patient", "123456");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Email Dispatch: Fails safely when SMTP credentials unconfigured")
    void testSendVerificationOtp_Unconfigured_FailsSafely() {
        ReflectionTestUtils.setField(emailService, "mailPassword", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                emailService.sendVerificationOtp("patient@example.com", "Patient", "123456")
        );

        assertTrue(ex.getMessage().contains("Email delivery service is currently unconfigured"));
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
