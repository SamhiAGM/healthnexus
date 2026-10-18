package com.healthconnect.security;

import com.healthconnect.users.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings("unused")
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
        assertEquals(0, jwtService.extractTokenVersion(token));
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

    @Test
    @DisplayName("JWT: Invalidation detects tokens issued prior to password change")
    void testTokenIssuedBeforePasswordChange_IsRevoked() {
        String token = jwtService.generateToken("usr-101", "patient@example.lk", List.of("PATIENT"));
        Date issuedAt = jwtService.extractIssuedAt(token);
        assertNotNull(issuedAt);

        // Password was changed 10 seconds after token issuance
        Instant passwordChangedAfter = issuedAt.toInstant().plusSeconds(10);
        assertTrue(jwtService.isTokenIssuedBefore(token, passwordChangedAfter),
                "Token issued before password change should be identified as revoked");
    }

    @Test
    @DisplayName("JWT: Token issued after password change remains valid")
    void testTokenIssuedAfterPasswordChange_IsValid() {
        Instant passwordChangedEarlier = Instant.now().minusSeconds(60);
        String token = jwtService.generateToken("usr-101", "patient@example.lk", List.of("PATIENT"));

        assertFalse(jwtService.isTokenIssuedBefore(token, passwordChangedEarlier),
                "Token issued after password change must remain valid");
    }

    @Test
    @DisplayName("JWT: Token remains valid when password was never changed (null timestamp)")
    void testTokenWithNullPasswordChangedAt_IsValid() {
        String token = jwtService.generateToken("usr-101", "patient@example.lk", List.of("PATIENT"));
        assertFalse(jwtService.isTokenIssuedBefore(token, null),
                "Token for user who never changed password must not be considered revoked");
    }

    @Test
    @DisplayName("Session Invalidation: Token issued before reset is invalidated")
    void testSessionValidation_TokenIssuedBeforeReset_IsRevoked() {
        User user = new User("Test User", "test@example.lk", "0771112233", "hash", "199*****01", "old_pass");
        user.setId("usr-001");
        user.setTokenVersion(0);

        String oldToken = jwtService.generateToken(user.getId(), user.getEmail(), List.of("PATIENT"), user.getTokenVersion());
        assertTrue(jwtService.isSessionValid(oldToken, user), "Token must be valid initially");

        // Password reset occurs
        user.incrementTokenVersion(); // version becomes 1
        user.setPasswordChangedAt(Instant.now());

        assertFalse(jwtService.isSessionValid(oldToken, user),
                "Token issued prior to password reset must be immediately invalidated");
    }

    @Test
    @DisplayName("Session Invalidation: Token issued in the same second before reset is invalidated")
    void testSessionValidation_TokenIssuedInSameSecondBeforeReset_IsRevoked() {
        User user = new User("Test User", "test@example.lk", "0771112233", "hash", "199*****01", "old_pass");
        user.setId("usr-001");
        user.setTokenVersion(0);

        // Token issued at current instant
        String sameSecondOldToken = jwtService.generateToken(user.getId(), user.getEmail(), List.of("PATIENT"), user.getTokenVersion());

        // Password reset occurs in the exact same second
        user.incrementTokenVersion(); // version becomes 1
        user.setPasswordChangedAt(Instant.now());

        assertFalse(jwtService.isSessionValid(sameSecondOldToken, user),
                "Token issued in the same second before reset must be invalidated by tokenVersion");
    }

    @Test
    @DisplayName("Session Invalidation: New token generated immediately after reset works even in same second")
    void testSessionValidation_NewTokenIssuedImmediatelyAfterReset_IsValidEvenInSameSecond() {
        User user = new User("Test User", "test@example.lk", "0771112233", "hash", "199*****01", "old_pass");
        user.setId("usr-001");
        user.setTokenVersion(0);

        // Password reset occurs
        user.incrementTokenVersion(); // version becomes 1
        user.setPasswordChangedAt(Instant.now());

        // New token issued immediately in the same second
        String newToken = jwtService.generateToken(user.getId(), user.getEmail(), List.of("PATIENT"), user.getTokenVersion());

        assertTrue(jwtService.isSessionValid(newToken, user),
                "New token generated after reset must work immediately, even in the same second");
    }

    @Test
    @DisplayName("Session Invalidation: Legacy token without tokenVersion claim is revoked if user reset password")
    void testSessionValidation_LegacyToken_RevokedAfterPasswordReset() {
        User user = new User("Test User", "test@example.lk", "0771112233", "hash", "199*****01", "old_pass");
        user.setId("usr-001");
        user.setTokenVersion(1);
        user.setPasswordChangedAt(Instant.now());

        // Create legacy token without tokenVersion claim
        String legacyToken = Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("roles", List.of("PATIENT"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000L))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertFalse(jwtService.isSessionValid(legacyToken, user),
                "Legacy token without tokenVersion must be revoked if password was reset");
    }

    @Test
    @DisplayName("Session Invalidation: Legacy token without tokenVersion claim remains valid for unaffected user")
    void testSessionValidation_LegacyToken_ValidForUnaffectedUser() {
        User user = new User("Test User", "test@example.lk", "0771112233", "hash", "199*****01", "pass");
        user.setId("usr-001");
        user.setTokenVersion(0);
        user.setPasswordChangedAt(null);

        // Create legacy token without tokenVersion claim
        String legacyToken = Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("roles", List.of("PATIENT"))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000L))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertTrue(jwtService.isSessionValid(legacyToken, user),
                "Legacy token must remain valid for unaffected user who never reset password");
    }

    @Test
    @DisplayName("Session Invalidation: Missing or malformed token claims are rejected")
    void testSessionValidation_MalformedClaims_AreRejected() {
        User user = new User("Test User", "test@example.lk", "0771112233", "hash", "199*****01", "pass");
        user.setId("usr-001");
        user.setTokenVersion(0);

        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

        // Malformed non-numeric tokenVersion string
        String stringVersionToken = Jwts.builder()
                .subject(user.getId())
                .claim("tokenVersion", "not-a-number")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000L))
                .signWith(key)
                .compact();
        assertFalse(jwtService.isSessionValid(stringVersionToken, user), "Non-integer string claim must be rejected");

        // Malformed non-primitive claim type (e.g. list)
        String listVersionToken = Jwts.builder()
                .subject(user.getId())
                .claim("tokenVersion", List.of(1, 2, 3))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000L))
                .signWith(key)
                .compact();
        assertFalse(jwtService.isSessionValid(listVersionToken, user), "List claim must be rejected");

        // Null token or empty token
        assertFalse(jwtService.isSessionValid(null, user), "Null token must be rejected");
        assertFalse(jwtService.isSessionValid("", user), "Empty token must be rejected");

        // Tampered signature token
        String validToken = jwtService.generateToken(user.getId(), user.getEmail(), List.of("PATIENT"), 0);
        assertFalse(jwtService.isSessionValid(validToken + "tamper", user), "Tampered token must be rejected");
    }

    @Test
    @DisplayName("Session Invalidation: Unaffected users retain their valid sessions when other users reset password")
    void testSessionValidation_UnaffectedUsers_RetainTheirValidSessions() {
        User userA = new User("User A", "usera@example.lk", "0771111111", "hashA", "199*****01", "passA");
        userA.setId("usr-A");
        userA.setTokenVersion(0);

        User userB = new User("User B", "userb@example.lk", "0772222222", "hashB", "199*****02", "passB");
        userB.setId("usr-B");
        userB.setTokenVersion(0);

        String tokenA = jwtService.generateToken(userA.getId(), userA.getEmail(), List.of("PATIENT"), userA.getTokenVersion());
        String tokenB = jwtService.generateToken(userB.getId(), userB.getEmail(), List.of("PATIENT"), userB.getTokenVersion());

        // User A resets password
        userA.incrementTokenVersion(); // version 1
        userA.setPasswordChangedAt(Instant.now());

        // User A's old token is invalidated
        assertFalse(jwtService.isSessionValid(tokenA, userA), "User A's old token must be invalidated");

        // User B's token remains completely valid
        assertTrue(jwtService.isSessionValid(tokenB, userB), "User B's session must remain valid and unaffected");
    }
}
