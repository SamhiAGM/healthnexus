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
@SuppressWarnings({"null", "unused"})
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private AzureEmailSender azureEmailSender;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender, azureEmailSender);
        ReflectionTestUtils.setField(emailService, "senderName", "HealthNexus Support");
        ReflectionTestUtils.setField(emailService, "fromAddress", "Healthnexus.support@gmail.com");
        ReflectionTestUtils.setField(emailService, "mailPassword", "test_smtp_pass");
        ReflectionTestUtils.setField(emailService, "emailProvider", "gmail");
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
        assertFalse(html.contains("Ministry of Health Compliant"), "Must not include unsupported compliance claims");
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

    @Test
    @DisplayName("Email Provider: Azure selection delegates to the Azure sender")
    void testSendVerificationOtp_AzureProvider() {
        ReflectionTestUtils.setField(emailService, "emailProvider", "azure");
        when(azureEmailSender.isConfigured()).thenReturn(true);

        emailService.sendVerificationOtp("patient@example.com", "Patient", "123456");

        verify(azureEmailSender).send(eq("patient@example.com"), eq("Verify Your HealthNexus Account"), anyString(), contains("123456"));
        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("Email Provider: Azure selection fails when Azure configuration is missing")
    void testSendVerificationOtp_AzureProviderMissingConfiguration() {
        ReflectionTestUtils.setField(emailService, "emailProvider", "azure");
        when(azureEmailSender.isConfigured()).thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                emailService.sendVerificationOtp("patient@example.com", "Patient", "123456")
        );

        assertTrue(ex.getMessage().contains("Email delivery service is currently unconfigured"));
        verify(azureEmailSender, never()).send(anyString(), anyString(), anyString(), anyString());
        verifyNoInteractions(mailSender);
    }

    @Test
    @DisplayName("Email Provider: invalid provider value fails safely")
    void testSendVerificationOtp_InvalidProviderFailsSafely() {
        ReflectionTestUtils.setField(emailService, "emailProvider", "ses");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                emailService.sendVerificationOtp("patient@example.com", "Patient", "123456")
        );

        assertTrue(ex.getMessage().contains("Email provider configuration is invalid"));
        verifyNoInteractions(azureEmailSender);
        verifyNoInteractions(mailSender);
    }
}
