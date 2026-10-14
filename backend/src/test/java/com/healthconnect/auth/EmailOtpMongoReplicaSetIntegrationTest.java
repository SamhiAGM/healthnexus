package com.healthconnect.auth;

import com.healthconnect.auth.dto.VerifyEmailOtpRequest;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doCallRealMethod;
import static org.mockito.Mockito.doThrow;

@Testcontainers
@SpringBootTest(properties = {
        "spring.autoconfigure.exclude=",
        "spring.data.mongodb.auto-index-creation=true",
        "lankacare.seed.enabled=false",
        "lankacare.otp.hmac-secret=HealthNexusReplicaSetIntegrationSecret2026!"
})
class EmailOtpMongoReplicaSetIntegrationTest {

    private static final String HMAC_SECRET = "HealthNexusReplicaSetIntegrationSecret2026!";

    @Container
    static final MongoDBContainer MONGO = new MongoDBContainer("mongo:7.0");

    private static final String DATABASE = "healthnexus_otp_it_" + UUID.randomUUID().toString().replace('-', '_');

    @DynamicPropertySource
    static void mongoProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.autoconfigure.exclude", () -> "");
        registry.add("spring.data.mongodb.uri", EmailOtpMongoReplicaSetIntegrationTest::isolatedMongoUri);
        registry.add("spring.data.mongodb.database", () -> DATABASE);
        registry.add("lankacare.otp.hmac-secret", () -> HMAC_SECRET);
        registry.add("OTP_HMAC_SECRET", () -> HMAC_SECRET);
    }

    private static String isolatedMongoUri() {
        return MONGO.getReplicaSetUrl(DATABASE);
    }

    @Autowired
    private EmailOtpService emailOtpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @SpyBean
    private UserRepository userRepositorySpy;

    @SpyBean
    private EmailVerificationTokenRepository tokenRepositorySpy;

    @BeforeEach
    void cleanIsolatedDatabase() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @AfterEach
    void verifyDatabaseIsolation() {
        assertEquals(DATABASE, mongoTemplate.getDb().getName());
    }

    @Test
    void successfulVerificationCommitsUserAndTokenConsumption() {
        String email = uniqueEmail();
        String otp = "123456";
        User user = saveUser(email);
        saveToken(email, otp, 0);

        assertTrue(emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));

        User savedUser = userRepository.findByEmail(email).orElseThrow();
        assertTrue(savedUser.isEmailVerified());
        assertTrue(savedUser.isVerified());
        assertTrue(tokenRepository.findByEmail(email).isEmpty());
        assertNotNull(user.getId());
    }

    @Test
    void userSaveFailureRollsBackUserAndTokenChanges() {
        String email = uniqueEmail();
        String otp = "123456";
        saveUser(email);
        saveToken(email, otp, 0);
        doThrow(new IllegalStateException("simulated user persistence failure"))
                .when(userRepositorySpy).save(any(User.class));

        assertThrows(IllegalStateException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));

        User rolledBackUser = userRepository.findByEmail(email).orElseThrow();
        assertFalse(rolledBackUser.isEmailVerified());
        assertFalse(rolledBackUser.isVerified());
        assertTrue(tokenRepository.findByEmail(email).isPresent());
    }

    @Test
    void concurrentVerificationRequestsOnlyOneCanConsumeTheOtp() throws Exception {
        String email = uniqueEmail();
        String otp = "123456";
        saveUser(email);
        saveToken(email, otp, 0);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Future<Boolean>> results = new ArrayList<>();
            for (int i = 0; i < 2; i++) {
                results.add(executor.submit(() -> {
                    start.await();
                    try {
                        return emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp));
                    } catch (RuntimeException expectedForLoser) {
                        return false;
                    }
                }));
            }
            start.countDown();
            int successes = (results.get(0).get() ? 1 : 0) + (results.get(1).get() ? 1 : 0);
            assertEquals(1, successes);
        } finally {
            executor.shutdownNow();
        }
        assertTrue(tokenRepository.findByEmail(email).isEmpty());
        assertEquals(1, userRepository.findByEmail(email).filter(User::isEmailVerified).isPresent() ? 1 : 0);
    }

    @Test
    void fiveInvalidAttemptsRemainDurablyCounted() {
        String email = uniqueEmail();
        String otp = "123456";
        saveUser(email);
        saveToken(email, otp, 0);

        for (int i = 0; i < 5; i++) {
            assertThrows(IllegalArgumentException.class,
                    () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, "999999")));
        }

        EmailVerificationToken exhausted = tokenRepository.findByEmail(email).orElseThrow();
        assertEquals(5, exhausted.getAttempts());
        assertThrows(IllegalArgumentException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));
    }

    @Test
    void transientFailureRetryDoesNotBypassAttemptLimit() {
        String email = uniqueEmail();
        String otp = "123456";
        saveUser(email);
        saveToken(email, otp, 4);
        doThrow(new org.springframework.data.mongodb.MongoTransactionException("simulated transient failure"))
                .doCallRealMethod().when(tokenRepositorySpy).findByEmail(email);

        assertThrows(IllegalArgumentException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, "999999")));
        assertEquals(5, tokenRepository.findByEmail(email).orElseThrow().getAttempts());
        assertThrows(IllegalArgumentException.class,
                () -> emailOtpService.verifyEmailOtp(new VerifyEmailOtpRequest(email, otp)));
    }

    private User saveUser(String email) {
        return userRepository.save(new User("Replica Test User", email, uniquePhone(), null, null, "password-hash"));
    }

    private EmailVerificationToken saveToken(String email, String otp, int attempts) {
        EmailVerificationToken token = new EmailVerificationToken(email, emailOtpService.hashOtp(email, otp),
                Instant.now().plus(5, ChronoUnit.MINUTES));
        token.setAttempts(attempts);
        return tokenRepository.save(token);
    }

    private String uniqueEmail() {
        return "otp-" + UUID.randomUUID() + "@healthnexus.test";
    }

    private String uniquePhone() {
        return "07" + String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 100000000L));
    }
}
