package com.healthconnect.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/database")
public class DatabaseAuditController {

    private final DatabaseAuditCleanupService cleanupService;

    public DatabaseAuditController(DatabaseAuditCleanupService cleanupService) {
        this.cleanupService = cleanupService;
    }

    @GetMapping("/audit-dry-run")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> getDryRunAuditReport() {
        return ResponseEntity.ok(cleanupService.generateDryRunAuditReport());
    }

    @PostMapping("/execute-cleanup")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> executeCleanup(
            @RequestParam(defaultValue = "true") boolean dryRun,
            @RequestBody(required = false) Map<String, String> body
    ) {
        try {
            String approvalCode = body != null ? body.get("ownerApprovalCode") : null;
            Map<String, Object> result = cleanupService.executeCleanup(dryRun, approvalCode);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
