package com.healthconnect.auth.dto;

import java.util.List;

public class AuthResponse {
    private String token;
    private String userId;
    private String fullName;
    private String email;
    private List<String> roles;
    private String assignedFacilityId;

    public AuthResponse(String token, String userId, String fullName, String email, List<String> roles, String assignedFacilityId) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.assignedFacilityId = assignedFacilityId;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public List<String> getRoles() { return roles; }
    public String getAssignedFacilityId() { return assignedFacilityId; }
}
