package com.healthconnect.laboratory;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "lab_orders")
public class LabOrder {

    @Id
    private String id;

    @Indexed
    private String orderNumber; // e.g. LAB-8812

    private String patientName;
    private String patientNic;
    private String doctorName;

    @Indexed
    private String facilityId = "NHSL";

    private String testType; // Full Blood Count (FBC), Fasting Blood Sugar (FBS), Lipid Profile, Serum Creatinine

    @Indexed
    private String status = "ORDERED"; // ORDERED, SAMPLE_COLLECTED, RELEASED

    private String resultsSummary; // e.g. Hemoglobin: 13.8 g/dL, WBC: 7.2 x 10^9/L, Platelets: 280 x 10^9/L
    private String normalRange; // Reference standard

    private String technicianName;
    private Instant releasedAt;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public LabOrder() {}

    public LabOrder(String orderNumber, String patientName, String patientNic, String doctorName, String testType, String normalRange) {
        this.orderNumber = orderNumber;
        this.patientName = patientName;
        this.patientNic = patientNic;
        this.doctorName = doctorName;
        this.testType = testType;
        this.normalRange = normalRange;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientNic() { return patientNic; }
    public void setPatientNic(String patientNic) { this.patientNic = patientNic; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResultsSummary() { return resultsSummary; }
    public void setResultsSummary(String resultsSummary) { this.resultsSummary = resultsSummary; }

    public String getNormalRange() { return normalRange; }
    public void setNormalRange(String normalRange) { this.normalRange = normalRange; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public Instant getReleasedAt() { return releasedAt; }
    public void setReleasedAt(Instant releasedAt) { this.releasedAt = releasedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
