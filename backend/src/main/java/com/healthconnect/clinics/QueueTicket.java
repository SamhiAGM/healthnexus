package com.healthconnect.clinics;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "queue_tickets")
@CompoundIndexes({
    @CompoundIndex(name = "facility_clinic_status_idx", def = "{'facilityId': 1, 'clinicType': 1, 'status': 1}")
})
public class QueueTicket {

    @Id
    private String id;

    @Indexed
    private String ticketNumber; // e.g. C-024

    private String patientId;

    private String patientName;

    private String patientNic;

    private Integer patientAge;

    private String patientGender; // M / F / O

    @Indexed
    private String facilityId; // e.g. NHSL, KANDY_GEN

    private String facilityName;

    @Indexed
    private String clinicType; // CARDIOLOGY, OPD, PEDIATRICS, etc.

    private String consultationRoom; // e.g. Room 04

    private String priorityTag; // NORMAL, URGENT, ELDERLY, MATERNAL

    private QueueStatus status = QueueStatus.WAITING;

    private String complaint;

    private String vitalsSummary; // e.g. BP: 128/84, HR: 74 bpm

    private String doctorAssignedId;

    private String doctorName;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public enum QueueStatus {
        WAITING,
        CALLED,
        IN_CONSULTATION,
        COMPLETED,
        SKIPPED
    }

    public QueueTicket() {}

    public QueueTicket(String ticketNumber, String patientName, String facilityId, String facilityName, String clinicType, String consultationRoom) {
        this.ticketNumber = ticketNumber;
        this.patientName = patientName;
        this.facilityId = facilityId;
        this.facilityName = facilityName;
        this.clinicType = clinicType;
        this.consultationRoom = consultationRoom;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientNic() { return patientNic; }
    public void setPatientNic(String patientNic) { this.patientNic = patientNic; }

    public Integer getPatientAge() { return patientAge; }
    public void setPatientAge(Integer patientAge) { this.patientAge = patientAge; }

    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getClinicType() { return clinicType; }
    public void setClinicType(String clinicType) { this.clinicType = clinicType; }

    public String getConsultationRoom() { return consultationRoom; }
    public void setConsultationRoom(String consultationRoom) { this.consultationRoom = consultationRoom; }

    public String getPriorityTag() { return priorityTag; }
    public void setPriorityTag(String priorityTag) { this.priorityTag = priorityTag; }

    public QueueStatus getStatus() { return status; }
    public void setStatus(QueueStatus status) { this.status = status; }

    public String getComplaint() { return complaint; }
    public void setComplaint(String complaint) { this.complaint = complaint; }

    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }

    public String getDoctorAssignedId() { return doctorAssignedId; }
    public void setDoctorAssignedId(String doctorAssignedId) { this.doctorAssignedId = doctorAssignedId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
