package com.healthconnect.supervision;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class SupervisionService {

    private final InspectionFindingRepository repository;

    public SupervisionService(InspectionFindingRepository repository) {
        this.repository = repository;
    }

    public List<InspectionFinding> getAllFindings() {
        List<InspectionFinding> existing = repository.findAllByOrderByCreatedAtDesc();
        if (existing.isEmpty() && repository.count() == 0) {
            initSeedFindings();
            return repository.findAllByOrderByCreatedAtDesc();
        }
        return existing;
    }

    public InspectionFinding createFinding(
            String facility,
            String category,
            String description,
            String severity,
            String deadline,
            String inspectorId,
            String inspectorName
    ) {
        long count = repository.count();
        long codeNum = 301 + count;
        String code = "FND-" + codeNum;

        int attempts = 0;
        while (repository.findByFindingCode(code).isPresent() && attempts < 50) {
            codeNum++;
            code = "FND-" + codeNum;
            attempts++;
        }

        InspectionFinding finding = new InspectionFinding();
        finding.setFindingCode(code);
        finding.setFacility(facility != null && !facility.isBlank() ? facility : "National Hospital of Sri Lanka (NHSL)");
        finding.setCategory(category != null && !category.isBlank() ? category : "Cold Chain Storage");
        finding.setDescription(description != null ? description.trim() : "Routine field inspection review");
        finding.setSeverity(severity != null && !severity.isBlank() ? severity : "MODERATE");
        finding.setStatus("OPEN");
        finding.setDeadline(deadline != null && !deadline.isBlank() ? deadline : "28 Oct 2026");
        finding.setInspectorId(inspectorId != null ? inspectorId : "SUP-01");
        finding.setInspectorName(inspectorName != null ? inspectorName : "Supervisory Officer N. Bandara");
        finding.setCreatedAt(Instant.now());
        finding.setUpdatedAt(Instant.now());

        return repository.save(finding);
    }

    public InspectionFinding cycleFindingStatus(String identifier) {
        InspectionFinding finding = findByIdOrCode(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Finding not found: " + identifier));

        String current = finding.getStatus();
        String nextStatus;
        if ("OPEN".equalsIgnoreCase(current)) {
            nextStatus = "IN_PROGRESS";
        } else if ("IN_PROGRESS".equalsIgnoreCase(current)) {
            nextStatus = "VERIFIED_CLOSED";
        } else {
            nextStatus = "OPEN";
        }

        finding.setStatus(nextStatus);
        finding.setUpdatedAt(Instant.now());
        return repository.save(finding);
    }

    public InspectionFinding updateFindingStatus(String identifier, String newStatus) {
        InspectionFinding finding = findByIdOrCode(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Finding not found: " + identifier));

        finding.setStatus(newStatus.toUpperCase());
        finding.setUpdatedAt(Instant.now());
        return repository.save(finding);
    }

    public Map<String, Object> getMetrics() {
        long total = repository.count();
        long closed = repository.countByStatus("VERIFIED_CLOSED");
        long active = repository.countByStatusNot("VERIFIED_CLOSED");

        return Map.of(
                "total", total,
                "active", active,
                "closed", closed
        );
    }

    private Optional<InspectionFinding> findByIdOrCode(String identifier) {
        Optional<InspectionFinding> byId = repository.findById(identifier);
        if (byId.isPresent()) {
            return byId;
        }
        return repository.findByFindingCode(identifier);
    }

    private void initSeedFindings() {
        InspectionFinding f1 = new InspectionFinding(
                "FND-301",
                "Base Hospital Homagama",
                "Cold Chain Storage",
                "Vaccine storage refrigerator temperature sensor calibration required.",
                "CRITICAL",
                "IN_PROGRESS",
                "15 Oct 2026"
        );
        f1.setInspectorName("Supervisory Officer N. Bandara");

        InspectionFinding f2 = new InspectionFinding(
                "FND-302",
                "District General Hospital Gampaha",
                "Sanitation & Sterilization",
                "Sterile supply storage area air filtration inspection completed.",
                "MODERATE",
                "VERIFIED_CLOSED",
                "20 Oct 2026"
        );
        f2.setInspectorName("Supervisory Officer N. Bandara");

        InspectionFinding f3 = new InspectionFinding(
                "FND-303",
                "Provincial General Hospital Badulla",
                "Emergency Drug Stocks",
                "ETU adrenaline and atropine stock replenishment verified.",
                "LOW",
                "VERIFIED_CLOSED",
                "10 Oct 2026"
        );
        f3.setInspectorName("Supervisory Officer N. Bandara");

        repository.saveAll(List.of(f1, f2, f3));
    }
}
