package com.healthconnect.auth;

import com.azure.communication.email.EmailClient;
import com.azure.communication.email.EmailClientBuilder;
import com.azure.communication.email.models.EmailMessage;
import com.azure.communication.email.models.EmailSendResult;
import com.azure.communication.email.models.EmailSendStatus;
import com.azure.core.util.polling.PollResponse;
import com.azure.core.util.polling.SyncPoller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;

/** Sends email through Azure Communication Services when explicitly enabled. */
@Component
public class AzureEmailSender {

    private static final Logger log = LoggerFactory.getLogger(AzureEmailSender.class);

    private final String connectionString;
    private final String senderAddress;
    private final Duration operationTimeout;
    private volatile EmailClient emailClient;

    @Autowired
    public AzureEmailSender(
            @Value("${healthnexus.mail.azure.connection-string:}") String connectionString,
            @Value("${healthnexus.mail.azure.sender-address:}") String senderAddress,
            @Value("${healthnexus.mail.azure.operation-timeout-seconds:30}") long operationTimeoutSeconds
    ) {
        this.connectionString = connectionString;
        this.senderAddress = senderAddress;
        this.operationTimeout = Duration.ofSeconds(Math.max(1, operationTimeoutSeconds));
    }

    AzureEmailSender(EmailClient emailClient, String senderAddress, Duration operationTimeout) {
        this.connectionString = "test-only";
        this.senderAddress = senderAddress;
        this.operationTimeout = operationTimeout;
        this.emailClient = emailClient;
    }

    public boolean isConfigured() {
        return hasText(connectionString) && hasText(senderAddress);
    }

    public void send(String toEmail, String subject, String plainText, String htmlBody) {
        if (!isConfigured()) {
            throw new IllegalStateException("Azure email delivery is currently unconfigured. Set AZURE_COMMUNICATION_CONNECTION_STRING and AZURE_EMAIL_SENDER_ADDRESS.");
        }

        try {
            EmailMessage message = new EmailMessage()
                    .setSenderAddress(senderAddress)
                    .setToRecipients(toEmail.trim().toLowerCase())
                    .setSubject(subject)
                    .setBodyPlainText(plainText)
                    .setBodyHtml(htmlBody);

            SyncPoller<EmailSendResult, EmailSendResult> poller = getEmailClient().beginSend(message);
            PollResponse<EmailSendResult> response = poller.waitForCompletion(operationTimeout);
            EmailSendResult result = response == null ? null : response.getValue();
            EmailSendStatus status = result == null ? null : result.getStatus();

            if (status == null || !EmailSendStatus.SUCCEEDED.equals(status)) {
                log.error("Azure email delivery did not succeed for recipient domain {}. Status: {}", getEmailDomain(toEmail), status);
                throw new IllegalStateException("Azure email delivery did not complete successfully.");
            }

            log.info("Verification OTP email dispatched through Azure to recipient domain: {}", getEmailDomain(toEmail));
        } catch (IllegalStateException e) {
            throw e;
        } catch (RuntimeException e) {
            log.error("Azure email delivery failed for recipient domain {}. Error type: {}",
                    getEmailDomain(toEmail), e.getClass().getSimpleName());
            throw new IllegalStateException("Unable to deliver verification code through Azure. Please try again shortly.");
        }
    }

    private EmailClient getEmailClient() {
        EmailClient current = emailClient;
        if (current == null) {
            synchronized (this) {
                current = emailClient;
                if (current == null) {
                    current = new EmailClientBuilder()
                            .connectionString(connectionString)
                            .buildClient();
                    emailClient = current;
                }
            }
        }
        return current;
    }

    private String getEmailDomain(String email) {
        if (email == null || !email.contains("@")) return "unknown";
        return email.substring(email.indexOf("@"));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
