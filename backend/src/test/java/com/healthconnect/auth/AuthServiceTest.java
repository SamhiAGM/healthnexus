package com.healthconnect.auth;

import com.healthconnect.auth.dto.AuthResponse;
import com.healthconnect.auth.dto.LoginRequest;
import com.healthconnect.auth.dto.PatientRegisterRequest;
import com.healthconnect.auth.dto.VerifyPhoneRequest;
import com.healthconnect.security.JwtService;
import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
        ReflectionTestUtils.setField(authService, "smsConfigured", false);
        ReflectionTestUtils.setField(authService, "mfaConfigured", false);
    }

    @Test
    @DisplayName("Patient Registration: Successfully creates unverified patient record")
    void testRegisterPatient_Success() {
        PatientRegisterRequest request = new PatientRegisterRequest();
        request.setFullName("Kavinda Rajapaksha");
        request.setIdentificationType("NIC");
        request.setIdNumber("199512345678");
        request.setPhone("0771234567");
        request.setEmail("kavinda@example.com");
        request.setPassword("StrongPassword123!");

        when(userRepository.existsByNicHash(anyString())).thenReturn(false);
        when(userRepository.existsByEmail("kavinda@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("0771234567")).thenReturn(false);
        when(passwordEncoder.encode("StrongPassword123!")).thenReturn("encoded_pass_hash");

        User savedUser = new User("Kavinda Rajapaksha", "kavinda@example.com", "0771234567", "hash", "199*****78", "encoded_pass_hash");
        savedUser.setId("USR-PAT-001");
        savedUser.setRoles(Set.of(Role.PATIENT));
        savedUser.setEnabled(true);
        savedUser.setVerified(false);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.registerPatient(request);

        assertNotNull(response);
        assertEquals("USR-PAT-001", response.getUserId());
        assertNull(response.getToken(), "New registration must not issue session token until verified");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User captured = userCaptor.getValue();
        assertFalse(captured.isVerified(), "New patient account must remain unverified until SMS gateway validation");
        assertTrue(captured.isEnabled());
        assertTrue(captured.getRoles().contains(Role.PATIENT));
    }

    @Test
    @DisplayName("Patient Registration: Rejects invalid NIC format")
    void testRegisterPatient_InvalidNic_ThrowsException() {
        PatientRegisterRequest request = new PatientRegisterRequest();
        request.setFullName("Test User");
        request.setIdentificationType("NIC");
        request.setIdNumber("12345"); // Invalid NIC length
        request.setEmail("test@example.com");
        request.setPhone("0771234567");
        request.setPassword("Password123!");

        assertThrows(IllegalArgumentException.class, () -> authService.registerPatient(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Patient Registration: Rejects duplicate phone number")
    void testRegisterPatient_DuplicatePhone_ThrowsException() {
        PatientRegisterRequest request = new PatientRegisterRequest();
        request.setFullName("Test User");
        request.setIdentificationType("NIC");
        request.setIdNumber("199512345678");
        request.setEmail("unique@example.com");
        request.setPhone("0771234567");
        request.setPassword("Password123!");

        when(userRepository.existsByNicHash(anyString())).thenReturn(false);
        when(userRepository.existsByEmail("unique@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("0771234567")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.registerPatient(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Patient Login: Successfully logs in with valid credentials")
    void testLogin_Patient_Success() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("0771234567");
        request.setPassword("Secret123!");

        User patient = new User("Saman Kumara", "saman@gmail.com", "0771234567", "hash", "199*****78", "hashed_pass");
        patient.setId("USR-PAT-002");
        patient.setRoles(Set.of(Role.PATIENT));
        patient.setEnabled(true);
        patient.setEmailVerified(true);

        when(userRepository.findByEmail("0771234567")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("0771234567")).thenReturn(Optional.of(patient));
        when(passwordEncoder.matches("Secret123!", "hashed_pass")).thenReturn(true);
        when(jwtService.generateToken("USR-PAT-002", "saman@gmail.com", List.of("PATIENT"))).thenReturn("valid_jwt");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertFalse(response.isMfaRequired());
        assertEquals("valid_jwt", response.getToken());
        assertEquals("USR-PAT-002", response.getUserId());
    }

    @Test
    @DisplayName("Login: Rejects invalid password")
    void testLogin_InvalidPassword_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("0771234567");
        request.setPassword("WrongPassword!");

        User patient = new User("Saman Kumara", "saman@gmail.com", "0771234567", "hash", "199*****78", "hashed_pass");
        patient.setEnabled(true);

        when(userRepository.findByEmail("0771234567")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("0771234567")).thenReturn(Optional.of(patient));
        when(passwordEncoder.matches("WrongPassword!", "hashed_pass")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Login: Denies disabled or suspended account")
    void testLogin_DisabledAccount_ThrowsForbidden() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("0771234567");
        request.setPassword("Secret123!");

        User suspendedUser = new User("Suspended User", "suspended@gmail.com", "0771234567", "hash", "199*****78", "hashed_pass");
        suspendedUser.setEnabled(false);

        when(userRepository.findByEmail("0771234567")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("0771234567")).thenReturn(Optional.of(suspendedUser));
        when(passwordEncoder.matches("Secret123!", "hashed_pass")).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("pending administrative approval or has been suspended"));
    }

    @Test
    @DisplayName("Staff Login: Privileged role triggers server-enforced MFA challenge, no token issued")
    void testLogin_Staff_EnforcesMfaChallenge() {
        LoginRequest request = new LoginRequest();
        request.setIdentifier("doctor@nhsl.health.gov.lk");
        request.setPassword("DoctorPass123!");

        User doctor = new User("Dr. Samantha Senanayake", "doctor@nhsl.health.gov.lk", "0779998877", null, null, "doc_pass_hash");
        doctor.setId("USR-DOC-001");
        doctor.setRoles(Set.of(Role.DOCTOR));
        doctor.setEnabled(true);
        doctor.setAssignedFacilityId("NHSL");

        when(userRepository.findByEmail("doctor@nhsl.health.gov.lk")).thenReturn(Optional.of(doctor));
        when(passwordEncoder.matches("DoctorPass123!", "doc_pass_hash")).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isMfaRequired(), "Staff account must require MFA before receiving privileged session");
        assertNotNull(response.getMfaSessionId(), "Must issue an MFA session challenge ID");
        assertNull(response.getToken(), "Access token MUST NOT be granted before verifying second factor");
    }

    @Test
    @DisplayName("Staff MFA Verification: Fails closed when MFA provider is unconfigured")
    void testVerifyMfa_FailsClosedWhenMfaUnconfigured() {
        // First trigger MFA challenge to get session ID
        LoginRequest request = new LoginRequest();
        request.setIdentifier("doctor@nhsl.health.gov.lk");
        request.setPassword("DoctorPass123!");

        User doctor = new User("Dr. Samantha Senanayake", "doctor@nhsl.health.gov.lk", "0779998877", null, null, "doc_pass_hash");
        doctor.setId("USR-DOC-001");
        doctor.setRoles(Set.of(Role.DOCTOR));
        doctor.setEnabled(true);

        when(userRepository.findByEmail("doctor@nhsl.health.gov.lk")).thenReturn(Optional.of(doctor));
        when(passwordEncoder.matches("DoctorPass123!", "doc_pass_hash")).thenReturn(true);

        AuthResponse challengeResponse = authService.login(request);
        String mfaSessionId = challengeResponse.getMfaSessionId();

        // MFA verify attempt while mfaConfigured is false
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                authService.verifyMfa(mfaSessionId, "123456")
        );
        assertTrue(ex.getMessage().contains("Staff multifactor authentication is unavailable"));
    }

    @Test
    @DisplayName("Phone Verification: Fails closed when SMS gateway is unconfigured")
    void testVerifyPhone_FailsClosedWhenSmsUnconfigured() {
        VerifyPhoneRequest request = new VerifyPhoneRequest();
        request.setPhone("0771234567");
        request.setCode("123456");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                authService.verifyPhone(request)
        );
        assertTrue(ex.getMessage().contains("SMS gateway provider is currently unconfigured"));
    }
}
