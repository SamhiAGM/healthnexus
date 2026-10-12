package com.healthconnect.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private static final String SECRET = "HealthConnectLKSuperSecretSecureKeyForJWTSigningMustBe256BitsLong2026!";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 86400000L); // 24 hours
    }

    @Test
    @DisplayName("JWT: Generates valid token and extracts claims accurately")
    void testGenerateTokenAndExtractClaims() {
        String token = jwtService.generateToken("usr-12345", "doctor@lankacare.me", List.of("DOCTOR", "HOSPITAL_ADMIN"));
        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));

        String extractedUserId = jwtService.extractUserId(token);
        assertEquals("usr-12345", extractedUserId);

        var claims = jwtService.extractAllClaims(token);
        assertEquals("doctor@lankacare.me", claims.get("email"));
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles");
        assertTrue(roles.contains("DOCTOR"));
        assertTrue(roles.contains("HOSPITAL_ADMIN"));
    }

    @Test
    @DisplayName("JWT: Recognizes expired token as invalid")
    void testExpiredToken_IsInvalid() {
        JwtService shortLivedJwtService = new JwtService(SECRET, -1000L); // Already expired
        String token = shortLivedJwtService.generateToken("usr-exp", "expired@lankacare.me", List.of("PATIENT"));

        assertFalse(jwtService.isTokenValid(token));
    }

    @Test
    @DisplayName("JWT: Rejects tampered or improperly signed tokens")
    void testTamperedToken_IsInvalid() {
        String token = jwtService.generateToken("usr-tamper", "user@lankacare.me", List.of("PATIENT"));
        String tamperedToken = token + "xyz";

        assertFalse(jwtService.isTokenValid(tamperedToken));
    }
}
