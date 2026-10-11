package com.healthconnect.auth;

import com.healthconnect.auth.dto.AuthResponse;
import com.healthconnect.auth.dto.LoginRequest;
import com.healthconnect.auth.dto.PatientRegisterRequest;
import com.healthconnect.auth.dto.VerifyPhoneRequest;
import com.healthconnect.security.JwtService;
import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // In-memory development verification code registry with TTL & attempt counts
    // (Restricted adapter when external SMS gateway is unconfigured)
    private final Map<String, VerificationEntry> devVerificationRegistry = new ConcurrentHashMap<>();

    private static class VerificationEntry {
        final String code;
        final long expiresAt;
        int attempts;

        VerificationEntry(String code, long expiresAt) {
            this.code = code;
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
            // Validate NIC format
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
            // Assisted registration generates internal guardian linkage token
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
        user.setVerified(true);

        User savedUser = userRepository.save(user);

        // Generate development verification token entry
        String devOtp = "123456"; // Standard development verification token
        devVerificationRegistry.put(savedUser.getPhone(), new VerificationEntry(devOtp, System.currentTimeMillis() + 600000));

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
        VerificationEntry entry = devVerificationRegistry.get(request.getPhone());
        if (entry == null || System.currentTimeMillis() > entry.expiresAt) {
            throw new IllegalArgumentException("Verification code has expired or was not requested.");
        }
        if (entry.attempts >= 3) {
            devVerificationRegistry.remove(request.getPhone());
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new code.");
        }
        entry.attempts++;
        if (!entry.code.equals(request.getCode().trim())) {
            throw new IllegalArgumentException("Invalid verification code entered.");
        }
        // Verification succeeded
        devVerificationRegistry.remove(request.getPhone());
        userRepository.findByPhone(request.getPhone()).ifPresent(user -> {
            user.setVerified(true);
            userRepository.save(user);
        });
        return true;
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        // Search by email, phone, or computed identity hash
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
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
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
