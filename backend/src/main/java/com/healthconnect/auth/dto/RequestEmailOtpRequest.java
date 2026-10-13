package com.healthconnect.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RequestEmailOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;

    private String recipientName;

    public RequestEmailOtpRequest() {}

    public RequestEmailOtpRequest(String email, String recipientName) {
        this.email = email;
        this.recipientName = recipientName;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
}
