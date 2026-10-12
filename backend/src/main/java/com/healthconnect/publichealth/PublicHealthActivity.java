package com.healthconnect.publichealth;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "public_health_activities")
public class PublicHealthActivity {

    @Id
    private String id;

    @Indexed
    private String activityCode; // e.g. PHA-712

    private String title;
    private String category; // Vector Control, Maternal Care, School Health, Sanitation
    private String areaJurisdiction; // MOH division / district

    @Indexed
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED

    private String officerName;
    private String observations;
    private int targetHouseholdCount;
    private Instant completedDate;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public PublicHealthActivity() {}

    public PublicHealthActivity(String activityCode, String title, String category, String areaJurisdiction, int targetHouseholdCount, String officerName) {
        this.activityCode = activityCode;
        this.title = title;
        this.category = category;
        this.areaJurisdiction = areaJurisdiction;
        this.targetHouseholdCount = targetHouseholdCount;
        this.officerName = officerName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getActivityCode() { return activityCode; }
    public void setActivityCode(String activityCode) { this.activityCode = activityCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAreaJurisdiction() { return areaJurisdiction; }
    public void setAreaJurisdiction(String areaJurisdiction) { this.areaJurisdiction = areaJurisdiction; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }

    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }

    public int getTargetHouseholdCount() { return targetHouseholdCount; }
    public void setTargetHouseholdCount(int targetHouseholdCount) { this.targetHouseholdCount = targetHouseholdCount; }

    public Instant getCompletedDate() { return completedDate; }
    public void setCompletedDate(Instant completedDate) { this.completedDate = completedDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
