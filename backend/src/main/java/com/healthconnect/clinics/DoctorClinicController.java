package com.healthconnect.clinics;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorClinicController {

    private final ClinicService clinicService;

    public DoctorClinicController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    /**
     * Retrieve today's clinic queue tickets for the physician's facility.
     */
    @GetMapping("/queue")
    public ResponseEntity<List<QueueTicket>> getDoctorQueue(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(clinicService.getAllTicketsForFacility(facilityId));
    }

    /**
     * Update the active queue ticket status (CALLED, IN_CONSULTATION, SKIPPED).
     */
    @PostMapping("/queue/status")
    public ResponseEntity<?> updateTicketStatus(
            @RequestBody Map<String, String> body
    ) {
        String token = body.get("token");
        String statusStr = body.get("status");
        if (token == null || statusStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "token and status are required"));
        }
        try {
            QueueTicket.QueueStatus status = QueueTicket.QueueStatus.valueOf(statusStr.toUpperCase());
            QueueTicket updated = clinicService.updateTicketStatus(token, status);
            return ResponseEntity.ok(Map.of(
                    "token", updated.getTicketNumber(),
                    "status", updated.getStatus().name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Complete consultation, persist clinical notes, prescriptions, and lab orders to MongoDB.
     */
    @PostMapping("/consultations")
    public ResponseEntity<?> saveConsultation(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        try {
            String token = (String) body.get("token");
            String patientId = (String) body.get("patientId");
            String patientName = (String) body.get("patientName");
            String facilityId = (String) body.getOrDefault("facilityId", "NHSL");
            String notes = (String) body.get("notes");
            
            @SuppressWarnings("unchecked")
            List<String> prescriptions = (List<String>) body.getOrDefault("prescriptions", List.of());
            @SuppressWarnings("unchecked")
            List<String> labOrders = (List<String>) body.getOrDefault("labOrders", List.of());

            String doctorId = authentication != null ? authentication.getName() : "DOC-01";
            String doctorName = "Dr. Samantha Senanayake, MBBS";

            ConsultationRecord record = clinicService.recordConsultation(
                    token, patientId, patientName, doctorId, doctorName, facilityId, notes, prescriptions, labOrders
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Consultation recorded and queue ticket resolved.",
                    "recordId", record.getId(),
                    "ticketNumber", record.getQueueTicketNumber()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
