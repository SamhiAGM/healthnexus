package com.healthconnect.auth;

import com.healthconnect.auth.dto.RequestEmailOtpRequest;
import com.healthconnect.auth.dto.VerifyEmailOtpRequest;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@SuppressWarnings("null")
public class EmailOtpService {

    private static final Logger log = LoggerFactory.getLogger(EmailOtpService.class);

    private static final int OTP_EXPIRATION_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;
    private static final int MAX_SENDS_PER_HOUR = 5;

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String otpHmacSecret;

    @Autowired
    public EmailOtpService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            EmailService emailService,
            @Value("${lankacare.otp.hmac-secret:}") String otpHmacSecret
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.otpHmacSecret = otpHmacSecret;
    }

    EmailOtpService(EmailVerificationTokenRepository tokenRepository, UserRepository userRepository, EmailService emailService) {
        this(tokenRepository, userRepository, emailService, "unit-test-only-hmac-key-not-for-production");
    }

    /**
     * Issues and dispatches an email OTP code to the requested address.
     * Enforces hourly rate limits and a 60-second resend cooldown.
     */
    public void sendEmailOtp(RequestEmailOtpRequest request) {
        requireHmacSecret();
        String email = request.getEmail().trim().toLowerCase();
        Instant now = Instant.now();

        Optional<EmailVerificationToken> existingOpt = tokenRepository.findByEmail(email);
        EmailVerificationToken token;

        if (existingOpt.isPresent()) {
            token = existingOpt.get();

            // Check 60-second cooldown
            if (token.getLastSentAt() != null) {
                long elapsedSeconds = Duration.between(token.getLastSentAt(), now).getSeconds();
                if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
                    long waitSeconds = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
                    throw new IllegalStateException("Please wait " + waitSeconds + " seconds before requesting another code.");
                }
            }

            // Check hourly rate limit window
            if (token.getWindowStartTime() != null && Duration.between(token.getWindowStartTime(), now).toHours() < 1) {
                if (token.getSendCount() >= MAX_SENDS_PER_HOUR) {
                    throw new IllegalStateException("Hourly verification request limit reached. Please try again later.");
                }
                token.setSendCount(token.getSendCount() + 1);
            } else {
                token.setWindowStartTime(now);
                token.setSendCount(1);
            }
        } else {
            token = new EmailVerificationToken();
            token.setEmail(email);
            token.setWindowStartTime(now);
            token.setSendCount(1);
        }

        // Generate cryptographically random 6-digit OTP
        int code = 100000 + secureRandom.nextInt(900000);
        String otp = String.valueOf(code);

        // Store only the secure hash in MongoDB
        String hashedOtp = hashOtp(email, otp);
        token.setOtpHash(hashedOtp);
        token.setExpiresAt(now.plus(OTP_EXPIRATION_MINUTES, ChronoUnit.MINUTES));
        token.setLastSentAt(now);
        token.setAttempts(0);
        token.setVerified(false);

        // Determine recipient display name if not explicitly passed
        String recipientName = request.getRecipientName();
        if (recipientName == null || recipientName.isBlank()) {
            recipientName = userRepository.findByEmail(email)
                    .map(User::getFullName)
                    .orElse(null);
        }

        // Transmit HTML email
        emailService.sendVerificationOtp(email, recipientName, otp);

        // Persist the token only after SMTP accepts the message. If dispatch fails,
        // the user can retry immediately instead of being blocked by a stale cooldown.
        tokenRepository.save(token);
    }

    /**
     * Validates the 6-digit OTP against the securely keyed hash.
     * Enforces expiration, maximum 5 attempts, and one-time use.
     * Marks the user's email verified upon success.
     */
    public boolean verifyEmailOtp(VerifyEmailOtpRequest request) {
        requireHmacSecret();
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();
        Instant now = Instant.now();

        EmailVerificationToken token = tokenRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Verification code has expired or was not requested."));

        // Expiration check (5 minutes)
        if (token.getExpiresAt() == null || now.isAfter(token.getExpiresAt())) {
            tokenRepository.delete(token);
            throw new IllegalArgumentException("Verification code has expired. Please request a new code.");
        }

        // Max attempt check (5 attempts)
        if (token.getAttempts() >= MAX_ATTEMPTS) {
            tokenRepository.delete(token);
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new code.");
        }

        token.setAttempts(token.getAttempts() + 1);

        String inputHash = hashOtp(email, code);
        if (!MessageDigest.isEqual(inputHash.getBytes(StandardCharsets.US_ASCII), token.getOtpHash().getBytes(StandardCharsets.US_ASCII))) {
            tokenRepository.save(token);
            int remaining = MAX_ATTEMPTS - token.getAttempts();
            if (remaining > 0) {
                throw new IllegalArgumentException("Invalid verification code. " + remaining + " attempt(s) remaining.");
            } else {
                tokenRepository.delete(token);
                throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new code.");
            }
        }

        // One-time use enforcement: invalidate code immediately upon successful validation
        tokenRepository.delete(token);

        // Mark user email verified in database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Verification code has expired or was not requested."));
        user.setEmailVerified(true);
        user.setVerified(true);
        userRepository.save(user);
        log.info("Email address verified for account.");

        return true;
    }

    /**
     * Computes an HMAC-SHA-256 hash of the OTP scoped to its normalized email.
     */
    public String hashOtp(String email, String otp) {
        try {
            requireHmacSecret();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(otpHmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String combined = email.trim().toLowerCase() + ":" + otp.trim();
            return HexFormat.of().formatHex(mac.doFinal(combined.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Error computing OTP hash", e);
        }
    }

    private void requireHmacSecret() {
        if (otpHmacSecret == null || otpHmacSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("Email verification is unavailable because OTP_HMAC_SECRET is not configured.");
        }
    }
}
