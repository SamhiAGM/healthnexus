package com.healthconnect.auth;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    // Securely keyed hash of the 6-digit OTP (never store plaintext OTP)
    private String otpHash;

    private Instant expiresAt;

    private Instant lastSentAt;

    private int attempts;

    private int sendCount;

    private Instant windowStartTime;

    private boolean verified;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public EmailVerificationToken() {}

    public EmailVerificationToken(String email, String otpHash, Instant expiresAt) {
        this.email = email.trim().toLowerCase();
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.lastSentAt = Instant.now();
        this.attempts = 0;
        this.sendCount = 1;
        this.windowStartTime = Instant.now();
        this.verified = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public int getSendCount() { return sendCount; }
    public void setSendCount(int sendCount) { this.sendCount = sendCount; }

    public Instant getWindowStartTime() { return windowStartTime; }
    public void setWindowStartTime(Instant windowStartTime) { this.windowStartTime = windowStartTime; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
