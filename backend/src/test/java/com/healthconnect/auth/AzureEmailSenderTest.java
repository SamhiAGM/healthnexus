package com.healthconnect.auth;

import com.azure.communication.email.EmailClient;
import com.azure.communication.email.models.EmailSendResult;
import com.azure.communication.email.models.EmailSendStatus;
import com.azure.core.util.polling.PollResponse;
import com.azure.core.util.polling.SyncPoller;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("unused")
class AzureEmailSenderTest {

    @Test
    @DisplayName("Azure email: successful terminal status is accepted")
    void sendsWhenAzureReportsSuccess() {
        EmailClient client = mock(EmailClient.class);
        @SuppressWarnings("unchecked")
        SyncPoller<EmailSendResult, EmailSendResult> poller = mock(SyncPoller.class);
        PollResponse<EmailSendResult> response = mock(PollResponse.class);
        EmailSendResult result = mock(EmailSendResult.class);

        when(client.beginSend(any())).thenReturn(poller);
        when(poller.waitForCompletion(any(Duration.class))).thenReturn(response);
        when(response.getValue()).thenReturn(result);
        when(result.getStatus()).thenReturn(EmailSendStatus.SUCCEEDED);

        AzureEmailSender sender = new AzureEmailSender(client, "DoNotReply@notify.lankacare.me", Duration.ofSeconds(30));
        sender.send("patient@example.com", "Verify Your HealthNexus Account", "OTP", "<p>OTP</p>");

        verify(client).beginSend(any());
        verify(poller).waitForCompletion(Duration.ofSeconds(30));
    }

    @Test
    @DisplayName("Azure email: failed terminal status is reported as a delivery error")
    void rejectsFailedAzureStatus() {
        EmailClient client = mock(EmailClient.class);
        @SuppressWarnings("unchecked")
        SyncPoller<EmailSendResult, EmailSendResult> poller = mock(SyncPoller.class);
        PollResponse<EmailSendResult> response = mock(PollResponse.class);
        EmailSendResult result = mock(EmailSendResult.class);

        when(client.beginSend(any())).thenReturn(poller);
        when(poller.waitForCompletion(any(Duration.class))).thenReturn(response);
        when(response.getValue()).thenReturn(result);
        when(result.getStatus()).thenReturn(EmailSendStatus.FAILED);

        AzureEmailSender sender = new AzureEmailSender(client, "DoNotReply@notify.lankacare.me", Duration.ofSeconds(30));

        assertNotNull(assertThrows(IllegalStateException.class, () ->
                sender.send("patient@example.com", "Subject", "OTP", "<p>OTP</p>")
        ));
    }

    @Test
    @DisplayName("Azure email: missing configuration fails before contacting Azure")
    void rejectsMissingConfiguration() {
        AzureEmailSender sender = new AzureEmailSender("", "", 30);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                sender.send("patient@example.com", "Subject", "OTP", "<p>OTP</p>")
        );

        assertEquals(
                "Azure email delivery is currently unconfigured. Set AZURE_COMMUNICATION_CONNECTION_STRING and AZURE_EMAIL_SENDER_ADDRESS.",
                exception.getMessage()
        );
    }

    @Test
    @DisplayName("Azure email: runtime errors return sanitized exception without propagating cause")
    void runtimeErrorsAreSanitized() {
        EmailClient client = mock(EmailClient.class);
        when(client.beginSend(any())).thenThrow(new RuntimeException("secret=abc123 otp=123456"));

        AzureEmailSender sender = new AzureEmailSender(client, "DoNotReply@notify.lankacare.me", Duration.ofSeconds(30));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                sender.send("patient@example.com", "Subject", "123456", "<p>123456</p>")
        );

        assertEquals("Unable to deliver verification code through Azure. Please try again shortly.", ex.getMessage());
        assertNull(ex.getCause());
    }
}
