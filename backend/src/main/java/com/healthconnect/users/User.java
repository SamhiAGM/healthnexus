package com.healthconnect.users;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true, sparse = true)
    private String email;

    @Indexed(unique = true, sparse = true)
    private String phone;

    // Salted hash of NIC (never store plaintext NIC)
    @JsonIgnore
    @Indexed(unique = true, sparse = true)
    private String nicHash;

    // Masked display representation of NIC (e.g. 1990*****123 or 85*****12V)
    private String maskedNic;

    @JsonIgnore
    private String passwordHash;

    private Set<Role> roles = new HashSet<>();

    private boolean enabled = true;

    private boolean verified = false;

    private boolean emailVerified = false;

    // Optional assigned hospital facility identifier for staff roles
    private String assignedFacilityId;

    // Optional departmental affiliation (e.g. Cardiology, OPD)
    private String department;
    private Instant passwordChangedAt;

    // Per-user token version for deterministic session invalidation upon password reset
    private Integer tokenVersion = 0;


    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public User() {}

    public User(String fullName, String email, String phone, String nicHash, String maskedNic, String passwordHash) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.nicHash = nicHash;
        this.maskedNic = maskedNic;
        this.passwordHash = passwordHash;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNicHash() { return nicHash; }
    public void setNicHash(String nicHash) { this.nicHash = nicHash; }

    public String getMaskedNic() { return maskedNic; }
    public void setMaskedNic(String maskedNic) { this.maskedNic = maskedNic; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getAssignedFacilityId() { return assignedFacilityId; }
    public void setAssignedFacilityId(String assignedFacilityId) { this.assignedFacilityId = assignedFacilityId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getPasswordChangedAt() { return passwordChangedAt; }
    public void setPasswordChangedAt(Instant passwordChangedAt) { this.passwordChangedAt = passwordChangedAt; }

    public Integer getTokenVersion() { return tokenVersion != null ? tokenVersion : 0; }
    public void setTokenVersion(Integer tokenVersion) { this.tokenVersion = tokenVersion != null ? tokenVersion : 0; }
    public void incrementTokenVersion() { this.tokenVersion = (this.tokenVersion != null ? this.tokenVersion : 0) + 1; }
}
