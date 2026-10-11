package com.healthconnect.clinics;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "consultation_records")
public class ConsultationRecord {

    @Id
    private String id;

    @Indexed
    private String queueTicketNumber;

    @Indexed
    private String patientId;

    private String patientName;

    @Indexed
    private String doctorId;

    private String doctorName;

    private String facilityId;

    private String clinicalNotes;

    private List<String> prescriptions;

    private List<String> diagnosticOrders;

    @CreatedDate
    private Instant recordedAt = Instant.now();

    public ConsultationRecord() {}

    public ConsultationRecord(String queueTicketNumber, String patientId, String patientName, String doctorId, String doctorName, String facilityId, String clinicalNotes, List<String> prescriptions, List<String> diagnosticOrders) {
        this.queueTicketNumber = queueTicketNumber;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.facilityId = facilityId;
        this.clinicalNotes = clinicalNotes;
        this.prescriptions = prescriptions;
        this.diagnosticOrders = diagnosticOrders;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQueueTicketNumber() { return queueTicketNumber; }
    public void setQueueTicketNumber(String queueTicketNumber) { this.queueTicketNumber = queueTicketNumber; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public List<String> getPrescriptions() { return prescriptions; }
    public void setPrescriptions(List<String> prescriptions) { this.prescriptions = prescriptions; }

    public List<String> getDiagnosticOrders() { return diagnosticOrders; }
    public void setDiagnosticOrders(List<String> diagnosticOrders) { this.diagnosticOrders = diagnosticOrders; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}
