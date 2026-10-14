package com.healthconnect.auth;

import com.healthconnect.auth.dto.RequestEmailOtpRequest;
import com.healthconnect.auth.dto.VerifyEmailOtpRequest;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.MongoTransactionException;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.result.UpdateResult;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings({"null", "unused"})
class EmailOtpServiceTest {

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private PlatformTransactionManager transactionManager;

    @Mock
    private TransactionStatus transactionStatus;

    private EmailOtpService emailOtpService;

    @BeforeEach
    void setUp() {
        lenient().when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        emailOtpService = new EmailOtpService(tokenRepository, userRepository, emailService, mongoTemplate,
                "unit-test-only-hmac-key-not-for-production", transactionManager);
    }

    @Test
    @DisplayName("Email OTP: Generates secure 6-digit OTP, stores hashed token, and dispatches email")
    void testSendEmailOtp_Success() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("citizen@healthnexus.lk", "Kasun Perera");
        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.empty());

        emailOtpService.sendEmailOtp(request);

        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        EmailVerificationToken savedToken = tokenCaptor.getValue();

        assertEquals("citizen@healthnexus.lk", savedToken.getEmail());
        assertNotNull(savedToken.getOtpHash(), "Must store secure hash");
        assertNotEquals(6, savedToken.getOtpHash().length(), "Stored hash must NOT be 6 digits plaintext");
        assertTrue(savedToken.getExpiresAt().isAfter(Instant.now()), "Expiration must be in the future");
        assertEquals(0, savedToken.getAttempts());

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendVerificationOtp(eq("citizen@healthnexus.lk"), eq("Kasun Perera"), otpCaptor.capture());
        String generatedOtp = otpCaptor.getValue();
        assertEquals(6, generatedOtp.length(), "Generated OTP must be 6 digits");
        assertTrue(generatedOtp.matches("^[0-9]{6}$"), "OTP must contain only digits");
    }

    @Test
    @DisplayName("Email OTP: Persists and retrieves a canonical lowercase email key")
    void testEmailNormalization_IsConsistentForPersistenceAndVerification() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("  Citizen@HealthNexus.LK ", "Kasun Perera");
        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.empty());

        emailOtpService.sendEmailOtp(request);

        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        assertEquals("citizen@healthnexus.lk", tokenCaptor.getValue().getEmail());
    }

    @Test
    @DisplayName("Email OTP: Compensates the persisted token when SMTP dispatch fails")
    void testSendEmailOtp_DeliveryFailure_CompensatesToken() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("citizen@healthnexus.lk", "Kasun Perera");
        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.empty());
        doThrow(new IllegalStateException("SMTP unavailable"))
                .when(emailService).sendVerificationOtp(eq("citizen@healthnexus.lk"), eq("Kasun Perera"), anyString());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> emailOtpService.sendEmailOtp(request));
        assertEquals("SMTP unavailable", ex.getMessage());
        verify(tokenRepository).save(any(EmailVerificationToken.class));
        verify(tokenRepository).delete(any(EmailVerificationToken.class));
    }

    @Test
    @DisplayName("Rate Limiting: Enforces 60-second cooldown on OTP resend requests")
    void testSendEmailOtp_ResendCooldown_ThrowsException() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("citizen@healthnexus.lk", "Kasun Perera");

        EmailVerificationToken existingToken = new EmailVerificationToken();
        existingToken.setEmail("citizen@healthnexus.lk");
        existingToken.setLastSentAt(Instant.now().minus(20, ChronoUnit.SECONDS)); // Sent 20 seconds ago

        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.of(existingToken));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                emailOtpService.sendEmailOtp(request)
        );

        assertTrue(ex.getMessage().contains("Please wait"), "Must indicate required cooldown wait time");
        verify(emailService, never()).sendVerificationOtp(any(), any(), any());
    }

    @Test
    @DisplayName("Rate Limiting: Enforces hourly limit of 5 verification requests")
    void testSendEmailOtp_HourlyLimit_ThrowsException() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("citizen@healthnexus.lk", "Kasun Perera");

        EmailVerificationToken existingToken = new EmailVerificationToken();
        existingToken.setEmail("citizen@healthnexus.lk");
        existingToken.setLastSentAt(Instant.now().minus(120, ChronoUnit.SECONDS)); // Cooldown elapsed
        existingToken.setWindowStartTime(Instant.now().minus(10, ChronoUnit.MINUTES));
        existingToken.setSendCount(5); // Maximum reached

        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.of(existingToken));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                emailOtpService.sendEmailOtp(request)
        );

        assertTrue(ex.getMessage().contains("Hourly verification request limit reached"));
        verify(emailService, never()).sendVerificationOtp(any(), any(), any());
    }

    @Test
    @DisplayName("Verification: Valid OTP marks user email verified and enforces one-time use")
    void testVerifyEmailOtp_Success() {
        String email = "citizen@healthnexus.lk";
        String plainOtp = "654321";
        String hashedOtp = emailOtpService.hashOtp(email, plainOtp);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setEmail(email);
        token.setOtpHash(hashedOtp);
        token.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        token.setAttempts(0);

        User user = new User("Kasun", email, "0771234567", null, null, "pass");
        user.setEmailVerified(false);

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        boolean result = emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, plainOtp));

        assertTrue(result);
        verify(tokenRepository).delete(token); // One-time use: token deleted
        assertTrue(user.isEmailVerified(), "User emailVerified flag must be set to true");
        verify(userRepository).save(user);
        verify(transactionManager).commit(transactionStatus);
    }

    @Test
    @DisplayName("Verification: Missing registered user does not consume a valid token")
    void testVerifyEmailOtp_MissingUser_DoesNotConsumeToken() {
        String email = "citizen@healthnexus.lk";
        String plainOtp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(
                email,
                emailOtpService.hashOtp(email, plainOtp),
                Instant.now().plus(5, ChronoUnit.MINUTES)
        );

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, plainOtp))
        );

        assertEquals("Verification code has expired or was not requested.", ex.getMessage());
        verify(tokenRepository, never()).delete(any(EmailVerificationToken.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Verification: Incorrect OTP increments attempts and throws remaining count")
    void testVerifyEmailOtp_IncorrectCode_IncrementsAttempts() {
        String email = "citizen@healthnexus.lk";
        String plainOtp = "654321";
        String hashedOtp = emailOtpService.hashOtp(email, plainOtp);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setEmail(email);
        token.setOtpHash(hashedOtp);
        token.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        token.setAttempts(1);

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, "999999"))
        );

        assertTrue(ex.getMessage().contains("Invalid verification code"));
        assertEquals(2, token.getAttempts());
        verify(tokenRepository).save(token);
    }

    @Test
    @DisplayName("Verification: Five incorrect codes permanently exhaust the token")
    void testVerifyEmailOtp_FiveIncorrectCodes_RejectsCorrectCode() {
        String email = "citizen@healthnexus.lk";
        String correctOtp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(email, emailOtpService.hashOtp(email, correctOtp),
                Instant.now().plus(5, ChronoUnit.MINUTES));
        User user = new User("Kasun", email, "0771234567", null, null, "pass");
        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));

        for (int i = 0; i < 5; i++) {
            IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                    () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, "999999")));
            assertTrue(error.getMessage().contains(i == 4 ? "Maximum" : "Invalid"));
        }

        IllegalArgumentException exhausted = assertThrows(IllegalArgumentException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, correctOtp)));
        assertTrue(exhausted.getMessage().contains("Maximum verification attempts exceeded"));
        assertEquals(5, token.getAttempts());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Verification: Exceeding maximum attempts invalidates token")
    void testVerifyEmailOtp_MaxAttempts_InvalidatesToken() {
        String email = "citizen@healthnexus.lk";
        String plainOtp = "654321";
        String hashedOtp = emailOtpService.hashOtp(email, plainOtp);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setEmail(email);
        token.setOtpHash(hashedOtp);
        token.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        token.setAttempts(5); // Max attempts reached

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, plainOtp))
        );

        assertTrue(ex.getMessage().contains("Maximum verification attempts exceeded"));
        verify(tokenRepository).delete(token);
    }

    @Test
    @DisplayName("Verification: Expired OTP code is rejected and deleted")
    void testVerifyEmailOtp_ExpiredCode_RejectedAndDeleted() {
        String email = "citizen@healthnexus.lk";

        EmailVerificationToken token = new EmailVerificationToken();
        token.setEmail(email);
        token.setExpiresAt(Instant.now().minus(10, ChronoUnit.SECONDS)); // Expired

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, "123456"))
        );

        assertTrue(ex.getMessage().contains("Verification code has expired"));
        verify(tokenRepository).delete(token);
    }

    @Test
    @DisplayName("Email OTP: Token persistence failure prevents provider dispatch")
    void testSendEmailOtp_TokenPersistenceFailure_DoesNotDispatch() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("citizen@healthnexus.lk", "Kasun Perera");
        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.empty());
        when(tokenRepository.save(any(EmailVerificationToken.class)))
                .thenThrow(new IllegalStateException("database unavailable"));

        assertThrows(IllegalStateException.class, () -> emailOtpService.sendEmailOtp(request));
        verify(emailService, never()).sendVerificationOtp(any(), any(), any());
    }

    @Test
    @DisplayName("Email OTP: Failed resend restores the previous token when no newer resend won")
    void testSendEmailOtp_DeliveryFailure_RestoresPreviousToken() {
        String email = "citizen@healthnexus.lk";
        EmailVerificationToken existing = new EmailVerificationToken();
        existing.setId("token-1");
        existing.setEmail(email);
        existing.setOtpHash("old-hash");
        existing.setExpiresAt(Instant.now().plus(2, ChronoUnit.MINUTES));
        existing.setLastSentAt(Instant.now().minus(120, ChronoUnit.SECONDS));
        existing.setWindowStartTime(Instant.now().minus(10, ChronoUnit.MINUTES));
        existing.setSendCount(1);

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(existing));
        when(mongoTemplate.updateFirst(any(), any(), eq(EmailVerificationToken.class)))
                .thenReturn(UpdateResult.acknowledged(1, 1L, null));
        doThrow(new IllegalStateException("Azure unavailable"))
                .when(emailService).sendVerificationOtp(eq(email), any(), anyString());

        assertThrows(IllegalStateException.class, () ->
                emailOtpService.sendEmailOtp(new RequestEmailOtpRequest(email, "Kasun Perera")));
        verify(mongoTemplate, times(2)).updateFirst(any(), any(), eq(EmailVerificationToken.class));
        verify(tokenRepository, never()).deleteByIdAndOtpHash(any(), any());
    }

    @Test
    @DisplayName("Verification: A duplicate request cannot succeed after token consumption")
    void testVerifyEmailOtp_DuplicateRequest_IsRejected() {
        String email = "citizen@healthnexus.lk";
        String otp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(email, emailOtpService.hashOtp(email, otp),
                Instant.now().plus(5, ChronoUnit.MINUTES));
        User user = new User("Kasun", email, "0771234567", null, null, "pass");
        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token), Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertTrue(emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));
        assertThrows(IllegalArgumentException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Email OTP: Transient token lookup failure is retried")
    void testVerifyEmailOtp_TransientFailure_Retries() {
        String email = "citizen@healthnexus.lk";
        String otp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(email, emailOtpService.hashOtp(email, otp),
                Instant.now().plus(5, ChronoUnit.MINUTES));
        User user = new User("Kasun", email, "0771234567", null, null, "pass");

        when(tokenRepository.findByEmail(email))
                .thenThrow(new MongoTransactionException("transient"))
                .thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertTrue(emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));
        verify(tokenRepository, times(2)).findByEmail(email);
    }

    @Test
    @DisplayName("Email OTP: User persistence failure does not consume the token")
    void testVerifyEmailOtp_UserPersistenceFailure_DoesNotConsumeToken() {
        String email = "citizen@healthnexus.lk";
        String otp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(email, emailOtpService.hashOtp(email, otp),
                Instant.now().plus(5, ChronoUnit.MINUTES));
        User user = new User("Kasun", email, "0771234567", null, null, "pass");

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenThrow(new IllegalStateException("database unavailable"));

        assertThrows(IllegalStateException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));
        verify(tokenRepository, never()).delete(any(EmailVerificationToken.class));
        verify(transactionManager).rollback(transactionStatus);
    }

    @Test
    @DisplayName("Verification: Missing transaction support fails closed")
    void testVerifyEmailOtp_MissingTransactionManager_FailsClosed() {
        assertThrows(IllegalStateException.class, () -> new EmailOtpService(
                tokenRepository, userRepository, emailService, mongoTemplate,
                "unit-test-only-hmac-key-not-for-production", null));
    }
}
