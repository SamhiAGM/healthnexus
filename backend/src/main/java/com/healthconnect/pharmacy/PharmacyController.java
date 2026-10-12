package com.healthconnect.pharmacy;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    public PharmacyController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> getPrescriptions(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(pharmacyService.getPrescriptions(facilityId));
    }

    @PostMapping("/prescriptions/{id}/dispense")
    public ResponseEntity<?> dispensePrescription(
            @PathVariable String id,
            Authentication authentication
    ) {
        String pharmacistName = authentication != null ? authentication.getName() : "P. Jayasuriya, B.Pharm";
        try {
            Prescription dispensed = pharmacyService.dispensePrescription(id, pharmacistName);
            return ResponseEntity.ok(dispensed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<MedicationStock>> getInventory(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(pharmacyService.getInventory(facilityId));
    }

    @PostMapping("/inventory/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> body) {
        String stockId = (String) body.get("stockId");
        Number change = (Number) body.getOrDefault("change", 0);
        if (stockId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "stockId is required"));
        }
        try {
            MedicationStock updated = pharmacyService.adjustStock(stockId, change.intValue());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(pharmacyService.getMetrics(facilityId));
    }
}
