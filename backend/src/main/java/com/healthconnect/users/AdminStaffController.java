package com.healthconnect.users;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/staff")
public class AdminStaffController {

    private final StaffService staffService;

    public AdminStaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    /**
     * Retrieve all pending staff access requests for administrative review.
     * Optionally filtered by facility.
     */
    @GetMapping("/requests")
    public ResponseEntity<List<StaffAccessRequest>> getPendingRequests(
            @RequestParam(required = false) String facilityId
    ) {
        return ResponseEntity.ok(staffService.getPendingRequests(facilityId));
    }

    /**
     * Retrieve a specific staff access request by ID.
     */
    @GetMapping("/requests/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable String id) {
        return staffService.getRequestById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Approve a pending staff access request, provisioning the User account with authorized role.
     */
    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        try {
            String adminId = authentication != null ? authentication.getName() : "ADMIN_USER";
            String adminName = "Authorized Administrator";
            String notes = body != null ? body.get("notes") : "Approved after institutional verification.";

            StaffAccessRequest approved = staffService.approveStaffRequest(id, adminId, adminName, notes);
            return ResponseEntity.ok(Map.of(
                    "message", "Staff account approved and clinical credentials activated.",
                    "requestId", approved.getId(),
                    "status", approved.getStatus().name(),
                    "activatedRole", approved.getRequestedRole().name(),
                    "email", approved.getWorkEmail()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject a pending staff access request with an audit explanation.
     */
    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        try {
            String adminId = authentication != null ? authentication.getName() : "ADMIN_USER";
            String adminName = "Authorized Administrator";
            String reason = body != null ? body.get("reason") : "Application rejected by administrator.";

            StaffAccessRequest rejected = staffService.rejectStaffRequest(id, adminId, adminName, reason);
            return ResponseEntity.ok(Map.of(
                    "message", "Staff access request rejected.",
                    "requestId", rejected.getId(),
                    "status", rejected.getStatus().name()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
