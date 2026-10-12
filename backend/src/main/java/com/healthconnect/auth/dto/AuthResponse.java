package com.healthconnect.auth.dto;

import java.util.List;

public class AuthResponse {
    private String token;
    private String userId;
    private String fullName;
    private String email;
    private List<String> roles;
    private String assignedFacilityId;
    private boolean mfaRequired;
    private String mfaSessionId;

    public AuthResponse(String token, String userId, String fullName, String email, List<String> roles, String assignedFacilityId) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.roles = roles;
        this.assignedFacilityId = assignedFacilityId;
        this.mfaRequired = false;
        this.mfaSessionId = null;
    }

    public static AuthResponse mfaChallenge(String mfaSessionId, String userId, String fullName, String email, List<String> roles, String assignedFacilityId) {
        AuthResponse response = new AuthResponse(null, userId, fullName, email, roles, assignedFacilityId);
        response.mfaRequired = true;
        response.mfaSessionId = mfaSessionId;
        return response;
    }

    public String getToken() { return token; }
    public String getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public List<String> getRoles() { return roles; }
    public String getAssignedFacilityId() { return assignedFacilityId; }
    public boolean isMfaRequired() { return mfaRequired; }
    public String getMfaSessionId() { return mfaSessionId; }
}
