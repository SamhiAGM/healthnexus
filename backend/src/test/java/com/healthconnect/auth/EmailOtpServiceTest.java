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

    private EmailOtpService emailOtpService;

    @BeforeEach
    void setUp() {
        emailOtpService = new EmailOtpService(tokenRepository, userRepository, emailService);
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
    @DisplayName("Email OTP: Does not persist a cooldown token when SMTP dispatch fails")
    void testSendEmailOtp_DeliveryFailure_DoesNotPersistToken() {
        RequestEmailOtpRequest request = new RequestEmailOtpRequest("citizen@healthnexus.lk", "Kasun Perera");
        when(tokenRepository.findByEmail("citizen@healthnexus.lk")).thenReturn(Optional.empty());
        doThrow(new IllegalStateException("SMTP unavailable"))
                .when(emailService).sendVerificationOtp(eq("citizen@healthnexus.lk"), eq("Kasun Perera"), anyString());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> emailOtpService.sendEmailOtp(request));
        assertEquals("SMTP unavailable", ex.getMessage());
        verify(tokenRepository, never()).save(any(EmailVerificationToken.class));
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
}
