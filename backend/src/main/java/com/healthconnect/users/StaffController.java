package com.healthconnect.users;

import com.healthconnect.users.dto.StaffAccessRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    /**
     * Public endpoint for hospital healthcare staff to submit professional credentials
     * and access request for administrator review.
     */
    @PostMapping("/access-requests")
    public ResponseEntity<?> submitAccessRequest(@Valid @RequestBody StaffAccessRequestDto dto) {
        try {
            StaffAccessRequest created = staffService.submitAccessRequest(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Staff access request submitted successfully. Awaiting administrative credential verification.",
                    "requestId", created.getId(),
                    "status", created.getStatus().name(),
                    "requestedRole", created.getRequestedRole().name(),
                    "facility", created.getFacilityName()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check status of a staff access request by email.
     */
    @GetMapping("/access-requests/status")
    public ResponseEntity<?> checkRequestStatus(@RequestParam String email) {
        return staffService.getRequestByEmail(email)
                .map(r -> ResponseEntity.ok(Map.of(
                        "requestId", r.getId(),
                        "fullName", r.getFullName(),
                        "status", r.getStatus().name(),
                        "facility", r.getFacilityName(),
                        "requestedRole", r.getRequestedRole().name(),
                        "createdAt", r.getCreatedAt().toString()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No access request found for email: " + email)));
    }
}
