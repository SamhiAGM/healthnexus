package com.healthconnect.auth;

import com.healthconnect.auth.dto.ForgotPasswordRequest;
import com.healthconnect.auth.dto.ResetPasswordRequest;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.data.mongodb.MongoTransactionException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Manages secure password recovery operations with cryptographic code hashing,
 * 15-minute token TTL, rate limiting, anti-enumeration timing protection,
 * atomic MongoDB transaction execution with transient retry, safe version-aware compensation,
 * and reliable attempt counter persistence.
 */
@Service
@SuppressWarnings("null")
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    public static final int RECOVERY_CODE_EXPIRATION_MINUTES = 15;
    public static final int RESEND_COOLDOWN_SECONDS = 60;
    public static final int MAX_ATTEMPTS = 5;
    public static final int MAX_SENDS_PER_HOUR = 5;

    public enum ResetStatus {
        SUCCESS,
        INVALID_CODE,
        MAX_ATTEMPTS_EXCEEDED,
        EXPIRED,
        MISSING_TOKEN,
        ALREADY_USED,
        USER_NOT_FOUND
    }

    public record ResetOutcome(ResetStatus status, String message) {}

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final MongoTemplate mongoTemplate;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String otpHmacSecret;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            MongoTemplate mongoTemplate,
            @Value("${lankacare.otp.hmac-secret:}") String otpHmacSecret,
            @Autowired(required = false) @Qualifier("mongoTransactionManager") PlatformTransactionManager transactionManager
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.mongoTemplate = mongoTemplate;
        this.otpHmacSecret = otpHmacSecret;
        this.transactionTemplate = transactionManager != null ? new TransactionTemplate(transactionManager) : null;
    }

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            MongoTemplate mongoTemplate,
            String otpHmacSecret,
            TransactionTemplate transactionTemplate
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.mongoTemplate = mongoTemplate;
        this.otpHmacSecret = otpHmacSecret;
        this.transactionTemplate = transactionTemplate;
    }

    /**
     * Dispatches a 15-minute secure recovery code to registered email address.
     * Enforces rate limiting, resend cooldowns, and privacy-preserving user enumeration defense.
     */
    public Map<String, Object> sendRecoveryCode(ForgotPasswordRequest request) {
        requireHmacSecret();
        String email = normalizeEmail(request.getEmail());
        Instant now = Instant.now();

        // 1. Check email delivery configuration FIRST to ensure identical behavior for all emails
        if (!emailService.isConfigured()) {
            log.warn("Password reset requested, but email delivery provider is unconfigured in this environment.");
            throw new IllegalStateException("Email delivery service is currently unconfigured. Please contact support or try again later.");
        }

        // 2. Check existing token for resend cooldown and hourly rate limits
        Optional<PasswordResetToken> existingOpt = tokenRepository.findByEmail(email)
                .or(() -> tokenRepository.findByEmailIgnoreCase(email));

        PasswordResetToken token;
        PasswordResetToken previousToken = null;

        if (existingOpt.isPresent()) {
            token = existingOpt.get();
            previousToken = copyToken(token);

            // Resend cooldown enforcement (60 seconds)
            if (token.getLastSentAt() != null) {
                long elapsedSeconds = Duration.between(token.getLastSentAt(), now).getSeconds();
                if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
                    long waitSeconds = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
                    throw new IllegalStateException("Please wait " + waitSeconds + " seconds before requesting another recovery code.");
                }
            }

            // Hourly rate limit window enforcement
            if (token.getWindowStartTime() != null && Duration.between(token.getWindowStartTime(), now).toHours() < 1) {
                if (token.getSendCount() >= MAX_SENDS_PER_HOUR) {
                    throw new IllegalStateException("Hourly password recovery request limit reached. Please try again later.");
                }
                token.setSendCount(token.getSendCount() + 1);
            } else {
                token.setWindowStartTime(now);
                token.setSendCount(1);
            }
        } else {
            token = new PasswordResetToken();
            token.setEmail(email);
            token.setWindowStartTime(now);
            token.setSendCount(1);
        }

        // 3. Anti-enumeration check: does this user exist?
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            // Persist ephemeral rate-limiting record for unregistered address to ensure identical rate limiting
            token.setLastSentAt(now);
            token.setExpiresAt(now.plus(RECOVERY_CODE_EXPIRATION_MINUTES, ChronoUnit.MINUTES));
            token.setCodeHash(null); // No valid recovery code is active
            tokenRepository.save(token);

            // Constant-time dummy computation to defend against timing attacks
            hashRecoveryCode(email, "000000");
            log.info("Password recovery requested for non-existent or unregistered address domain: {}", getEmailDomain(email));
            return privacyPreservingResponse();
        }

        // 4. User exists: generate cryptographically secure 6-digit recovery code
        int code = 100000 + secureRandom.nextInt(900000);
        String recoveryCode = String.valueOf(code);

        // Store ONLY the keyed cryptographic hash in MongoDB
        String hashedCode = hashRecoveryCode(email, recoveryCode);
        token.setCodeHash(hashedCode);
        token.setExpiresAt(now.plus(RECOVERY_CODE_EXPIRATION_MINUTES, ChronoUnit.MINUTES));
        token.setLastSentAt(now);
        token.setAttempts(0);
        token.setUsed(false);

        // Determine recipient display name
        User user = userOpt.get();
        String recipientName = user.getFullName();

        // 5. Save token to MongoDB
        PasswordResetToken savedToken = tokenRepository.save(token);

        // 6. Deliver through configured provider (Azure Communication Services or SMTP)
        try {
            emailService.sendPasswordResetCode(email, recipientName, recoveryCode);
            log.info("Password recovery code email successfully dispatched to recipient domain: {}", getEmailDomain(email));
        } catch (RuntimeException deliveryFailure) {
            // Version-aware safe compensation: rolls back or deletes only if version and codeHash match
            compensateEmailDeliveryFailure(savedToken, previousToken, hashedCode);
            log.error("Failed to deliver password reset recovery code email: {}", deliveryFailure.getMessage());
            throw new IllegalStateException("Unable to deliver password reset code through the email provider. Please try again later.", deliveryFailure);
        }

        return privacyPreservingResponse();
    }

    /**
     * Version-aware compensation after email delivery failure.
     * Prevents overwriting concurrent modifications by verifying document ID, Version, and codeHash.
     */
    void compensateEmailDeliveryFailure(PasswordResetToken savedToken, PasswordResetToken previousToken, String hashedCode) {
        if (savedToken == null || savedToken.getId() == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(savedToken.getId())
                    .and("version").is(savedToken.getVersion())
                    .and("codeHash").is(hashedCode));

            if (previousToken != null && previousToken.getCodeHash() != null) {
                // Restore previous token attributes while incrementing version to preserve optimistic concurrency
                Update update = new Update()
                        .set("codeHash", previousToken.getCodeHash())
                        .set("expiresAt", previousToken.getExpiresAt())
                        .set("lastSentAt", previousToken.getLastSentAt())
                        .set("attempts", previousToken.getAttempts())
                        .inc("version", 1);
                mongoTemplate.updateFirst(query, update, PasswordResetToken.class);
            } else {
                // Was a new token: remove conditionally only if version and codeHash still match
                mongoTemplate.remove(query, PasswordResetToken.class);
            }
        } catch (Exception e) {
            log.warn("Version-aware compensation after email delivery failure encountered an issue: {}", e.getMessage());
        }
    }

    /**
     * Validates recovery code, updates user password using BCrypt, and consumes recovery token.
     * Fails closed when atomicity cannot be guaranteed, handles transient errors safely with retry,
     * and persists failed attempts reliably.
     */
    public boolean resetPassword(ResetPasswordRequest request) {
        requireHmacSecret();
        String email = normalizeEmail(request.getEmail());
        String code = request.getToken() != null ? request.getToken().trim() : "";

        if (code.length() != 6 || !code.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Invalid recovery code. Please enter the 6-digit code received in your email.");
        }

        validatePasswordComplexity(request.getNewPassword());

        // Fail closed if transactional integrity cannot be guaranteed
        if (transactionTemplate == null) {
            throw new IllegalStateException("Password reset cannot proceed: database transaction support is required to guarantee atomicity.");
        }

        boolean retriedAfterTransient = false;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                ResetOutcome outcome = transactionTemplate.execute(status ->
                        executePasswordResetTransaction(email, code, request.getNewPassword()));
                if (outcome == null) {
                    throw new IllegalStateException("Password reset transaction returned no outcome.");
                }
                return handleResetOutcome(outcome, retriedAfterTransient);
            } catch (MongoTransactionException | TransientDataAccessException e) {
                if (attempt == 3) {
                    log.error("Password reset transaction failed after 3 transient retries: {}", e.getMessage());
                    throw new IllegalStateException("Password reset could not be completed securely due to a database transaction conflict. Please try again.", e);
                }
                retriedAfterTransient = true;
                log.warn("Transient password reset transaction conflict on attempt {}; retrying...", attempt);
            }
        }

        throw new IllegalStateException("Password reset could not be completed. Please try again.");
    }

    private boolean handleResetOutcome(ResetOutcome outcome, boolean retriedAfterTransient) {
        return switch (outcome.status()) {
            case SUCCESS -> true;
            case INVALID_CODE, MAX_ATTEMPTS_EXCEEDED, EXPIRED, ALREADY_USED, USER_NOT_FOUND ->
                    throw new IllegalArgumentException(outcome.message());
            case MISSING_TOKEN -> {
                if (retriedAfterTransient) {
                    throw new IllegalStateException("Password reset state changed while processing. Please try again.");
                }
                throw new IllegalArgumentException(outcome.message());
            }
        };
    }

    private ResetOutcome executePasswordResetTransaction(String email, String code, String newPassword) {
        Instant now = Instant.now();

        PasswordResetToken token = tokenRepository.findByEmail(email)
                .or(() -> tokenRepository.findByEmailIgnoreCase(email))
                .orElse(null);

        if (token == null) {
            log.warn("Password reset rejected: no active recovery token found for domain: {}", getEmailDomain(email));
            return new ResetOutcome(ResetStatus.MISSING_TOKEN, "Password reset recovery code has expired or was not requested. Please request a new code.");
        }

        if (token.isUsed()) {
            tokenRepository.delete(token);
            return new ResetOutcome(ResetStatus.ALREADY_USED, "Password reset recovery code has already been used. Please request a new code.");
        }

        // Expiration check (15 minutes)
        if (token.getExpiresAt() == null || now.isAfter(token.getExpiresAt())) {
            tokenRepository.delete(token);
            return new ResetOutcome(ResetStatus.EXPIRED, "Password reset recovery code has expired. Please request a new code.");
        }

        // Max attempt check (5 attempts)
        if (token.getAttempts() >= MAX_ATTEMPTS) {
            tokenRepository.delete(token);
            return new ResetOutcome(ResetStatus.MAX_ATTEMPTS_EXCEEDED, "Maximum verification attempts exceeded. Please request a new code.");
        }

        String inputHash = hashRecoveryCode(email, code);
        boolean codeMatches = token.getCodeHash() != null && MessageDigest.isEqual(
                inputHash.getBytes(StandardCharsets.US_ASCII),
                token.getCodeHash().getBytes(StandardCharsets.US_ASCII)
        );

        if (!codeMatches) {
            int newAttempts = token.getAttempts() + 1;
            token.setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                tokenRepository.delete(token);
                return new ResetOutcome(ResetStatus.MAX_ATTEMPTS_EXCEEDED, "Maximum verification attempts exceeded. Please request a new code.");
            } else {
                tokenRepository.save(token);
                int remaining = MAX_ATTEMPTS - newAttempts;
                return new ResetOutcome(ResetStatus.INVALID_CODE, "Invalid recovery code. " + remaining + " attempt(s) remaining.");
            }
        }

        // Code matches: locate user
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return new ResetOutcome(ResetStatus.USER_NOT_FOUND, "User account not found.");
        }

        // Update password with BCrypt and record passwordChangedAt for server-side session invalidation
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPasswordHash(encodedPassword);
        user.setPasswordChangedAt(now);
        user.incrementTokenVersion();
        user.setUpdatedAt(now);
        userRepository.save(user);

        // Single-use enforcement: invalidate and delete the recovery token
        token.setUsed(true);
        tokenRepository.delete(token);

        log.info("Password updated successfully and recovery code consumed for user.");
        return new ResetOutcome(ResetStatus.SUCCESS, "Password updated successfully.");
    }

    /**
     * Validates password complexity against HealthNexus security policy:
     * - Minimum 8 characters
     * - At least 1 uppercase letter
     * - At least 1 lowercase letter
     * - At least 1 number
     * - At least 1 special character
     */
    public void validatePasswordComplexity(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        if (!password.chars().anyMatch(Character::isUpperCase)) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter (A-Z).");
        }
        if (!password.chars().anyMatch(Character::isLowerCase)) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter (a-z).");
        }
        if (!password.chars().anyMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Password must contain at least one numeric digit (0-9).");
        }
        if (password.chars().allMatch(ch -> Character.isLetterOrDigit(ch))) {
            throw new IllegalArgumentException("Password must contain at least one special symbol (!@#$%^&*).");
        }
    }

    /**
     * Computes an HMAC-SHA-256 hash of the recovery code scoped to its normalized email.
     */
    public String hashRecoveryCode(String email, String code) {
        try {
            requireHmacSecret();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(otpHmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String combined = normalizeEmail(email) + ":reset:" + code.trim();
            return HexFormat.of().formatHex(mac.doFinal(combined.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error computing recovery code hash", e);
        }
    }

    private PasswordResetToken copyToken(PasswordResetToken source) {
        PasswordResetToken copy = new PasswordResetToken();
        copy.setId(source.getId());
        copy.setEmail(source.getEmail());
        copy.setCodeHash(source.getCodeHash());
        copy.setExpiresAt(source.getExpiresAt());
        copy.setLastSentAt(source.getLastSentAt());
        copy.setAttempts(source.getAttempts());
        copy.setSendCount(source.getSendCount());
        copy.setWindowStartTime(source.getWindowStartTime());
        copy.setUsed(source.isUsed());
        copy.setCreatedAt(source.getCreatedAt());
        copy.setUpdatedAt(source.getUpdatedAt());
        copy.setVersion(source.getVersion());
        return copy;
    }

    private Map<String, Object> privacyPreservingResponse() {
        return Map.of(
                "success", true,
                "message", "If an account associated with this email exists, password reset instructions with a secure recovery code have been sent.",
                "cooldownSeconds", RESEND_COOLDOWN_SECONDS,
                "expiresInSeconds", RECOVERY_CODE_EXPIRATION_MINUTES * 60
        );
    }

    private void requireHmacSecret() {
        if (otpHmacSecret == null || otpHmacSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("Password recovery is unavailable because OTP_HMAC_SECRET is not configured.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String getEmailDomain(String email) {
        if (email == null || !email.contains("@")) return "unknown";
        return email.substring(email.indexOf("@"));
    }
}
