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
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.data.mongodb.MongoTransactionException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

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
    private final MongoTemplate mongoTemplate;
    private final SecureRandom secureRandom = new SecureRandom();
    private final String otpHmacSecret;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public EmailOtpService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            EmailService emailService,
            MongoTemplate mongoTemplate,
            @Value("${lankacare.otp.hmac-secret:}") String otpHmacSecret,
            @Qualifier("mongoTransactionManager") PlatformTransactionManager transactionManager
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.mongoTemplate = mongoTemplate;
        this.otpHmacSecret = otpHmacSecret;
        if (transactionManager == null) {
            throw new IllegalStateException("Mongo transaction manager is required for OTP verification");
        }
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    /**
     * Issues and dispatches an email OTP code to the requested address.
     * Enforces hourly rate limits and a 60-second resend cooldown.
     */
    public void sendEmailOtp(RequestEmailOtpRequest request) {
        requireHmacSecret();
        String email = normalizeEmail(request.getEmail());
        Instant now = Instant.now();

        Optional<EmailVerificationToken> existingOpt = tokenRepository.findByEmail(email);
        EmailVerificationToken token;
        EmailVerificationToken previousToken = null;

        if (existingOpt.isPresent()) {
            token = existingOpt.get();
            if (token.isVerified()) {
                throw new IllegalStateException("Email is already verified.");
            }
            previousToken = copyToken(token);

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
            recipientName = userRepository.findByEmailIgnoreCase(email)
                    .map(User::getFullName)
                    .orElse(null);
        }

        // Save first so a successful response can never claim delivery for an
        // unpersisted token. @Version prevents a stale concurrent resend from
        // overwriting a newer code.
        EmailVerificationToken persistedToken = persistOtp(token, previousToken);
        if (persistedToken == null) {
            // Spring Data returns the saved entity; this fallback also keeps
            // repository test doubles faithful to the service contract.
            persistedToken = token;
        }
        try {
            emailService.sendVerificationOtp(email, recipientName, otp);
        } catch (RuntimeException deliveryFailure) {
            // Best-effort compensation. The hash predicate prevents an older
            // failed delivery from deleting a newer code for the same address.
            if (previousToken != null && previousToken.isVerified()
                    && persistedToken.getId() != null && persistedToken.getOtpHash() != null) {
                tokenRepository.deleteByIdAndOtpHash(persistedToken.getId(), persistedToken.getOtpHash());
            } else if (previousToken != null && persistedToken.getId() != null && persistedToken.getOtpHash() != null) {
                restorePreviousTokenIfStillCurrent(persistedToken, previousToken);
            } else if (persistedToken.getId() != null && persistedToken.getOtpHash() != null) {
                tokenRepository.deleteByIdAndOtpHash(persistedToken.getId(), persistedToken.getOtpHash());
            } else {
                // A real Mongo save assigns an id. This branch is only for
                // repository implementations/test doubles that do not assign one.
                tokenRepository.delete(persistedToken);
            }
            throw deliveryFailure;
        }
    }

    private EmailVerificationToken persistOtp(EmailVerificationToken token, EmailVerificationToken previousToken) {
        if (previousToken == null || token.getId() == null || previousToken.getOtpHash() == null) {
            return tokenRepository.save(token);
        }
        Update update = new Update()
                .set("otpHash", token.getOtpHash())
                .set("expiresAt", token.getExpiresAt())
                .set("lastSentAt", token.getLastSentAt())
                .set("attempts", token.getAttempts())
                .set("sendCount", token.getSendCount())
                .set("windowStartTime", token.getWindowStartTime())
                .set("verified", false)
                .inc("version", 1);
        long updated = mongoTemplate.updateFirst(currentTokenQuery(token.getId(), previousToken.getOtpHash()),
                update, EmailVerificationToken.class).getModifiedCount();
        if (updated != 1) {
            throw new org.springframework.dao.OptimisticLockingFailureException("OTP was changed by another request");
        }
        return token;
    }

    private void restorePreviousTokenIfStillCurrent(EmailVerificationToken failedToken, EmailVerificationToken previousToken) {
        Update restore = new Update()
                .set("otpHash", previousToken.getOtpHash())
                .set("expiresAt", previousToken.getExpiresAt())
                // Preserve the failed request's cooldown and hourly count;
                // only restore the prior OTP payload and attempt state.
                .set("lastSentAt", failedToken.getLastSentAt())
                .set("attempts", previousToken.getAttempts())
                .set("sendCount", failedToken.getSendCount())
                .set("windowStartTime", failedToken.getWindowStartTime())
                .set("verified", previousToken.isVerified())
                .inc("version", 1);
        mongoTemplate.updateFirst(currentTokenQuery(failedToken.getId(), failedToken.getOtpHash()),
                restore, EmailVerificationToken.class);
    }

    private Query currentTokenQuery(String id, String otpHash) {
        return Query.query(Criteria.where("_id").is(id).and("otpHash").is(otpHash));
    }

    private EmailVerificationToken copyToken(EmailVerificationToken source) {
        EmailVerificationToken copy = new EmailVerificationToken();
        copy.setId(source.getId());
        copy.setVersion(source.getVersion());
        copy.setEmail(source.getEmail());
        copy.setOtpHash(source.getOtpHash());
        copy.setExpiresAt(source.getExpiresAt());
        copy.setLastSentAt(source.getLastSentAt());
        copy.setAttempts(source.getAttempts());
        copy.setSendCount(source.getSendCount());
        copy.setWindowStartTime(source.getWindowStartTime());
        copy.setVerified(source.isVerified());
        copy.setCreatedAt(source.getCreatedAt());
        copy.setUpdatedAt(source.getUpdatedAt());
        return copy;
    }

    /**
     * Validates the 6-digit OTP against the securely keyed hash.
     * Enforces expiration, maximum 5 attempts, and one-time use.
     * Marks the user's email verified upon success.
     */
    public boolean verifyEmailOtp(VerifyEmailOtpRequest request) {
        requireHmacSecret();
        String email = normalizeEmail(request.getEmail());
        String code = request.getCode().trim();
        if (code.length() != 6 || !code.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }

        boolean retriedAfterTransientFailure = false;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                VerificationResult result = transactionTemplate.execute(status ->
                        verifyEmailOtpInTransaction(email, code));
                if (result == null) {
                    throw new IllegalStateException("Verification transaction returned no outcome.");
                }
                return handleVerificationOutcome(result, retriedAfterTransientFailure);
            } catch (MongoTransactionException | TransientDataAccessException e) {
                if (attempt == 3) {
                    throw new IllegalStateException("Verification could not be completed. Please try again.", e);
                }
                retriedAfterTransientFailure = true;
                log.warn("Transient OTP verification conflict; retrying attempt {}", attempt + 1);
            }
        }
        throw new IllegalStateException("Verification could not be completed. Please try again.");
    }

    private boolean handleVerificationOutcome(VerificationResult result, boolean retriedAfterTransientFailure) {
        return switch (result.outcome()) {
            case SUCCESS -> true;
            case INVALID, MAX_ATTEMPTS, EXPIRED, MISSING_USER -> throw new IllegalArgumentException(result.message());
            case MISSING_TOKEN -> {
                if (retriedAfterTransientFailure) {
                    throw new IllegalStateException("Verification state changed while processing the code. Please try again.");
                }
                throw new IllegalArgumentException(result.message());
            }
        };
    }

    private enum VerificationOutcome {
        SUCCESS, INVALID, MAX_ATTEMPTS, EXPIRED, MISSING_USER, MISSING_TOKEN
    }

    private record VerificationResult(VerificationOutcome outcome, String message) {}

    private VerificationResult verifyEmailOtpInTransaction(String email, String code) {
        Instant now = Instant.now();

        EmailVerificationToken token = tokenRepository.findByEmail(email)
                .or(() -> tokenRepository.findByEmailIgnoreCase(email))
                .orElse(null);
        if (token == null) {
            log.warn("Email verification rejected: no active token was found.");
            return new VerificationResult(VerificationOutcome.MISSING_TOKEN, "Verification code has expired or was not requested.");
        }

        // Expiration check (5 minutes)
        if (token.getExpiresAt() == null || now.isAfter(token.getExpiresAt())) {
            tokenRepository.delete(token);
            return new VerificationResult(VerificationOutcome.EXPIRED, "Verification code has expired. Please request a new code.");
        }

        // Max attempt check (5 attempts)
        if (token.getAttempts() >= MAX_ATTEMPTS) {
            tokenRepository.delete(token);
            return new VerificationResult(VerificationOutcome.MAX_ATTEMPTS, "Maximum verification attempts exceeded. Please request a new code.");
        }

        token.setAttempts(token.getAttempts() + 1);

        String inputHash = hashOtp(email, code);
        if (!MessageDigest.isEqual(inputHash.getBytes(StandardCharsets.US_ASCII), token.getOtpHash().getBytes(StandardCharsets.US_ASCII))) {
            EmailVerificationToken updatedToken = recordInvalidAttempt(token);
            int remaining = MAX_ATTEMPTS - updatedToken.getAttempts();
            return remaining > 0
                    ? new VerificationResult(VerificationOutcome.INVALID, "Invalid verification code. " + remaining + " attempt(s) remaining.")
                    : new VerificationResult(VerificationOutcome.MAX_ATTEMPTS, "Maximum verification attempts exceeded. Please request a new code.");
        }

        // Confirm the account before consuming a valid code. Missing user and missing token
        // deliberately share the same public response to avoid account enumeration.
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByEmailIgnoreCase(email))
                .orElse(null);
        if (user == null) {
            log.warn("Email verification rejected: token matched but no registered user was found.");
            return new VerificationResult(VerificationOutcome.MISSING_USER, "Verification code has expired or was not requested.");
        }

        // One-time use enforcement: invalidate code only after the account is confirmed.
        user.setEmailVerified(true);
        user.setVerified(true);
        userRepository.save(user);

        // Consume only after the user write has succeeded. Both writes are in
        // the same Mongo transaction in production, so either both commit or
        // both roll back. A concurrent transaction conflicts on this delete.
        token.setVerified(true);
        tokenRepository.delete(token);
        log.info("Email verification completed and token consumed.");

        return new VerificationResult(VerificationOutcome.SUCCESS, "");
    }

    private EmailVerificationToken recordInvalidAttempt(EmailVerificationToken token) {
        if (token.getId() == null || token.getOtpHash() == null) {
            EmailVerificationToken saved = tokenRepository.save(token);
            return saved == null ? token : saved;
        }
        Query attemptQuery = currentTokenQuery(token.getId(), token.getOtpHash());
        attemptQuery.addCriteria(Criteria.where("attempts").is(token.getAttempts() - 1));
        EmailVerificationToken updated = mongoTemplate.findAndModify(
                attemptQuery,
                new Update().inc("attempts", 1),
                org.springframework.data.mongodb.core.FindAndModifyOptions.options().returnNew(true),
                EmailVerificationToken.class);
        if (updated == null) {
            throw new org.springframework.dao.OptimisticLockingFailureException("OTP attempt was changed by another request");
        }
        return updated;
    }

    /**
     * Computes an HMAC-SHA-256 hash of the OTP scoped to its normalized email.
     */
    public String hashOtp(String email, String otp) {
        try {
            requireHmacSecret();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(otpHmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String combined = normalizeEmail(email) + ":" + otp.trim();
            return HexFormat.of().formatHex(mac.doFinal(combined.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error computing OTP hash", e);
        }
    }

    private void requireHmacSecret() {
        if (otpHmacSecret == null || otpHmacSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("Email verification is unavailable because OTP_HMAC_SECRET is not configured.");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
