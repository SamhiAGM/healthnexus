package com.healthconnect.security;

import com.healthconnect.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
public class JwtService {

    public static final String CLAIM_TOKEN_VERSION = "tokenVersion";

    private final SecretKey secretKey;
    private final long jwtExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long jwtExpirationMs // 24 hours
    ) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET must be configured before the application can start.");
        }
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public String generateToken(String userId, String email, List<String> roles) {
        return generateToken(userId, email, roles, 0);
    }

    public String generateToken(String userId, String email, List<String> roles, Integer tokenVersion) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        int version = tokenVersion != null ? tokenVersion : 0;

        return Jwts.builder()
                .subject(userId)
                .claim("email", email != null ? email : "")
                .claim("roles", roles)
                .claim(CLAIM_TOKEN_VERSION, version)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractIssuedAt(String token) {
        try {
            return extractAllClaims(token).getIssuedAt();
        } catch (Exception e) {
            return null;
        }
    }

    public Integer extractTokenVersion(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object tv = claims.get(CLAIM_TOKEN_VERSION);
            if (tv == null) {
                return null;
            }
            if (tv instanceof Number number) {
                return number.intValue();
            }
            if (tv instanceof String str && !str.isBlank()) {
                return Integer.parseInt(str.trim());
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Checks if a token was issued prior to a timestamp.
     * Note: Standard JWT epoch-second truncation can prevent distinguishing tokens issued
     * within the same second as a timestamp. For deterministic per-user session invalidation,
     * use {@link #isSessionValid(String, User)}.
     */
    public boolean isTokenIssuedBefore(String token, Instant timestamp) {
        if (timestamp == null) {
            return false;
        }
        Date issuedAt = extractIssuedAt(token);
        if (issuedAt == null) {
            return true;
        }
        return issuedAt.toInstant().isBefore(timestamp);
    }

    /**
     * Validates whether an incoming token's session version is valid for the specified user state.
     *
     * Invalidation rules:
     * 1. If the token contains a tokenVersion claim:
     *    - It must parse to a valid integer.
     *    - It must strictly match the user's current tokenVersion (user.getTokenVersion()).
     *    - If the user underwent a password reset, user's tokenVersion was incremented, so any token
     *      issued with an older version (including within the same second) is invalidated immediately.
     * 2. If the token lacks a tokenVersion claim (legacy token):
     *    - If the user has undergone a password reset (tokenVersion > 0 or passwordChangedAt != null),
     *      the legacy token is rejected.
     *    - If the user has never reset their password (tokenVersion == 0 and passwordChangedAt == null),
     *      the legacy token is accepted to preserve uninterrupted active sessions.
     * 3. If the token is malformed, has invalid claim types, is expired, or tampered, returns false.
     */
    public boolean isSessionValid(String token, User user) {
        if (user == null || token == null) {
            return false;
        }
        return isSessionValid(token, user.getTokenVersion(), user.getPasswordChangedAt());
    }

    public boolean isSessionValid(String token, Integer expectedVersion, Instant passwordChangedAt) {
        if (token == null || !isTokenValid(token)) {
            return false;
        }

        int requiredVersion = expectedVersion != null ? expectedVersion : 0;

        try {
            Claims claims = extractAllClaims(token);
            if (claims == null) {
                return false;
            }

            if (claims.containsKey(CLAIM_TOKEN_VERSION)) {
                Object tvObj = claims.get(CLAIM_TOKEN_VERSION);
                if (tvObj == null) {
                    return false;
                }
                int tokenVersion;
                if (tvObj instanceof Number number) {
                    tokenVersion = number.intValue();
                } else if (tvObj instanceof String str && !str.isBlank()) {
                    try {
                        tokenVersion = Integer.parseInt(str.trim());
                    } catch (NumberFormatException e) {
                        return false;
                    }
                } else {
                    return false;
                }

                return tokenVersion == requiredVersion;
            }

            // Legacy token handling (no tokenVersion claim present in payload):
            // If the user's password was changed or session version incremented, reject legacy token
            if (requiredVersion > 0 || passwordChangedAt != null) {
                return false;
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
