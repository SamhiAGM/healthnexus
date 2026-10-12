package com.healthconnect.users;

import com.healthconnect.users.dto.StaffAccessRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class StaffServiceTest {

    @Mock
    private StaffAccessRequestRepository staffAccessRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private StaffService staffService;

    @BeforeEach
    void setUp() {
        staffService = new StaffService(staffAccessRequestRepository, userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Staff Application Submission: Successfully records pending request with hashed password")
    void testSubmitAccessRequest_Success() {
        StaffAccessRequestDto dto = new StaffAccessRequestDto();
        dto.setFullName("Dr. Nimal Senaratne");
        dto.setEmployeeId("EMP-7711");
        dto.setWorkEmail("nimal.s@nhsl.health.gov.lk");
        dto.setContactPhone("+94771234567");
        dto.setRequestedRole(Role.DOCTOR);
        dto.setFacilityId("NHSL");
        dto.setFacilityName("National Hospital of Sri Lanka");
        dto.setDepartment("Cardiology");
        dto.setProfessionalCategory("Consultant Cardiologist");
        dto.setProfessionalRegistrationNumber("SLMC-12345");
        dto.setPassword("SecureStaffPass123!");

        when(userRepository.existsByEmail("nimal.s@nhsl.health.gov.lk")).thenReturn(false);
        when(staffAccessRequestRepository.existsByWorkEmail("nimal.s@nhsl.health.gov.lk")).thenReturn(false);
        when(staffAccessRequestRepository.existsByEmployeeId("EMP-7711")).thenReturn(false);
        when(passwordEncoder.encode("SecureStaffPass123!")).thenReturn("hashed_staff_pass");

        StaffAccessRequest saved = new StaffAccessRequest();
        saved.setId("REQ-999");
        saved.setStatus(StaffApprovalStatus.PENDING_APPROVAL);
        when(staffAccessRequestRepository.save(any(StaffAccessRequest.class))).thenReturn(saved);

        StaffAccessRequest result = staffService.submitAccessRequest(dto);

        assertNotNull(result);
        assertEquals("REQ-999", result.getId());
        assertEquals(StaffApprovalStatus.PENDING_APPROVAL, result.getStatus());

        ArgumentCaptor<StaffAccessRequest> captor = ArgumentCaptor.forClass(StaffAccessRequest.class);
        verify(staffAccessRequestRepository).save(captor.capture());
        assertEquals("hashed_staff_pass", captor.getValue().getPasswordHash());
        assertEquals("NHSL", captor.getValue().getFacilityId());
    }

    @Test
    @DisplayName("Staff Application: Rejects clinical role submission without council registration number")
    void testSubmitAccessRequest_MissingCouncilNumber_ThrowsException() {
        StaffAccessRequestDto dto = new StaffAccessRequestDto();
        dto.setFullName("Dr. Nimal Senaratne");
        dto.setEmployeeId("EMP-7711");
        dto.setWorkEmail("nimal.s@nhsl.health.gov.lk");
        dto.setContactPhone("+94771234567");
        dto.setRequestedRole(Role.DOCTOR);
        dto.setProfessionalRegistrationNumber(""); // Empty registration number
        dto.setPassword("SecureStaffPass123!");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(staffAccessRequestRepository.existsByWorkEmail(anyString())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> staffService.submitAccessRequest(dto));
        verify(staffAccessRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Staff Approval: Successfully approves pending request and activates User record")
    void testApproveStaffRequest_Success() {
        StaffAccessRequest request = new StaffAccessRequest(
                "Nurse Malini", "EMP-NUR-1", "malini@nhsl.health.gov.lk", "0771112233",
                Role.NURSE, "NHSL", "National Hospital", "Emergency", "hashed_pass"
        );
        request.setId("REQ-123");
        request.setStatus(StaffApprovalStatus.PENDING_APPROVAL);

        when(staffAccessRequestRepository.findById("REQ-123")).thenReturn(Optional.of(request));
        when(userRepository.existsByEmail("malini@nhsl.health.gov.lk")).thenReturn(false);
        when(staffAccessRequestRepository.save(any(StaffAccessRequest.class))).thenAnswer(i -> i.getArgument(0));

        StaffAccessRequest approved = staffService.approveStaffRequest("REQ-123", "ADMIN-01", "Hospital Director", "Validated with SLNC.");

        assertEquals(StaffApprovalStatus.APPROVED, approved.getStatus());
        assertEquals("ADMIN-01", approved.getReviewedByAdminId());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User provisioned = userCaptor.getValue();
        assertTrue(provisioned.isEnabled(), "Provisioned user must be enabled");
        assertTrue(provisioned.isVerified(), "Provisioned user must be verified");
        assertTrue(provisioned.getRoles().contains(Role.NURSE));
        assertEquals("NHSL", provisioned.getAssignedFacilityId());
    }

    @Test
    @DisplayName("Staff Approval: Rejects approval of already reviewed request")
    void testApproveStaffRequest_AlreadyApproved_ThrowsException() {
        StaffAccessRequest request = new StaffAccessRequest();
        request.setId("REQ-456");
        request.setStatus(StaffApprovalStatus.APPROVED);

        when(staffAccessRequestRepository.findById("REQ-456")).thenReturn(Optional.of(request));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                staffService.approveStaffRequest("REQ-456", "ADMIN-01", "Director", "Notes")
        );
        assertTrue(ex.getMessage().contains("Only requests in PENDING_APPROVAL status can be approved"));
    }

    @Test
    @DisplayName("Staff Rejection: Successfully updates status to REJECTED and does not create user")
    void testRejectStaffRequest_Success() {
        StaffAccessRequest request = new StaffAccessRequest();
        request.setId("REQ-789");
        request.setStatus(StaffApprovalStatus.PENDING_APPROVAL);

        when(staffAccessRequestRepository.findById("REQ-789")).thenReturn(Optional.of(request));
        when(staffAccessRequestRepository.save(any(StaffAccessRequest.class))).thenAnswer(i -> i.getArgument(0));

        StaffAccessRequest rejected = staffService.rejectStaffRequest("REQ-789", "ADMIN-01", "Director", "Invalid SLMC id");

        assertEquals(StaffApprovalStatus.REJECTED, rejected.getStatus());
        verify(userRepository, never()).save(any(User.class));
    }
}
