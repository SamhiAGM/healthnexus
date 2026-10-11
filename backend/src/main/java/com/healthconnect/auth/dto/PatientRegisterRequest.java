package com.healthconnect.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PatientRegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    private String fullName;

    // Sri Lankan NIC regex: Old format (9 digits + V/X) or New format (12 digits)
    @NotBlank(message = "NIC is required")
    @Pattern(
        regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$",
        message = "Must be a valid Sri Lankan NIC (9 digits ending with V/X, or 12 digits)"
    )
    private String nic;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(0|\\+94)?[7][0-9]{8}$",
        message = "Must be a valid Sri Lankan mobile number (e.g., 0771234567)"
    )
    private String phone;

    @Email(message = "Invalid email address format")
    private String email;

    @NotBlank(message = "Date of birth is required")
    private String dateOfBirth;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    public PatientRegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNic() { return nic; }
    public void setNic(String nic) { this.nic = nic; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
