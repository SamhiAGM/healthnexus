package com.healthconnect.coordinator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coordinator")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ClinicCoordinatorController {

    private final ClinicCoordinatorService service;

    public ClinicCoordinatorController(ClinicCoordinatorService service) {
        this.service = service;
        this.service.seedInitialSessionsIfEmpty();
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ClinicSessionSchedule>> getAllSessions() {
        return ResponseEntity.ok(service.getAllSessions());
    }

    @PostMapping("/sessions")
    public ResponseEntity<ClinicSessionSchedule> saveSession(@RequestBody ClinicSessionSchedule session) {
        return ResponseEntity.ok(service.saveSession(session));
    }

    @PatchMapping("/sessions/{id}/capacity")
    public ResponseEntity<ClinicSessionSchedule> updateCapacity(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        int capacity = Integer.parseInt(body.get("capacity").toString());
        String status = (String) body.get("status");
        return ResponseEntity.ok(service.updateCapacityAndStatus(id, capacity, status));
    }

    @GetMapping("/workload")
    public ResponseEntity<Map<String, Object>> getWorkload() {
        return ResponseEntity.ok(service.getWorkloadOverview());
    }
}
