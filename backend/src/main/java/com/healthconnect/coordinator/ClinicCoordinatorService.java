package com.healthconnect.coordinator;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class ClinicCoordinatorService {

    private final ClinicSessionRepository sessionRepository;

    public ClinicCoordinatorService(ClinicSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<ClinicSessionSchedule> getAllSessions() {
        return sessionRepository.findAll();
    }

    public ClinicSessionSchedule saveSession(ClinicSessionSchedule session) {
        session.setUpdatedAt(Instant.now());
        if (session.getId() == null) {
            session.setCreatedAt(Instant.now());
        }
        return sessionRepository.save(session);
    }

    public ClinicSessionSchedule updateCapacityAndStatus(String id, int capacity, String status) {
        ClinicSessionSchedule s = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with id: " + id));
        s.setCapacity(capacity);
        if (status != null && !status.isBlank()) {
            s.setStatus(status);
        }
        s.setUpdatedAt(Instant.now());
        return sessionRepository.save(s);
    }

    public Map<String, Object> getWorkloadOverview() {
        List<ClinicSessionSchedule> list = sessionRepository.findAll();
        int totalCapacity = list.stream().mapToInt(ClinicSessionSchedule::getCapacity).sum();
        int totalBooked = list.stream().mapToInt(ClinicSessionSchedule::getBookedCount).sum();
        long openSessions = list.stream().filter(s -> "OPEN".equalsIgnoreCase(s.getStatus())).count();

        double capacityUtilization = totalCapacity > 0 ? ((double) totalBooked / totalCapacity) * 100.0 : 0.0;

        return Map.of(
                "totalActiveSessions", list.size(),
                "openSessions", openSessions,
                "totalCapacitySlots", totalCapacity,
                "totalBookedAppointments", totalBooked,
                "utilizationRate", Math.round(capacityUtilization * 10.0) / 10.0,
                "coordinatorFacility", "National Hospital of Sri Lanka (NHSL)"
        );
    }

    public void seedInitialSessionsIfEmpty() {
        if (sessionRepository.count() == 0) {
            ClinicSessionSchedule s1 = new ClinicSessionSchedule(
                    "Cardiology Specialist Clinic",
                    "Room 04 (Specialist Wing)",
                    "Dr. Samantha Senanayake, MBBS, MD",
                    "Monday",
                    "08:30 AM - 12:30 PM",
                    40,
                    24,
                    "OPEN"
            );

            ClinicSessionSchedule s2 = new ClinicSessionSchedule(
                    "Diabetic & Endocrinology Clinic",
                    "Room 08 (OPD Complex)",
                    "Dr. N. Wickramasinghe, MBBS",
                    "Monday",
                    "09:00 AM - 01:00 PM",
                    50,
                    38,
                    "OPEN"
            );

            ClinicSessionSchedule s3 = new ClinicSessionSchedule(
                    "Paediatric Care & Immunization",
                    "Room 02 (MCH Wing)",
                    "Dr. Chathuri Alwis, MBBS, DCH",
                    "Tuesday",
                    "08:00 AM - 12:00 PM",
                    35,
                    35,
                    "FULL"
            );

            ClinicSessionSchedule s4 = new ClinicSessionSchedule(
                    "Orthopaedic Review & Fracture Clinic",
                    "Room 11 (Surgical OPD)",
                    "Dr. Priyantha Dissanayake, MS, FRCS",
                    "Wednesday",
                    "10:00 AM - 02:00 PM",
                    30,
                    15,
                    "OPEN"
            );

            sessionRepository.saveAll(List.of(s1, s2, s3, s4));
        }
    }
}
