package com.healthconnect.supervision;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "inspection_findings")
public class InspectionFinding {

    @Id
    private String id;

    @Indexed
    private String findingCode; // e.g. FND-301

    @Indexed
    private String facility; // e.g. Base Hospital Homagama, NHSL

    private String category; // e.g. Sanitation & Sterilization, Cold Chain Storage

    private String description;

    private String severity; // CRITICAL, MODERATE, LOW

    private String status = "OPEN"; // OPEN, IN_PROGRESS, VERIFIED_CLOSED

    private String deadline;

    private String inspectorId;

    private String inspectorName;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public InspectionFinding() {}

    public InspectionFinding(String findingCode, String facility, String category, String description, String severity, String status, String deadline) {
        this.findingCode = findingCode;
        this.facility = facility;
        this.category = category;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.deadline = deadline;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFindingCode() { return findingCode; }
    public void setFindingCode(String findingCode) { this.findingCode = findingCode; }

    public String getFacility() { return facility; }
    public void setFacility(String facility) { this.facility = facility; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getInspectorId() { return inspectorId; }
    public void setInspectorId(String inspectorId) { this.inspectorId = inspectorId; }

    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
