package com.healthconnect.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "staff_access_requests")
@CompoundIndexes({
    @CompoundIndex(name = "facility_status_idx", def = "{'facilityId': 1, 'status': 1}"),
    @CompoundIndex(name = "email_status_idx", def = "{'workEmail': 1, 'status': 1}")
})
public class StaffAccessRequest {

    @Id
    private String id;

    private String fullName;

    @Indexed
    private String employeeId;

    @Indexed
    private String workEmail;

    private String contactPhone;

    private Role requestedRole;

    private String professionalCategory; // e.g. MEDICAL_OFFICER, NURSING_OFFICER, PHARMACIST

    private String professionalRegistrationNumber; // e.g. SLMC-64821 or SLNC-45210

    @Indexed
    private String facilityId;

    private String facilityName;

    private String department;

    private StaffApprovalStatus status = StaffApprovalStatus.PENDING_APPROVAL;

    private String reviewNotes;

    private String reviewedByAdminId;

    private String reviewedByAdminName;

    private Instant reviewedAt;

    @JsonIgnore
    private String passwordHash; // Stored securely until approved, then account is activated in users collection

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public StaffAccessRequest() {}

    public StaffAccessRequest(String fullName, String employeeId, String workEmail, String contactPhone, Role requestedRole, String facilityId, String facilityName, String department, String passwordHash) {
        this.fullName = fullName;
        this.employeeId = employeeId;
        this.workEmail = workEmail;
        this.contactPhone = contactPhone;
        this.requestedRole = requestedRole;
        this.facilityId = facilityId;
        this.facilityName = facilityName;
        this.department = department;
        this.passwordHash = passwordHash;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getWorkEmail() { return workEmail; }
    public void setWorkEmail(String workEmail) { this.workEmail = workEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Role getRequestedRole() { return requestedRole; }
    public void setRequestedRole(Role requestedRole) { this.requestedRole = requestedRole; }

    public String getProfessionalCategory() { return professionalCategory; }
    public void setProfessionalCategory(String professionalCategory) { this.professionalCategory = professionalCategory; }

    public String getProfessionalRegistrationNumber() { return professionalRegistrationNumber; }
    public void setProfessionalRegistrationNumber(String professionalRegistrationNumber) { this.professionalRegistrationNumber = professionalRegistrationNumber; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public StaffApprovalStatus getStatus() { return status; }
    public void setStatus(StaffApprovalStatus status) { this.status = status; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public String getReviewedByAdminId() { return reviewedByAdminId; }
    public void setReviewedByAdminId(String reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }

    public String getReviewedByAdminName() { return reviewedByAdminName; }
    public void setReviewedByAdminName(String reviewedByAdminName) { this.reviewedByAdminName = reviewedByAdminName; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
