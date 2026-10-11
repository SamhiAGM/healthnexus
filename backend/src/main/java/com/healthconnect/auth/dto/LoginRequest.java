package com.healthconnect.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Identifier (Email, Phone, or NIC) is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {}

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
