package com.healthconnect.auth;

import com.healthconnect.auth.dto.*;
import com.healthconnect.users.User;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
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
    private final EmailOtpService emailOtpService;

    @Value("${lankacare.cookie.secure:true}")
    private boolean secureCookie;

    public AuthController(AuthService authService, EmailOtpService emailOtpService) {
        this.authService = authService;
        this.emailOtpService = emailOtpService;
    }

    @PostMapping("/patients/register")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientRegisterRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.registerPatient(request);
            if (authResponse.getToken() != null) {
                attachHttpOnlyCookie(response, authResponse.getToken());
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/email/send-otp")
    public ResponseEntity<?> sendEmailOtp(@Valid @RequestBody RequestEmailOtpRequest request) {
        try {
            emailOtpService.sendEmailOtp(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Verification code sent to your email address. Please check your inbox."
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/email/resend-otp")
    public ResponseEntity<?> resendEmailOtp(@Valid @RequestBody RequestEmailOtpRequest request) {
        return sendEmailOtp(request);
    }

    @PostMapping("/email/verify-otp")
    public ResponseEntity<?> verifyEmailOtp(@Valid @RequestBody VerifyEmailOtpRequest request) {
        try {
            boolean verified = emailOtpService.verifyEmailOtp(request);
            return ResponseEntity.ok(Map.of(
                    "success", verified,
                    "message", "Email address verified successfully."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/phone/verify")
    public ResponseEntity<?> verifyPhone(@Valid @RequestBody VerifyPhoneRequest request) {
        try {
            boolean verified = authService.verifyPhone(request);
            return ResponseEntity.ok(Map.of("success", verified, "message", "Phone verified successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);
            if (authResponse.isMfaRequired()) {
                // Secondary verification required for privileged access; do not establish session yet
                return ResponseEntity.ok(authResponse);
            }
            attachHttpOnlyCookie(response, authResponse.getToken());
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody Map<String, String> body, HttpServletResponse response) {
        try {
            String mfaSessionId = body != null ? body.get("mfaSessionId") : null;
            String code = body != null ? body.get("code") : null;

            AuthResponse authResponse = authService.verifyMfa(mfaSessionId, code);
            attachHttpOnlyCookie(response, authResponse.getToken());
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear secure HTTP-only cookie across all subdomains/paths
        ResponseCookie deleteCookie = ResponseCookie.from("hc_session", "")
                .httpOnly(true)
                .secure(secureCookie)
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
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "maskedNic", user.getMaskedNic() != null ? user.getMaskedNic() : "",
                "roles", user.getRoles(),
                "verified", user.isVerified(),
                "emailVerified", user.isEmailVerified(),
                "assignedFacilityId", user.getAssignedFacilityId() != null ? user.getAssignedFacilityId() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : ""
        ));
    }

    private void attachHttpOnlyCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("hc_session", token)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(86400) // 24 hours
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .findFirst()
                .orElse("Validation error in request parameters");
        return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
    }
}
