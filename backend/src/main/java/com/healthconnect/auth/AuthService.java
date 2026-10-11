package com.healthconnect.auth;

import com.healthconnect.auth.dto.AuthResponse;
import com.healthconnect.auth.dto.LoginRequest;
import com.healthconnect.auth.dto.PatientRegisterRequest;
import com.healthconnect.security.JwtService;
import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse registerPatient(PatientRegisterRequest request) {
        // Compute SHA-256 hash for secure NIC uniqueness check
        String nicHash = hashNic(request.getNic());

        if (userRepository.existsByNicHash(nicHash)) {
            throw new IllegalArgumentException("An account registered with this NIC already exists.");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("An account with this mobile phone number already exists.");
        }

        String maskedNic = maskNic(request.getNic());
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

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        // Search by email, phone, or computed NIC hash
        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(identifier);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByNicHash(hashNic(identifier));
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

    private String hashNic(String nic) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(nic.trim().toUpperCase().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error computing identity token", e);
        }
    }

    private String maskNic(String nic) {
        String cleaned = nic.trim();
        if (cleaned.length() <= 4) return "****";
        return cleaned.substring(0, 3) + "*****" + cleaned.substring(cleaned.length() - 2);
    }
}
