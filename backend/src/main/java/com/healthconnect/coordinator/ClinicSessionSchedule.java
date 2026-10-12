package com.healthconnect.coordinator;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "clinic_sessions")
public class ClinicSessionSchedule {

    @Id
    private String id;
    private String clinicName; // e.g. "Cardiology Outpatient Clinic"
    private String roomNumber; // Room 04
    private String assignedDoctor; // Dr. Samantha Senanayake
    private String dayOfWeek; // Monday, Tuesday, etc.
    private String timeSlot; // 08:30 AM - 12:30 PM
    private int capacity = 40;
    private int bookedCount = 18;
    private String status = "OPEN"; // OPEN, FULL, SUSPENDED, COMPLETED

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public ClinicSessionSchedule() {}

    public ClinicSessionSchedule(String clinicName, String roomNumber, String assignedDoctor, String dayOfWeek, String timeSlot, int capacity, int bookedCount, String status) {
        this.clinicName = clinicName;
        this.roomNumber = roomNumber;
        this.assignedDoctor = assignedDoctor;
        this.dayOfWeek = dayOfWeek;
        this.timeSlot = timeSlot;
        this.capacity = capacity;
        this.bookedCount = bookedCount;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getAssignedDoctor() { return assignedDoctor; }
    public void setAssignedDoctor(String assignedDoctor) { this.assignedDoctor = assignedDoctor; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getBookedCount() { return bookedCount; }
    public void setBookedCount(int bookedCount) { this.bookedCount = bookedCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
