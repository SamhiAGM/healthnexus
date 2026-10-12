package com.healthconnect.publichealth;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class PublicHealthService {

    private final PublicHealthActivityRepository repository;

    public PublicHealthService(PublicHealthActivityRepository repository) {
        this.repository = repository;
    }

    public List<PublicHealthActivity> getAllActivities() {
        return repository.findAll();
    }

    public Optional<PublicHealthActivity> getById(String id) {
        return repository.findById(id);
    }

    public PublicHealthActivity createActivity(PublicHealthActivity activity) {
        if (activity.getActivityCode() == null || activity.getActivityCode().isBlank()) {
            activity.setActivityCode("PHA-" + (1000 + repository.count() + 1));
        }
        activity.setCreatedAt(Instant.now());
        activity.setUpdatedAt(Instant.now());
        return repository.save(activity);
    }

    public PublicHealthActivity updateStatus(String id, String status, String observations) {
        PublicHealthActivity act = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found: " + id));
        act.setStatus(status);
        if (observations != null && !observations.isBlank()) {
            act.setObservations(observations);
        }
        if ("COMPLETED".equalsIgnoreCase(status)) {
            act.setCompletedDate(Instant.now());
        }
        act.setUpdatedAt(Instant.now());
        return repository.save(act);
    }

    public void seedInitialActivitiesIfEmpty() {
        if (repository.count() == 0) {
            PublicHealthActivity a1 = new PublicHealthActivity(
                    "PHA-101",
                    "Dengue Larval Survey & Abatement",
                    "Vector Control",
                    "Colombo District - Dehiwala MOH",
                    140,
                    "Dr. K. Perera (MOH Officer)"
            );
            a1.setStatus("IN_PROGRESS");
            a1.setObservations("Premises inspection underway in Ward 4. High breeding risk identified in discarded tyres.");

            PublicHealthActivity a2 = new PublicHealthActivity(
                    "PHA-102",
                    "School Health Inspection & Deworming Campaign",
                    "School Health",
                    "Kandy District - Central MOH",
                    320,
                    "Nimal Jayasinghe (PHI)"
            );
            a2.setStatus("SCHEDULED");
            a2.setObservations("Coordinates aligned with primary school principals. Kit delivery confirmed.");

            PublicHealthActivity a3 = new PublicHealthActivity(
                    "PHA-103",
                    "Maternal Nutrition & Post-natal Checkups",
                    "Maternal & Child Care",
                    "Galle District - Bope-Poddala MOH",
                    75,
                    "Mrs. S. Weerakoon (Supervisory PHM)"
            );
            a3.setStatus("COMPLETED");
            a3.setObservations("All registered antenatal clinics visited. 72 iron supplements distributed.");
            a3.setCompletedDate(Instant.now());

            repository.saveAll(List.of(a1, a2, a3));
        }
    }
}
