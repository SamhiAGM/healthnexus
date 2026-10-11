package com.healthconnect.supervision;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/supervisor")
public class FieldSupervisorController {

    private final SupervisionService supervisionService;

    public FieldSupervisorController(SupervisionService supervisionService) {
        this.supervisionService = supervisionService;
    }

    /**
     * Retrieve all institutional inspection findings and corrective-action directives.
     */
    @GetMapping("/findings")
    public ResponseEntity<List<InspectionFinding>> getAllFindings() {
        return ResponseEntity.ok(supervisionService.getAllFindings());
    }

    /**
     * Retrieve inspection overview metrics (active findings, verified closed, total).
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(supervisionService.getMetrics());
    }

    /**
     * Log and dispatch a new field inspection finding to hospital administrators.
     */
    @PostMapping("/findings")
    public ResponseEntity<?> createFinding(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String facility = body.get("facility");
        String category = body.get("category");
        String description = body.get("description");
        String severity = body.get("severity");
        String deadline = body.get("deadline");

        if (description == null || description.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "description is required"));
        }

        String inspectorId = authentication != null ? authentication.getName() : "SUP-01";
        String inspectorName = "Supervisory Officer N. Bandara";

        InspectionFinding created = supervisionService.createFinding(
                facility,
                category,
                description,
                severity,
                deadline,
                inspectorId,
                inspectorName
        );

        return ResponseEntity.ok(created);
    }

    /**
     * Cycle the status of an inspection finding (OPEN -> IN_PROGRESS -> VERIFIED_CLOSED -> OPEN).
     */
    @PostMapping("/findings/{identifier}/cycle-status")
    public ResponseEntity<?> cycleStatus(@PathVariable String identifier) {
        try {
            InspectionFinding updated = supervisionService.cycleFindingStatus(identifier);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Set a specific status on a finding.
     */
    @PutMapping("/findings/{identifier}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String identifier,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }
        try {
            InspectionFinding updated = supervisionService.updateFindingStatus(identifier, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
