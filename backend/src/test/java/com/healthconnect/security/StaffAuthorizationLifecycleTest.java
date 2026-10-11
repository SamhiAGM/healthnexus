package com.healthconnect.security;

import com.healthconnect.users.Role;
import com.healthconnect.users.StaffAccessRequest;
import com.healthconnect.users.StaffAccessRequestRepository;
import com.healthconnect.users.StaffApprovalStatus;
import com.healthconnect.users.StaffService;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import com.healthconnect.users.dto.StaffAccessRequestDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StaffAuthorizationLifecycleTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private StaffAccessRequestRepository staffAccessRequestRepository;

    @Autowired
    private UserRepository userRepository;

    private String testEmail;
    private String testEmployeeId;

    @AfterEach
    void tearDown() {
        if (testEmail != null) {
            userRepository.findByEmail(testEmail).ifPresent(userRepository::delete);
            staffAccessRequestRepository.findByWorkEmail(testEmail).ifPresent(staffAccessRequestRepository::delete);
        }
    }

    @Test
    @DisplayName("Staff Onboarding Lifecycle: PENDING_APPROVAL -> Admin Approval provisions active User record")
    void testStaffOnboardingRequestLifecycle_PendingToApproved() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        testEmail = "dr.test." + uniqueSuffix + "@nhsl.health.gov.lk";
        testEmployeeId = "EMP-DOC-" + uniqueSuffix;

        StaffAccessRequestDto dto = new StaffAccessRequestDto();
        dto.setFullName("Dr. Gamini Jayawardena");
        dto.setEmployeeId(testEmployeeId);
        dto.setWorkEmail(testEmail);
        dto.setContactPhone("+94771234567");
        dto.setRequestedRole(Role.DOCTOR);
        dto.setFacilityId("NHSL");
        dto.setFacilityName("National Hospital of Sri Lanka");
        dto.setDepartment("Cardiology");
        dto.setProfessionalCategory("Medical Officer / Consultant");
        dto.setProfessionalRegistrationNumber("SLMC-99482");
        dto.setPassword("SecretSecure123!");

        // 1. Submit onboarding request
        StaffAccessRequest created = staffService.submitAccessRequest(dto);
        assertNotNull(created.getId());
        assertEquals(StaffApprovalStatus.PENDING_APPROVAL, created.getStatus());

        // Verify that the user account is not active yet
        Optional<User> preApprovalUser = userRepository.findByEmail(testEmail);
        assertTrue(preApprovalUser.isEmpty(), "User record must not exist prior to admin approval");

        // 2. Administrator reviews and approves the request
        StaffAccessRequest approved = staffService.approveStaffRequest(
                created.getId(),
                "ADMIN-EXECUTIVE",
                "Hospital Executive Director",
                "SLMC credentials and NHSL medical director verification verified."
        );

        assertEquals(StaffApprovalStatus.APPROVED, approved.getStatus());
        assertEquals("ADMIN-EXECUTIVE", approved.getReviewedByAdminId());

        // 3. Verify user account is provisioned with clinical role
        Optional<User> postApprovalUser = userRepository.findByEmail(testEmail);
        assertTrue(postApprovalUser.isPresent(), "User account must be created upon approval");
        User user = postApprovalUser.get();
        assertTrue(user.isEnabled(), "User account must be enabled upon approval");
        assertTrue(user.getRoles().contains(Role.DOCTOR), "User must have DOCTOR role assigned");
        assertEquals("NHSL", user.getAssignedFacilityId());
        assertEquals("Cardiology", user.getDepartment());
    }

    @Test
    @DisplayName("Staff Onboarding Lifecycle: Rejection transitions status and does not provision user")
    void testStaffOnboardingRequestLifecycle_Rejection() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        testEmail = "nurse.test." + uniqueSuffix + "@nhsl.health.gov.lk";
        testEmployeeId = "EMP-NUR-" + uniqueSuffix;

        StaffAccessRequestDto dto = new StaffAccessRequestDto();
        dto.setFullName("Nurse K. Perera");
        dto.setEmployeeId(testEmployeeId);
        dto.setWorkEmail(testEmail);
        dto.setContactPhone("+94779876543");
        dto.setRequestedRole(Role.NURSE);
        dto.setFacilityId("NHSL");
        dto.setFacilityName("National Hospital of Sri Lanka");
        dto.setDepartment("Emergency");
        dto.setProfessionalCategory("Nursing Officer");
        dto.setProfessionalRegistrationNumber("SLNC-44123");
        dto.setPassword("SecretNurse123!");

        StaffAccessRequest created = staffService.submitAccessRequest(dto);
        assertEquals(StaffApprovalStatus.PENDING_APPROVAL, created.getStatus());

        // Admin rejects the request
        StaffAccessRequest rejected = staffService.rejectStaffRequest(
                created.getId(),
                "ADMIN-EXECUTIVE",
                "Hospital Executive Director",
                "Official council registration number did not match SLNC registry."
        );

        assertEquals(StaffApprovalStatus.REJECTED, rejected.getStatus());
        assertTrue(userRepository.findByEmail(testEmail).isEmpty(), "Rejected staff must not have user record provisioned");
    }

    @Test
    @DisplayName("Security Boundary: Patient role cannot access Doctor Consultation Queue (/api/doctor/**)")
    void testBoundary_PatientCannotAccessDoctorQueue() throws Exception {
        String patientToken = jwtService.generateToken("patient-101", "citizen@lankacare.me", List.of("PATIENT"));

        mockMvc.perform(get("/api/doctor/queue")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security Boundary: Patient role cannot access Admin Staff Requests (/api/admin/**)")
    void testBoundary_PatientCannotAccessAdminStaffRequests() throws Exception {
        String patientToken = jwtService.generateToken("patient-102", "citizen2@lankacare.me", List.of("PATIENT"));

        mockMvc.perform(get("/api/admin/staff/requests")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security Boundary: Doctor role can access Doctor Queue (/api/doctor/queue)")
    void testBoundary_DoctorCanAccessDoctorQueue() throws Exception {
        String doctorToken = jwtService.generateToken("doc-201", "doctor@nhsl.health.gov.lk", List.of("DOCTOR"));

        mockMvc.perform(get("/api/doctor/queue")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Security Boundary: Hospital Admin role can access Admin Staff Requests (/api/admin/staff/requests)")
    void testBoundary_AdminCanAccessAdminStaffRequests() throws Exception {
        String adminToken = jwtService.generateToken("admin-301", "admin@nhsl.health.gov.lk", List.of("HOSPITAL_ADMIN"));

        mockMvc.perform(get("/api/admin/staff/requests")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Security Boundary: Unauthenticated request to protected endpoint is denied")
    void testBoundary_UnauthenticatedAccessIsDenied() throws Exception {
        mockMvc.perform(get("/api/doctor/queue"))
                .andExpect(status().isForbidden());
    }
}
