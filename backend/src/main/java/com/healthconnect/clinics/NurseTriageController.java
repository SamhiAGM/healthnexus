package com.healthconnect.clinics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurse")
public class NurseTriageController {

    private final ClinicService clinicService;

    public NurseTriageController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    /**
     * Retrieve all arrived patients awaiting triage vitals.
     */
    @GetMapping("/queue")
    public ResponseEntity<List<QueueTicket>> getNurseTriageQueue(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(clinicService.getAllTicketsForFacility(facilityId));
    }

    /**
     * Save patient vitals (BP, Pulse, Temperature, SpO2) and forward directly
     * to the physician consultation worklist.
     */
    @PostMapping("/vitals")
    public ResponseEntity<?> recordTriageVitals(
            @RequestBody Map<String, String> body
    ) {
        String token = body.get("token");
        String bp = body.getOrDefault("bp", "");
        String pulse = body.getOrDefault("pulse", "");
        String temp = body.getOrDefault("temp", "");
        String spo2 = body.getOrDefault("spo2", "");
        String urgency = body.getOrDefault("urgency", "ROUTINE");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "token is required"));
        }

        String vitalsSummary = String.format("BP: %s mmHg, HR: %s bpm, Temp: %s°C, SpO2: %s%%", bp, pulse, temp, spo2);

        try {
            QueueTicket updated = clinicService.updateTicketVitals(token, vitalsSummary, urgency);
            return ResponseEntity.ok(Map.of(
                    "message", "Patient triage vitals recorded and forwarded to physician.",
                    "token", updated.getTicketNumber(),
                    "vitals", updated.getVitalsSummary()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
