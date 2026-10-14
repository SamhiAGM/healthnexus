package com.healthconnect.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthconnect.TestRepositoryConfig;
import com.healthconnect.auth.dto.VerifyEmailOtpRequest;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "OTP_HMAC_SECRET=HealthConnectLKTestOtpHmacSecretMustBeAtLeast32Chars2026!"
})
@AutoConfigureMockMvc
@Import(TestRepositoryConfig.class)
class EmailOtpVerificationIntegrationTest {

    @org.springframework.test.context.DynamicPropertySource
    static void registerTestProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("OTP_HMAC_SECRET", () -> "HealthConnectLKTestOtpHmacSecretMustBeAtLeast32Chars2026!");
        registry.add("lankacare.otp.hmac-secret", () -> "HealthConnectLKTestOtpHmacSecretMustBeAtLeast32Chars2026!");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmailOtpService emailOtpService;

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void resetRepositories() {
        reset(tokenRepository, userRepository);
    }

    @Test
    @DisplayName("HTTP verification: synthetic registered user and persisted OTP are verified once")
    void verifiesSyntheticRegisteredUserThroughAuthController() throws Exception {
        String email = "synthetic.patient@healthnexus.lk";
        String otp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(
                email,
                emailOtpService.hashOtp(email, otp),
                Instant.now().plus(5, ChronoUnit.MINUTES)
        );
        User user = new User("Synthetic Patient", email, "0770000000", null, null, "password-hash");

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest(email, otp);
        mockMvc.perform(post("/api/auth/email/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(tokenRepository).delete(token);
        verify(userRepository).save(user);
        verify(userRepository, never()).findByEmailIgnoreCase(anyString());
        assert user.isEmailVerified();
    }

    @Test
    @DisplayName("HTTP verification: missing registered user keeps the token unconsumed")
    void hidesMissingUserBehindGenericVerificationFailure() throws Exception {
        String email = "missing.user@healthnexus.lk";
        String otp = "654321";
        EmailVerificationToken token = new EmailVerificationToken(
                email,
                emailOtpService.hashOtp(email, otp),
                Instant.now().plus(5, ChronoUnit.MINUTES)
        );

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.empty());

        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest(email, otp);
        mockMvc.perform(post("/api/auth/email/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Verification code has expired or was not requested."));

        verify(tokenRepository, never()).delete(any(EmailVerificationToken.class));
        verify(userRepository, never()).save(any(User.class));
    }
}
