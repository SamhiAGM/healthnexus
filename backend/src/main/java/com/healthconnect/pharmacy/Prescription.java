package com.healthconnect.pharmacy;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "prescriptions")
public class Prescription {

    @Id
    private String id;

    @Indexed
    private String prescriptionNumber; // e.g. RX-9041

    private String patientName;
    private String patientNic;
    private String doctorName;

    @Indexed
    private String facilityId = "NHSL";

    private List<String> medications = new ArrayList<>();

    private String instructions;

    @Indexed
    private String status = "PENDING"; // PENDING, VERIFIED, DISPENSED

    private String dispensedBy;
    private Instant dispensedAt;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public Prescription() {}

    public Prescription(String prescriptionNumber, String patientName, String patientNic, String doctorName, List<String> medications, String instructions) {
        this.prescriptionNumber = prescriptionNumber;
        this.patientName = patientName;
        this.patientNic = patientNic;
        this.doctorName = doctorName;
        this.medications = medications;
        this.instructions = instructions;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPrescriptionNumber() { return prescriptionNumber; }
    public void setPrescriptionNumber(String prescriptionNumber) { this.prescriptionNumber = prescriptionNumber; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientNic() { return patientNic; }
    public void setPatientNic(String patientNic) { this.patientNic = patientNic; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public List<String> getMedications() { return medications; }
    public void setMedications(List<String> medications) { this.medications = medications; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDispensedBy() { return dispensedBy; }
    public void setDispensedBy(String dispensedBy) { this.dispensedBy = dispensedBy; }

    public Instant getDispensedAt() { return dispensedAt; }
    public void setDispensedAt(Instant dispensedAt) { this.dispensedAt = dispensedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
