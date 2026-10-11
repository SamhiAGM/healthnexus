package com.healthconnect.auth;

import com.healthconnect.auth.dto.AuthResponse;
import com.healthconnect.auth.dto.LoginRequest;
import com.healthconnect.auth.dto.PatientRegisterRequest;
import com.healthconnect.auth.dto.VerifyPhoneRequest;
import com.healthconnect.users.User;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/patients/register")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientRegisterRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.registerPatient(request);
            attachHttpOnlyCookie(response, authResponse.getToken());
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/phone/verify")
    public ResponseEntity<?> verifyPhone(@Valid @RequestBody VerifyPhoneRequest request) {
        try {
            boolean verified = authService.verifyPhone(request);
            return ResponseEntity.ok(Map.of("success", verified, "message", "Phone verified successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);
            attachHttpOnlyCookie(response, authResponse.getToken());
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear secure HTTP-only cookie
        ResponseCookie deleteCookie = ResponseCookie.from("hc_session", "")
                .httpOnly(true)
                .secure(false) // Set to true in HTTPS production
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.ok(Map.of("message", "Session terminated successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        User user = authService.getCurrentUserProfile(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phone", user.getPhone(),
                "maskedNic", user.getMaskedNic() != null ? user.getMaskedNic() : "",
                "roles", user.getRoles(),
                "verified", user.isVerified(),
                "assignedFacilityId", user.getAssignedFacilityId() != null ? user.getAssignedFacilityId() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : ""
        ));
    }

    private void attachHttpOnlyCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("hc_session", token)
                .httpOnly(true)
                .secure(false) // Set to true in HTTPS production
                .path("/")
                .maxAge(86400) // 24 hours
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
