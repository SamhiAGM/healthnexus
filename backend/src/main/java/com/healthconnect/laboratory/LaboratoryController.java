package com.healthconnect.laboratory;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/laboratory")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<LabOrder>> getOrders(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(laboratoryService.getLabOrders(facilityId));
    }

    @PostMapping("/orders/{id}/sample")
    public ResponseEntity<?> collectSample(@PathVariable String id) {
        try {
            LabOrder updated = laboratoryService.collectSample(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders/{id}/results")
    public ResponseEntity<?> recordResults(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String results = body.get("results");
        if (results == null || results.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "results is required"));
        }
        String techName = authentication != null ? authentication.getName() : "T. Mendis, MLT";
        try {
            LabOrder updated = laboratoryService.recordResults(id, results, techName);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(laboratoryService.getMetrics(facilityId));
    }
}
