package com.healthconnect.users.dto;

import com.healthconnect.users.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StaffAccessRequestDto {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Employee ID or registration identifier is required")
    private String employeeId;

    @NotBlank(message = "Work email is required")
    @Email(message = "Please enter a valid work email address")
    private String workEmail;

    @NotBlank(message = "Contact phone number is required")
    private String contactPhone;

    @NotNull(message = "Requested clinical role must be specified")
    private Role requestedRole;

    private String professionalCategory;

    private String professionalRegistrationNumber; // e.g. SLMC-64821

    @NotBlank(message = "Hospital facility ID is required")
    private String facilityId;

    @NotBlank(message = "Hospital facility name is required")
    private String facilityName;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    public StaffAccessRequestDto() {}

    // Getters and Setters
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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
