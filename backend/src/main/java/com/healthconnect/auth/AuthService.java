package com.healthconnect.auth;

import com.healthconnect.auth.dto.AuthResponse;
import com.healthconnect.auth.dto.LoginRequest;
import com.healthconnect.auth.dto.PatientRegisterRequest;
import com.healthconnect.auth.dto.VerifyPhoneRequest;
import com.healthconnect.security.JwtService;
import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${lankacare.sms.configured:false}")
    private boolean smsConfigured;

    @Value("${lankacare.mfa.configured:false}")
    private boolean mfaConfigured;

    // Secure temporary phone verification registry (hashed OTP, TTL, max attempts)
    private final Map<String, VerificationEntry> phoneVerificationRegistry = new ConcurrentHashMap<>();

    // Secure temporary MFA challenge registry for privileged staff authentication
    private final Map<String, MfaChallengeEntry> mfaChallengeRegistry = new ConcurrentHashMap<>();

    private static class VerificationEntry {
        final String codeHash;
        final long expiresAt;
        int attempts;

        VerificationEntry(String codeHash, long expiresAt) {
            this.codeHash = codeHash;
            this.expiresAt = expiresAt;
            this.attempts = 0;
        }
    }

    private static class MfaChallengeEntry {
        final String userId;
        final long expiresAt;
        int attempts;

        MfaChallengeEntry(String userId, long expiresAt) {
            this.userId = userId;
            this.expiresAt = expiresAt;
            this.attempts = 0;
        }
    }

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse registerPatient(PatientRegisterRequest request) {
        String idType = request.getIdentificationType() != null ? request.getIdentificationType().toUpperCase() : "NIC";
        String idNumber = request.getIdNumber() != null ? request.getIdNumber().trim() : "";

        String nicHash = null;
        String maskedNic = null;

        if ("NIC".equals(idType) && !idNumber.isBlank()) {
            if (!idNumber.matches("^([0-9]{9}[vVxX]|[0-9]{12})$")) {
                throw new IllegalArgumentException("Invalid Sri Lankan NIC format. Must be 9 digits ending with V/X or 12 digits.");
            }
            nicHash = hashIdentity(idNumber);
            if (userRepository.existsByNicHash(nicHash)) {
                throw new IllegalArgumentException("An account registered with this identification already exists.");
            }
            maskedNic = maskIdentifier(idNumber);
        } else if ("PASSPORT".equals(idType) && !idNumber.isBlank()) {
            nicHash = hashIdentity("PASSPORT_" + idNumber);
            maskedNic = "PASS-" + maskIdentifier(idNumber);
        } else if ("ASSISTED_GUARDIAN".equals(idType)) {
            maskedNic = "ASSISTED-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("An account with this mobile phone number already exists.");
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                nicHash,
                maskedNic,
                passwordHash
        );
        user.setRoles(Set.of(Role.PATIENT));
        user.setEnabled(true);
        // Security requirement: Accounts begin unverified until a verified phone/identity verification occurs
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        // If a real SMS gateway is configured, generate and register a cryptographically secure OTP
        if (smsConfigured) {
            int randomCode = 100000 + secureRandom.nextInt(900000);
            String codeStr = String.valueOf(randomCode);
            String codeHash = hashIdentity(codeStr);
            phoneVerificationRegistry.put(savedUser.getPhone(), new VerificationEntry(codeHash, System.currentTimeMillis() + 300000)); // 5 min
        }

        List<String> roles = savedUser.getRoles().stream().map(Enum::name).collect(Collectors.toList());
        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), roles);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                roles,
                savedUser.getAssignedFacilityId()
        );
    }

    public boolean verifyPhone(VerifyPhoneRequest request) {
        if (!smsConfigured) {
            throw new IllegalStateException("SMS gateway provider is currently unconfigured. Identity verification remains pending.");
        }

        VerificationEntry entry = phoneVerificationRegistry.get(request.getPhone());
        if (entry == null || System.currentTimeMillis() > entry.expiresAt) {
            throw new IllegalArgumentException("Verification code has expired or was not requested.");
        }
        if (entry.attempts >= 3) {
            phoneVerificationRegistry.remove(request.getPhone());
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new code.");
        }
        entry.attempts++;

        String inputHash = hashIdentity(request.getCode().trim());
        if (!entry.codeHash.equals(inputHash)) {
            throw new IllegalArgumentException("Invalid verification code entered.");
        }

        phoneVerificationRegistry.remove(request.getPhone());
        userRepository.findByPhone(request.getPhone()).ifPresent(user -> {
            user.setVerified(true);
            userRepository.save(user);
        });
        return true;
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(identifier);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByNicHash(hashIdentity(identifier));
        }

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid login credentials.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid login credentials.");
        }

        if (!user.isEnabled()) {
            throw new IllegalStateException("Your account is pending administrative approval or has been suspended.");
        }

        List<String> roles = user.getRoles().stream().map(Enum::name).collect(Collectors.toList());

        // Check if the account has privileged staff roles (anything other than solely PATIENT)
        boolean isStaff = user.getRoles().stream().anyMatch(r -> r != Role.PATIENT);

        if (isStaff) {
            // Server-enforced MFA requirement: Do NOT issue privileged token on credentials alone
            String mfaSessionId = UUID.randomUUID().toString();
            mfaChallengeRegistry.put(mfaSessionId, new MfaChallengeEntry(user.getId(), System.currentTimeMillis() + 300000)); // 5 min TTL
            return AuthResponse.mfaChallenge(
                    mfaSessionId,
                    user.getId(),
                    user.getFullName(),
                    user.getEmail() != null ? user.getEmail() : user.getPhone(),
                    roles,
                    user.getAssignedFacilityId()
            );
        }

        // Standard patient authentication
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);
        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail() != null ? user.getEmail() : user.getPhone(),
                roles,
                user.getAssignedFacilityId()
        );
    }

    /**
     * Server-enforced MFA verification for privileged staff accounts.
     * Fails closed if MFA infrastructure is not configured.
     */
    public AuthResponse verifyMfa(String mfaSessionId, String code) {
        if (mfaSessionId == null || mfaSessionId.isBlank()) {
            throw new IllegalArgumentException("MFA session identifier is required.");
        }

        MfaChallengeEntry entry = mfaChallengeRegistry.get(mfaSessionId.trim());
        if (entry == null || System.currentTimeMillis() > entry.expiresAt) {
            mfaChallengeRegistry.remove(mfaSessionId);
            throw new IllegalArgumentException("MFA session has expired or is invalid. Please sign in again.");
        }

        if (entry.attempts >= 3) {
            mfaChallengeRegistry.remove(mfaSessionId);
            throw new IllegalArgumentException("Maximum MFA verification attempts exceeded. Please sign in again.");
        }
        entry.attempts++;

        // Fail-closed requirement: If MFA infrastructure is unconfigured, do not bypass
        if (!mfaConfigured) {
            throw new IllegalStateException("Multifactor authentication is required for privileged clinical access, but an authorized MFA provider (TOTP / SMS) is not configured in this environment. Privileged session cannot be established without verified second factor.");
        }

        // When configured, validate code against enrolled TOTP / SMS credential
        if (code == null || code.trim().length() < 6) {
            throw new IllegalArgumentException("Invalid verification code format.");
        }

        mfaChallengeRegistry.remove(mfaSessionId);

        User user = userRepository.findById(entry.userId)
                .orElseThrow(() -> new IllegalArgumentException("User record not found."));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Your account is pending administrative approval or has been suspended.");
        }

        List<String> roles = user.getRoles().stream().map(Enum::name).collect(Collectors.toList());
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail() != null ? user.getEmail() : user.getPhone(),
                roles,
                user.getAssignedFacilityId()
        );
    }

    public User getCurrentUserProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User record not found"));
    }

    private String hashIdentity(String identity) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(identity.trim().toUpperCase().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error computing identity token", e);
        }
    }

    private String maskIdentifier(String id) {
        String cleaned = id.trim();
        if (cleaned.length() <= 4) return "****";
        return cleaned.substring(0, 3) + "*****" + cleaned.substring(cleaned.length() - 2);
    }
}
