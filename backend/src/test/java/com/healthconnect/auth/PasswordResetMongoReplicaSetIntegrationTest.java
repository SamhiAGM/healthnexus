package com.healthconnect.auth;

import com.healthconnect.auth.dto.ResetPasswordRequest;
import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=",
        "spring.data.mongodb.auto-index-creation=true",
        "lankacare.seed.enabled=false",
        "lankacare.otp.hmac-secret=HealthNexusReplicaSetPasswordResetTestSecret2026!"
})
@SuppressWarnings({"unused", "removal"})
class PasswordResetMongoReplicaSetIntegrationTest {

    private static final String HMAC_SECRET = "HealthNexusReplicaSetPasswordResetTestSecret2026!";

    @Container
    static final MongoDBContainer MONGO = new MongoDBContainer("mongo:7.0");

    private static final String DATABASE = "healthnexus_pwd_it_" + UUID.randomUUID().toString().replace('-', '_');

    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.autoconfigure.exclude", () -> "");
        registry.add("spring.data.mongodb.uri", PasswordResetMongoReplicaSetIntegrationTest::isolatedMongoUri);
        registry.add("spring.data.mongodb.database", () -> DATABASE);
        registry.add("lankacare.otp.hmac-secret", () -> HMAC_SECRET);
        registry.add("OTP_HMAC_SECRET", () -> HMAC_SECRET);
    }

    private static String isolatedMongoUri() {
        return MONGO.getReplicaSetUrl(DATABASE);
    }

    @MockitoBean
    private JavaMailSender javaMailSender;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MongoTemplate mongoTemplate;

    @BeforeEach
    void cleanState() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("MongoDB ReplicaSet: Atomic password reset updates user password, records passwordChangedAt, and deletes recovery token")
    void testResetPassword_AtomicSuccess_DeletesTokenAndUpdatesUser() {
        String email = "kasun.integration@example.lk";
        String initialPassword = "OldPassword123!";
        User user = new User("Kasun Integration", email, "0770000001", "nicHash1", "199500000001", passwordEncoder.encode(initialPassword));
        user.setRoles(Set.of(Role.PATIENT));
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

        String code = "519284";
        String hashedCode = passwordResetService.hashRecoveryCode(email, code);
        PasswordResetToken token = new PasswordResetToken(email, hashedCode, Instant.now().plus(15, ChronoUnit.MINUTES));
        tokenRepository.save(token);

        ResetPasswordRequest request = new ResetPasswordRequest(email, code, "UpdatedStrongP@ss2026!");
        boolean success = passwordResetService.resetPassword(request);

        assertTrue(success);

        // Verify token was atomically deleted
        Optional<PasswordResetToken> tokenAfter = tokenRepository.findByEmail(email);
        assertTrue(tokenAfter.isEmpty(), "Recovery token must be consumed and deleted after successful reset");

        // Verify user credentials were updated in genuine MongoDB
        User userAfter = userRepository.findByEmail(email).orElseThrow();
        assertTrue(passwordEncoder.matches("UpdatedStrongP@ss2026!", userAfter.getPasswordHash()));
        assertNotNull(userAfter.getPasswordChangedAt());
        assertEquals(1, userAfter.getTokenVersion(), "Token version must be atomically incremented in MongoDB");
    }

    @Test
    @DisplayName("MongoDB ReplicaSet: Failed recovery attempt counter persists in DB even though IllegalArgumentException is thrown")
    void testResetPassword_InvalidAttemptPersistsInDatabase() {
        String email = "attempt.test@example.lk";
        User user = new User("Attempt Test", email, "0770000002", "nicHash2", "199500000002", passwordEncoder.encode("InitialP@ss123!"));
        user.setRoles(Set.of(Role.PATIENT));
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

        String code = "648102";
        String hashedCode = passwordResetService.hashRecoveryCode(email, code);
        PasswordResetToken token = new PasswordResetToken(email, hashedCode, Instant.now().plus(15, ChronoUnit.MINUTES));
        token.setAttempts(0);
        tokenRepository.save(token);

        // Wrong code: should fail with IllegalArgumentException
        ResetPasswordRequest wrongRequest = new ResetPasswordRequest(email, "000000", "UpdatedStrongP@ss2026!");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> passwordResetService.resetPassword(wrongRequest));
        assertTrue(ex.getMessage().contains("4 attempt(s) remaining"));

        // Crucial verification: The attempt count MUST be 1 in genuine MongoDB, NOT rolled back to 0!
        PasswordResetToken tokenAfter = tokenRepository.findByEmail(email).orElseThrow();
        assertEquals(1, tokenAfter.getAttempts(), "Attempt counter must be reliably committed and persisted in MongoDB");
    }

    @Test
    @DisplayName("MongoDB ReplicaSet: Single-use enforcement prevents token reuse")
    void testResetPassword_SingleUseEnforced() {
        String email = "single.use@example.lk";
        User user = new User("Single Use", email, "0770000003", "nicHash3", "199500000003", passwordEncoder.encode("InitialP@ss123!"));
        user.setRoles(Set.of(Role.PATIENT));
        user.setEnabled(true);
        user.setEmailVerified(true);
        userRepository.save(user);

        String code = "739104";
        String hashedCode = passwordResetService.hashRecoveryCode(email, code);
        PasswordResetToken token = new PasswordResetToken(email, hashedCode, Instant.now().plus(15, ChronoUnit.MINUTES));
        tokenRepository.save(token);

        ResetPasswordRequest request = new ResetPasswordRequest(email, code, "UpdatedStrongP@ss2026!");
        assertTrue(passwordResetService.resetPassword(request));

        // Reusing the same code must fail immediately
        ResetPasswordRequest secondAttempt = new ResetPasswordRequest(email, code, "AnotherStrongP@ss2026!");
        assertThrows(IllegalArgumentException.class, () -> passwordResetService.resetPassword(secondAttempt));
    }
}
