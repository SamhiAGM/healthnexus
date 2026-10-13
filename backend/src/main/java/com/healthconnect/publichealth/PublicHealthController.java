package com.healthconnect.publichealth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public-health")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@SuppressWarnings("null")
public class PublicHealthController {

    private final PublicHealthService service;

    public PublicHealthController(PublicHealthService service) {
        this.service = service;
    }

    @GetMapping("/activities")
    public ResponseEntity<List<PublicHealthActivity>> getAllActivities() {
        return ResponseEntity.ok(service.getAllActivities());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<PublicHealthActivity> list = service.getAllActivities();
        long completed = list.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();
        long inProgress = list.stream().filter(a -> "IN_PROGRESS".equalsIgnoreCase(a.getStatus())).count();
        long scheduled = list.stream().filter(a -> "SCHEDULED".equalsIgnoreCase(a.getStatus())).count();
        int totalHouseholds = list.stream().mapToInt(PublicHealthActivity::getTargetHouseholdCount).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCampaigns", list.size());
        summary.put("completed", completed);
        summary.put("inProgress", inProgress);
        summary.put("scheduled", scheduled);
        summary.put("targetHouseholds", totalHouseholds);
        summary.put("status", "HEALTH_SURVEILLANCE_ACTIVE");

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/activities")
    public ResponseEntity<PublicHealthActivity> createActivity(@RequestBody PublicHealthActivity activity) {
        return ResponseEntity.ok(service.createActivity(activity));
    }

    @PatchMapping("/activities/{id}/status")
    public ResponseEntity<PublicHealthActivity> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String observations = body.get("observations");
        return ResponseEntity.ok(service.updateStatus(id, status, observations));
    }
}
