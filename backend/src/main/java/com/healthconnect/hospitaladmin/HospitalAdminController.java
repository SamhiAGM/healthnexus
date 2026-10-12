package com.healthconnect.hospitaladmin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospital-admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class HospitalAdminController {

    private final HospitalAdminService service;

    public HospitalAdminController(HospitalAdminService service) {
        this.service = service;
        this.service.seedInitialHospitalDataIfEmpty();
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(service.getOperationalOverview());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<HospitalDepartment>> getDepartments() {
        return ResponseEntity.ok(service.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<HospitalDepartment> saveDepartment(@RequestBody HospitalDepartment dept) {
        return ResponseEntity.ok(service.saveDepartment(dept));
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<HospitalAnnouncement>> getAnnouncements() {
        return ResponseEntity.ok(service.getAllAnnouncements());
    }

    @PostMapping("/announcements")
    public ResponseEntity<HospitalAnnouncement> createAnnouncement(@RequestBody HospitalAnnouncement announcement) {
        return ResponseEntity.ok(service.createAnnouncement(announcement));
    }
}
