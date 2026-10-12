package com.healthconnect.security;

import com.healthconnect.TestRepositoryConfig;
import com.healthconnect.users.Role;
import com.healthconnect.users.StaffAccessRequest;
import com.healthconnect.users.StaffAccessRequestRepository;
import com.healthconnect.users.StaffApprovalStatus;
import com.healthconnect.users.StaffService;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import com.healthconnect.users.dto.StaffAccessRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestRepositoryConfig.class)
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

    @BeforeEach
    void setUpMocks() {
        Mockito.reset(userRepository, staffAccessRequestRepository);

        // Standard Doctor Principal
        User doctorUser = new User("Dr. Gamini", "doctor@nhsl.health.gov.lk", "0771234567", null, null, "pass");
        doctorUser.setId("doc-201");
        doctorUser.setRoles(Set.of(Role.DOCTOR));
        doctorUser.setEnabled(true);
        when(userRepository.findById("doc-201")).thenReturn(Optional.of(doctorUser));

        // Standard Hospital Admin Principal
        User adminUser = new User("Executive Admin", "admin@nhsl.health.gov.lk", "0777654321", null, null, "pass");
        adminUser.setId("admin-301");
        adminUser.setRoles(Set.of(Role.HOSPITAL_ADMIN));
        adminUser.setEnabled(true);
        when(userRepository.findById("admin-301")).thenReturn(Optional.of(adminUser));

        // Standard Patient Principals
        User patientUser1 = new User("Patient One", "citizen@lankacare.me", "0771111111", null, null, "pass");
        patientUser1.setId("patient-101");
        patientUser1.setRoles(Set.of(Role.PATIENT));
        patientUser1.setEnabled(true);
        when(userRepository.findById("patient-101")).thenReturn(Optional.of(patientUser1));

        User patientUser2 = new User("Patient Two", "citizen2@lankacare.me", "0772222222", null, null, "pass");
        patientUser2.setId("patient-102");
        patientUser2.setRoles(Set.of(Role.PATIENT));
        patientUser2.setEnabled(true);
        when(userRepository.findById("patient-102")).thenReturn(Optional.of(patientUser2));

        // Suspended Doctor Principal
        User suspendedUser = new User("Dr. Suspended", "suspended@nhsl.health.gov.lk", "0773333333", null, null, "pass");
        suspendedUser.setId("suspended-doc-99");
        suspendedUser.setRoles(Set.of(Role.DOCTOR));
        suspendedUser.setEnabled(false); // Suspended
        when(userRepository.findById("suspended-doc-99")).thenReturn(Optional.of(suspendedUser));
    }

    @Test
    @DisplayName("Staff Onboarding Lifecycle: PENDING_APPROVAL -> Admin Approval provisions active User record")
    void testStaffOnboardingRequestLifecycle_PendingToApproved() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String testEmail = "dr.test." + uniqueSuffix + "@nhsl.health.gov.lk";
        String testEmployeeId = "EMP-DOC-" + uniqueSuffix;

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

        StaffAccessRequest mockPending = new StaffAccessRequest(
                dto.getFullName(), dto.getEmployeeId(), dto.getWorkEmail(), dto.getContactPhone(),
                dto.getRequestedRole(), dto.getFacilityId(), dto.getFacilityName(), dto.getDepartment(), "hashed_pass"
        );
        mockPending.setId("REQ-" + uniqueSuffix);
        mockPending.setStatus(StaffApprovalStatus.PENDING_APPROVAL);

        when(userRepository.existsByEmail(testEmail)).thenReturn(false);
        when(staffAccessRequestRepository.existsByWorkEmail(testEmail)).thenReturn(false);
        when(staffAccessRequestRepository.existsByEmployeeId(testEmployeeId)).thenReturn(false);
        when(staffAccessRequestRepository.save(any(StaffAccessRequest.class))).thenReturn(mockPending);
        when(staffAccessRequestRepository.findById(mockPending.getId())).thenReturn(Optional.of(mockPending));

        // 1. Submit onboarding request
        StaffAccessRequest created = staffService.submitAccessRequest(dto);
        assertNotNull(created.getId());
        assertEquals(StaffApprovalStatus.PENDING_APPROVAL, created.getStatus());

        // 2. Administrator reviews and approves the request
        StaffAccessRequest approved = staffService.approveStaffRequest(
                created.getId(),
                "ADMIN-EXECUTIVE",
                "Hospital Executive Director",
                "SLMC credentials and NHSL medical director verification verified."
        );

        assertEquals(StaffApprovalStatus.APPROVED, approved.getStatus());
        assertEquals("ADMIN-EXECUTIVE", approved.getReviewedByAdminId());
        Mockito.verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Staff Onboarding Lifecycle: Rejection transitions status and does not provision user")
    void testStaffOnboardingRequestLifecycle_Rejection() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String testEmail = "nurse.test." + uniqueSuffix + "@nhsl.health.gov.lk";
        String testEmployeeId = "EMP-NUR-" + uniqueSuffix;

        StaffAccessRequest mockPending = new StaffAccessRequest();
        mockPending.setId("REQ-REJ-" + uniqueSuffix);
        mockPending.setWorkEmail(testEmail);
        mockPending.setStatus(StaffApprovalStatus.PENDING_APPROVAL);

        when(staffAccessRequestRepository.findById(mockPending.getId())).thenReturn(Optional.of(mockPending));
        when(staffAccessRequestRepository.save(any(StaffAccessRequest.class))).thenAnswer(i -> i.getArgument(0));

        // Admin rejects the request
        StaffAccessRequest rejected = staffService.rejectStaffRequest(
                mockPending.getId(),
                "ADMIN-EXECUTIVE",
                "Hospital Executive Director",
                "Official council registration number did not match SLNC registry."
        );

        assertEquals(StaffApprovalStatus.REJECTED, rejected.getStatus());
        Mockito.verify(userRepository, Mockito.never()).save(any(User.class));
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
    @DisplayName("Security Boundary: Suspended or deactivated staff account loses all access immediately")
    void testBoundary_SuspendedStaffAccountLosesAccess() throws Exception {
        String suspendedToken = jwtService.generateToken("suspended-doc-99", "suspended@nhsl.health.gov.lk", List.of("DOCTOR"));

        // Suspended doctor attempts to access doctor queue; must be rejected with 401 or 403
        mockMvc.perform(get("/api/doctor/queue")
                        .header("Authorization", "Bearer " + suspendedToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 401 || status == 403, "Suspended account must be denied with 401 or 403");
                });
    }

    @Test
    @DisplayName("Security Boundary: Unauthenticated request to protected endpoint is denied")
    void testBoundary_UnauthenticatedAccessIsDenied() throws Exception {
        mockMvc.perform(get("/api/doctor/queue"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 401 || status == 403, "Unauthenticated request must be denied with 401 or 403");
                });
    }
}
