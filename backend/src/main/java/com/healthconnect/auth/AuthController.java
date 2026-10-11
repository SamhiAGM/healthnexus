package com.healthconnect.auth;

import com.healthconnect.auth.dto.AuthResponse;
import com.healthconnect.auth.dto.LoginRequest;
import com.healthconnect.auth.dto.PatientRegisterRequest;
import com.healthconnect.users.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        try {
            AuthResponse response = authService.registerPatient(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
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
                "assignedFacilityId", user.getAssignedFacilityId() != null ? user.getAssignedFacilityId() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : ""
        ));
    }
}
