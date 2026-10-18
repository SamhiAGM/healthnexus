package com.healthconnect.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthconnect.TestRepositoryConfig;
import com.healthconnect.auth.dto.ForgotPasswordRequest;
import com.healthconnect.auth.dto.ResetPasswordRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestRepositoryConfig.class)
@SuppressWarnings({"unused", "removal"})
class AuthControllerPasswordResetTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PasswordResetService passwordResetService;

    @MockBean
    private EmailOtpService emailOtpService;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/forgot-password returns 200 OK with privacy-preserving payload")
    void forgotPassword_endpoint_success() throws Exception {
        when(passwordResetService.sendRecoveryCode(any(ForgotPasswordRequest.class)))
                .thenReturn(Map.of(
                        "success", true,
                        "message", "If an account associated with this email exists, password reset instructions with a secure recovery code have been sent.",
                        "cooldownSeconds", 60,
                        "expiresInSeconds", 900
                ));

        ForgotPasswordRequest req = new ForgotPasswordRequest("citizen.perera@example.lk");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.cooldownSeconds").value(60));

        verify(passwordResetService).sendRecoveryCode(any(ForgotPasswordRequest.class));
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password returns 400 Bad Request on invalid email")
    void forgotPassword_invalidEmail() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest("invalid-not-an-email");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        verify(passwordResetService, never()).sendRecoveryCode(any());
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password returns 429 Too Many Requests when cooldown is active")
    void forgotPassword_rateLimited() throws Exception {
        when(passwordResetService.sendRecoveryCode(any(ForgotPasswordRequest.class)))
                .thenThrow(new IllegalStateException("Please wait 45 seconds before requesting another recovery code."));

        ForgotPasswordRequest req = new ForgotPasswordRequest("citizen.perera@example.lk");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Please wait 45 seconds before requesting another recovery code."));
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password returns 503 when email delivery is unconfigured")
    void forgotPassword_unconfiguredProvider() throws Exception {
        when(passwordResetService.sendRecoveryCode(any(ForgotPasswordRequest.class)))
                .thenThrow(new IllegalStateException("Email delivery service is currently unconfigured."));

        ForgotPasswordRequest req = new ForgotPasswordRequest("citizen.perera@example.lk");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("Email delivery service is currently unconfigured."));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password returns 200 OK and clears session cookie")
    void resetPassword_endpoint_success() throws Exception {
        when(passwordResetService.resetPassword(any(ResetPasswordRequest.class))).thenReturn(true);

        ResetPasswordRequest req = new ResetPasswordRequest("citizen.perera@example.lk", "619284", "NewStrongPassword2026!#");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(header().exists("Set-Cookie"));

        verify(passwordResetService).resetPassword(any(ResetPasswordRequest.class));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password returns 400 Bad Request on invalid token or password mismatch")
    void resetPassword_invalidToken() throws Exception {
        when(passwordResetService.resetPassword(any(ResetPasswordRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid recovery code. 3 attempt(s) remaining."));

        ResetPasswordRequest req = new ResetPasswordRequest("citizen.perera@example.lk", "000000", "NewStrongPassword2026!#");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid recovery code. 3 attempt(s) remaining."));
    }
}