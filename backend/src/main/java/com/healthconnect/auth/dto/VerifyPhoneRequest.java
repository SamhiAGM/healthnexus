package com.healthconnect.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyPhoneRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(0|\\+94)?[7][0-9]{8}$",
        message = "Must be a valid Sri Lankan mobile number (e.g., 0771234567)"
    )
    private String phone;

    @NotBlank(message = "Verification code is required")
    private String code;

    public VerifyPhoneRequest() {}

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
