package com.healthconnect.hospitaladmin;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class HospitalAdminService {

    private final HospitalDepartmentRepository departmentRepository;
    private final HospitalAnnouncementRepository announcementRepository;

    public HospitalAdminService(HospitalDepartmentRepository departmentRepository,
                                HospitalAnnouncementRepository announcementRepository) {
        this.departmentRepository = departmentRepository;
        this.announcementRepository = announcementRepository;
    }

    public List<HospitalDepartment> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public HospitalDepartment saveDepartment(HospitalDepartment dept) {
        dept.setUpdatedAt(Instant.now());
        if (dept.getId() == null) {
            dept.setCreatedAt(Instant.now());
        }
        return departmentRepository.save(dept);
    }

    public List<HospitalAnnouncement> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    public HospitalAnnouncement createAnnouncement(HospitalAnnouncement ann) {
        ann.setCreatedAt(Instant.now());
        return announcementRepository.save(ann);
    }

    public Map<String, Object> getOperationalOverview() {
        List<HospitalDepartment> depts = departmentRepository.findAll();
        int totalBeds = depts.stream().mapToInt(HospitalDepartment::getBedCapacity).sum();
        int occupiedBeds = depts.stream().mapToInt(HospitalDepartment::getOccupiedBeds).sum();
        int totalStaff = depts.stream().mapToInt(HospitalDepartment::getTotalStaff).sum();
        long activeDepts = depts.stream().filter(d -> !"UNDER_MAINTENANCE".equalsIgnoreCase(d.getStatus())).count();

        double occupancyRate = totalBeds > 0 ? ((double) occupiedBeds / totalBeds) * 100.0 : 0.0;

        return Map.of(
                "totalDepartments", depts.size(),
                "activeDepartments", activeDepts,
                "totalBeds", totalBeds,
                "occupiedBeds", occupiedBeds,
                "occupancyRatePercentage", Math.round(occupancyRate * 10.0) / 10.0,
                "totalStaffDeployed", totalStaff,
                "facilityName", "National Hospital of Sri Lanka (NHSL Colombo)"
        );
    }

    public void seedInitialHospitalDataIfEmpty() {
        if (departmentRepository.count() == 0) {
            HospitalDepartment d1 = new HospitalDepartment(
                    "Cardiology & Coronary Care", "CARD-01", "Dr. A. Seneviratne", 42, 60, 48, "OPERATIONAL"
            );
            HospitalDepartment d2 = new HospitalDepartment(
                    "Emergency Treatment Unit (ETU)", "ETU-01", "Dr. M. Fernando", 58, 30, 26, "HIGH_DEMAND"
            );
            HospitalDepartment d3 = new HospitalDepartment(
                    "Paediatrics & Neonatal Care", "PAED-02", "Dr. P. Jayawardena", 36, 45, 30, "OPERATIONAL"
            );
            HospitalDepartment d4 = new HospitalDepartment(
                    "Orthopaedics & Trauma", "ORTHO-03", "Dr. R. Wickramasinghe", 28, 40, 22, "OPERATIONAL"
            );
            HospitalDepartment d5 = new HospitalDepartment(
                    "Radiology & Imaging Suite", "RAD-01", "Dr. S. Gunaratne", 18, 10, 8, "OPERATIONAL"
            );
            departmentRepository.saveAll(List.of(d1, d2, d3, d4, d5));
        }

        if (announcementRepository.count() == 0) {
            HospitalAnnouncement a1 = new HospitalAnnouncement(
                    "ETU Triage Priority Advisory - Dengue Season",
                    "All arriving fever cases with platelet counts below 100k must be routed to Immediate Triage Bay 2.",
                    "Emergency Treatment Unit (ETU)",
                    "URGENT",
                    "Medical Superintendent"
            );
            HospitalAnnouncement a2 = new HospitalAnnouncement(
                    "Quarterly Biomedical Equipment Calibration",
                    "ECG and defibrillator calibration scheduled for Friday 14:00 in Ward 7 & Ward 9.",
                    "ALL",
                    "ROUTINE",
                    "Clinical Engineering Division"
            );
            announcementRepository.saveAll(List.of(a1, a2));
        }
    }
}
