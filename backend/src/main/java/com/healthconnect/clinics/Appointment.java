package com.healthconnect.clinics;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "appointments")
@CompoundIndexes({
    @CompoundIndex(name = "patient_date_idx", def = "{'patientId': 1, 'appointmentDate': 1}")
})
public class Appointment {

    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingReference; // e.g. APT-8041

    @Indexed
    private String patientId;

    private String patientName;

    private String patientPhone;

    @Indexed
    private String facilityId;

    private String facilityName;

    private String clinicSpecialty;

    private String appointmentDate; // YYYY-MM-DD or formatted display date

    private String sessionWindow; // e.g. Morning Session (08:30 AM - 12:00 PM)

    private String assignedDoctorName;

    private String reasonForVisit;

    private AppointmentStatus status = AppointmentStatus.CONFIRMED;

    private String linkedQueueTicketNumber;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public enum AppointmentStatus {
        CONFIRMED,
        WAITING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public Appointment() {}

    public Appointment(String bookingReference, String patientId, String patientName, String facilityName, String clinicSpecialty, String appointmentDate, String sessionWindow) {
        this.bookingReference = bookingReference;
        this.patientId = patientId;
        this.patientName = patientName;
        this.facilityName = facilityName;
        this.clinicSpecialty = clinicSpecialty;
        this.appointmentDate = appointmentDate;
        this.sessionWindow = sessionWindow;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getClinicSpecialty() { return clinicSpecialty; }
    public void setClinicSpecialty(String clinicSpecialty) { this.clinicSpecialty = clinicSpecialty; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getSessionWindow() { return sessionWindow; }
    public void setSessionWindow(String sessionWindow) { this.sessionWindow = sessionWindow; }

    public String getAssignedDoctorName() { return assignedDoctorName; }
    public void setAssignedDoctorName(String assignedDoctorName) { this.assignedDoctorName = assignedDoctorName; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }

    public String getLinkedQueueTicketNumber() { return linkedQueueTicketNumber; }
    public void setLinkedQueueTicketNumber(String linkedQueueTicketNumber) { this.linkedQueueTicketNumber = linkedQueueTicketNumber; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
