package com.healthconnect.clinics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reception")
public class ReceptionDeskController {

    private final ClinicService clinicService;

    public ReceptionDeskController(ClinicService clinicService) {
        this.clinicService = clinicService;
    }

    /**
     * Retrieve all checked-in tickets for the facility, latest first.
     */
    @GetMapping("/queue")
    public ResponseEntity<List<QueueTicket>> getReceptionQueue(
            @RequestParam(defaultValue = "NHSL") String facilityId
    ) {
        return ResponseEntity.ok(clinicService.getRecentTickets(facilityId));
    }

    /**
     * Issue instantaneous physical and digital clinic queue token for walk-in or checked-in citizen.
     */
    @PostMapping("/ticket/issue")
    public ResponseEntity<?> issueQueueTicket(@RequestBody Map<String, String> body) {
        String patientName = body.get("patientName");
        String patientNic = body.get("patientNic");
        if (patientName == null || patientName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "patientName is required"));
        }
        if (patientNic == null || patientNic.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "patientNic is required"));
        }

        String clinicType = body.getOrDefault("clinicType", body.getOrDefault("clinic", "Cardiology Clinic Room 04"));
        String consultationRoom = body.getOrDefault("consultationRoom", "Room 04");
        String facilityId = body.getOrDefault("facilityId", "NHSL");
        String facilityName = body.getOrDefault("facilityName", "National Hospital of Sri Lanka (NHSL)");
        String priorityTag = body.getOrDefault("priorityTag", body.getOrDefault("priority", "ROUTINE"));
        String complaint = body.getOrDefault("complaint", "General consultation");

        QueueTicket ticket = clinicService.issueQueueTicket(
                patientName,
                patientNic,
                clinicType,
                consultationRoom,
                facilityId,
                facilityName,
                priorityTag,
                complaint
        );

        return ResponseEntity.ok(ticket);
    }

    /**
     * Mark a ticket as cancelled or skipped if patient departs before consultation.
     */
    @PostMapping("/tickets/{ticketNumber}/cancel")
    public ResponseEntity<?> cancelTicket(@PathVariable String ticketNumber) {
        try {
            QueueTicket cancelled = clinicService.cancelTicket(ticketNumber);
            return ResponseEntity.ok(Map.of(
                    "message", "Ticket cancelled successfully",
                    "ticketNumber", cancelled.getTicketNumber(),
                    "status", cancelled.getStatus().name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
