package com.healthconnect.auth;

import com.healthconnect.auth.dto.ForgotPasswordRequest;
import com.healthconnect.auth.dto.ResetPasswordRequest;
import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unused")
class PasswordResetServiceTest {

    private static final String HMAC_SECRET = "HealthNexusSuperSecretHmacKeyForRecoveryTesting2026!";

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private MongoTemplate mongoTemplate;

    private PasswordEncoder passwordEncoder;
    private TransactionTemplate transactionTemplate;
    private PasswordResetService resetService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(12);

        PlatformTransactionManager txManager = new PlatformTransactionManager() {
            @Override
            public TransactionStatus getTransaction(TransactionDefinition definition) {
                return new SimpleTransactionStatus();
            }

            @Override
            public void commit(TransactionStatus status) {}

            @Override
            public void rollback(TransactionStatus status) {}
        };
        transactionTemplate = new TransactionTemplate(txManager);

        resetService = new PasswordResetService(
                tokenRepository,
                userRepository,
                passwordEncoder,
                emailService,
                mongoTemplate,
                HMAC_SECRET,
                transactionTemplate
        );

        sampleUser = new User("Kasun Perera", "kasun.perera@example.lk", "0771234567", "nicHash", "1995*****678", passwordEncoder.encode("OldPassword123!"));
        sampleUser.setId("USR-101");
        sampleUser.setRoles(Set.of(Role.PATIENT));
        sampleUser.setEnabled(true);
        sampleUser.setEmailVerified(true);
    }

    @Test
    @DisplayName("sendRecoveryCode generates 6-digit code, hashes with HMAC, persists with 15-min TTL, and sends email")
    void sendRecoveryCode_success() {
        when(emailService.isConfigured()).thenReturn(true);
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("kasun.perera@example.lk")).thenReturn(Optional.of(sampleUser));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        ForgotPasswordRequest req = new ForgotPasswordRequest("kasun.perera@example.lk");
        Map<String, Object> result = resetService.sendRecoveryCode(req);

        assertTrue((Boolean) result.get("success"));
        assertEquals(60, result.get("cooldownSeconds"));
        assertEquals(900, result.get("expiresInSeconds"));

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken saved = tokenCaptor.getValue();

        assertEquals("kasun.perera@example.lk", saved.getEmail());
        assertNotNull(saved.getCodeHash());
        assertNotNull(saved.getExpiresAt());
        assertTrue(saved.getExpiresAt().isAfter(Instant.now().plus(14, ChronoUnit.MINUTES)));
        assertEquals(0, saved.getAttempts());
        assertFalse(saved.isUsed());

        verify(emailService).sendPasswordResetCode(eq("kasun.perera@example.lk"), eq("Kasun Perera"), anyString());
    }

    @Test
    @DisplayName("sendRecoveryCode for non-existent email records rate-limiting token and returns privacy-preserving response")
    void sendRecoveryCode_unregisteredEmail_antiEnumeration() {
        when(emailService.isConfigured()).thenReturn(true);
        when(tokenRepository.findByEmail("ghost@example.lk")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("ghost@example.lk")).thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        ForgotPasswordRequest req = new ForgotPasswordRequest("ghost@example.lk");
        Map<String, Object> result = resetService.sendRecoveryCode(req);

        assertTrue((Boolean) result.get("success"));
        assertEquals(60, result.get("cooldownSeconds"));

        // Rate-limiting token must be persisted with null codeHash
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken saved = tokenCaptor.getValue();
        assertEquals("ghost@example.lk", saved.getEmail());
        assertNull(saved.getCodeHash());

        // Zero emails dispatched
        verify(emailService, never()).sendPasswordResetCode(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("sendRecoveryCode fails closed immediately if email service is unconfigured for all addresses")
    void sendRecoveryCode_unconfiguredEmail_failsClosedFirst() {
        when(emailService.isConfigured()).thenReturn(false);

        ForgotPasswordRequest req = new ForgotPasswordRequest("any@example.lk");
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> resetService.sendRecoveryCode(req));
        assertTrue(ex.getMessage().contains("unconfigured"));

        // No DB lookups or saves performed
        verify(userRepository, never()).findByEmailIgnoreCase(anyString());
        verify(tokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("sendRecoveryCode enforces 60-second cooldown on repeated requests")
    void sendRecoveryCode_cooldownEnforced() {
        when(emailService.isConfigured()).thenReturn(true);
        PasswordResetToken existing = new PasswordResetToken();
        existing.setEmail("kasun.perera@example.lk");
        existing.setLastSentAt(Instant.now().minusSeconds(30)); // 30 seconds ago
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.of(existing));

        ForgotPasswordRequest req = new ForgotPasswordRequest("kasun.perera@example.lk");
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> resetService.sendRecoveryCode(req));
        assertTrue(ex.getMessage().contains("Please wait"));

        verify(emailService, never()).sendPasswordResetCode(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("sendRecoveryCode enforces hourly request limit (max 5)")
    void sendRecoveryCode_rateLimitExceeded() {
        when(emailService.isConfigured()).thenReturn(true);
        PasswordResetToken existing = new PasswordResetToken();
        existing.setEmail("kasun.perera@example.lk");
        existing.setLastSentAt(Instant.now().minusSeconds(120)); // cooldown passed
        existing.setWindowStartTime(Instant.now().minus(20, ChronoUnit.MINUTES));
        existing.setSendCount(5);
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.of(existing));

        ForgotPasswordRequest req = new ForgotPasswordRequest("kasun.perera@example.lk");
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> resetService.sendRecoveryCode(req));
        assertTrue(ex.getMessage().contains("Hourly password recovery request limit reached"));
    }

    @Test
    @DisplayName("sendRecoveryCode triggers safe version-aware compensation on email failure")
    void sendRecoveryCode_emailFailure_compensatesVersionAware() {
        when(emailService.isConfigured()).thenReturn(true);
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("kasun.perera@example.lk")).thenReturn(Optional.of(sampleUser));

        PasswordResetToken savedToken = new PasswordResetToken();
        savedToken.setId("TOK-999");
        savedToken.setEmail("kasun.perera@example.lk");
        savedToken.setVersion(1L);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(savedToken);

        doThrow(new RuntimeException("ACS SMTP connect timeout"))
                .when(emailService).sendPasswordResetCode(anyString(), anyString(), anyString());

        ForgotPasswordRequest req = new ForgotPasswordRequest("kasun.perera@example.lk");
        assertThrows(IllegalStateException.class, () -> resetService.sendRecoveryCode(req));

        // Compensation removes the undelivered new token conditionally
        verify(mongoTemplate).remove(any(Query.class), eq(PasswordResetToken.class));
    }

    @Test
    @DisplayName("resetPassword successfully verifies recovery code, updates password with BCrypt, sets passwordChangedAt, and deletes token")
    void resetPassword_success() {
        String code = "481029";
        String hashed = resetService.hashRecoveryCode("kasun.perera@example.lk", code);

        PasswordResetToken token = new PasswordResetToken("kasun.perera@example.lk", hashed, Instant.now().plus(10, ChronoUnit.MINUTES));
        token.setId("TOK-101");
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.of(token));
        when(userRepository.findByEmailIgnoreCase("kasun.perera@example.lk")).thenReturn(Optional.of(sampleUser));

        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", code, "NewStrongP@ssw0rd2026!");
        boolean result = resetService.resetPassword(req);

        assertTrue(result);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User updated = userCaptor.getValue();

        assertTrue(passwordEncoder.matches("NewStrongP@ssw0rd2026!", updated.getPasswordHash()));
        assertNotNull(updated.getPasswordChangedAt());
        assertEquals(1, updated.getTokenVersion());

        // Single-use enforcement: token deleted
        verify(tokenRepository).delete(token);
    }

    @Test
    @DisplayName("resetPassword: failed attempt increments and persists attempt counter in DB before throwing IllegalArgumentException")
    void resetPassword_invalidCode_persistsAttemptCount() {
        String correctCode = "481029";
        String hashed = resetService.hashRecoveryCode("kasun.perera@example.lk", correctCode);

        PasswordResetToken token = new PasswordResetToken("kasun.perera@example.lk", hashed, Instant.now().plus(10, ChronoUnit.MINUTES));
        token.setId("TOK-101");
        token.setAttempts(1);
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.of(token));

        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", "999999", "NewStrongP@ssw0rd2026!");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> resetService.resetPassword(req));
        assertTrue(ex.getMessage().contains("Invalid recovery code. 3 attempt(s) remaining."));

        // Attempt counter incremented and persisted via repository save
        assertEquals(2, token.getAttempts());
        verify(tokenRepository).save(token);

        // User password was NOT modified
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword: 5th failed attempt permanently purges token from DB")
    void resetPassword_exceedMaxAttempts_deletesToken() {
        String correctCode = "481029";
        String hashed = resetService.hashRecoveryCode("kasun.perera@example.lk", correctCode);

        PasswordResetToken token = new PasswordResetToken("kasun.perera@example.lk", hashed, Instant.now().plus(10, ChronoUnit.MINUTES));
        token.setId("TOK-101");
        token.setAttempts(4); // 4 prior failed attempts
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.of(token));

        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", "999999", "NewStrongP@ssw0rd2026!");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> resetService.resetPassword(req));
        assertTrue(ex.getMessage().contains("Maximum verification attempts exceeded"));

        assertEquals(5, token.getAttempts());
        verify(tokenRepository).delete(token);
    }

    @Test
    @DisplayName("resetPassword fails closed if TransactionTemplate is null")
    void resetPassword_failClosed_whenTransactionTemplateIsNull() {
        PasswordResetService noTxService = new PasswordResetService(
                tokenRepository, userRepository, passwordEncoder, emailService, mongoTemplate, HMAC_SECRET, (TransactionTemplate) null
        );

        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", "123456", "NewStrongP@ssw0rd2026!");
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> noTxService.resetPassword(req));
        assertTrue(ex.getMessage().contains("transaction support is required"));
    }

    @Test
    @DisplayName("resetPassword fails closed on transient transaction retry exhaustion without executing non-transactionally")
    void resetPassword_transientErrorRetryExhaustion_failsClosed() {
        TransactionTemplate failingTxTemplate = mock(TransactionTemplate.class);
        when(failingTxTemplate.execute(any())).thenThrow(new TransientDataAccessException("Mongo write conflict") {});

        PasswordResetService retryService = new PasswordResetService(
                tokenRepository, userRepository, passwordEncoder, emailService, mongoTemplate, HMAC_SECRET, failingTxTemplate
        );

        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", "123456", "NewStrongP@ssw0rd2026!");
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> retryService.resetPassword(req));
        assertTrue(ex.getMessage().contains("conflict"));

        // 3 retry attempts executed
        verify(failingTxTemplate, times(3)).execute(any());
        // userRepository.save never called directly outside transaction
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword rejects expired token and deletes it")
    void resetPassword_expiredToken_rejectedAndDeleted() {
        String hashed = resetService.hashRecoveryCode("kasun.perera@example.lk", "123456");
        PasswordResetToken token = new PasswordResetToken("kasun.perera@example.lk", hashed, Instant.now().minus(5, ChronoUnit.MINUTES));
        token.setId("TOK-EXP");
        when(tokenRepository.findByEmail("kasun.perera@example.lk")).thenReturn(Optional.of(token));

        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", "123456", "NewStrongP@ssw0rd2026!");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> resetService.resetPassword(req));
        assertTrue(ex.getMessage().contains("expired"));

        verify(tokenRepository).delete(token);
    }

    @Test
    @DisplayName("resetPassword rejects weak password before inspecting token")
    void resetPassword_weakPassword_rejected() {
        ResetPasswordRequest req = new ResetPasswordRequest("kasun.perera@example.lk", "123456", "weak");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> resetService.resetPassword(req));
        assertTrue(ex.getMessage().contains("Password must be at least 8 characters"));

        verify(tokenRepository, never()).findByEmail(anyString());
    }
}
