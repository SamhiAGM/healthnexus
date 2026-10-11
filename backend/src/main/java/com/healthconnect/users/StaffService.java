package com.healthconnect.users;

import com.healthconnect.users.dto.StaffAccessRequestDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final StaffAccessRequestRepository staffAccessRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(
            StaffAccessRequestRepository staffAccessRequestRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.staffAccessRequestRepository = staffAccessRequestRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public StaffAccessRequest submitAccessRequest(StaffAccessRequestDto dto) {
        if (userRepository.existsByEmail(dto.getWorkEmail()) || staffAccessRequestRepository.existsByWorkEmail(dto.getWorkEmail())) {
            throw new IllegalArgumentException("A user or pending access request already exists with work email: " + dto.getWorkEmail());
        }

        if (staffAccessRequestRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new IllegalArgumentException("An access request with this employee ID is already registered: " + dto.getEmployeeId());
        }

        // Validate professional roles requiring council registration
        if ((dto.getRequestedRole() == Role.DOCTOR || dto.getRequestedRole() == Role.NURSE) &&
            (dto.getProfessionalRegistrationNumber() == null || dto.getProfessionalRegistrationNumber().trim().length() < 4)) {
            throw new IllegalArgumentException("Official medical or nursing council registration number is required for " + dto.getRequestedRole());
        }

        String passwordHash = passwordEncoder.encode(dto.getPassword());

        StaffAccessRequest request = new StaffAccessRequest(
                dto.getFullName(),
                dto.getEmployeeId().trim().toUpperCase(),
                dto.getWorkEmail().trim().toLowerCase(),
                dto.getContactPhone().trim(),
                dto.getRequestedRole(),
                dto.getFacilityId(),
                dto.getFacilityName(),
                dto.getDepartment(),
                passwordHash
        );

        request.setProfessionalCategory(dto.getProfessionalCategory());
        request.setProfessionalRegistrationNumber(
                dto.getProfessionalRegistrationNumber() != null ? dto.getProfessionalRegistrationNumber().trim().toUpperCase() : null
        );
        request.setStatus(StaffApprovalStatus.PENDING_APPROVAL);

        return staffAccessRequestRepository.save(request);
    }

    public List<StaffAccessRequest> getRequestsForFacility(String facilityId) {
        if (facilityId == null || facilityId.isBlank()) {
            return staffAccessRequestRepository.findAll();
        }
        return staffAccessRequestRepository.findByFacilityId(facilityId);
    }

    public List<StaffAccessRequest> getPendingRequests(String facilityId) {
        if (facilityId == null || facilityId.isBlank()) {
            return staffAccessRequestRepository.findByStatus(StaffApprovalStatus.PENDING_APPROVAL);
        }
        return staffAccessRequestRepository.findByFacilityIdAndStatus(facilityId, StaffApprovalStatus.PENDING_APPROVAL);
    }

    public Optional<StaffAccessRequest> getRequestById(String id) {
        return staffAccessRequestRepository.findById(id);
    }

    public Optional<StaffAccessRequest> getRequestByEmail(String email) {
        return staffAccessRequestRepository.findByWorkEmail(email.trim().toLowerCase());
    }

    public StaffAccessRequest approveStaffRequest(String requestId, String adminId, String adminName, String reviewNotes) {
        StaffAccessRequest request = staffAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Staff access request not found: " + requestId));

        if (request.getStatus() != StaffApprovalStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only requests in PENDING_APPROVAL status can be approved. Current status: " + request.getStatus());
        }

        // Check if an active user with this email already exists
        if (userRepository.existsByEmail(request.getWorkEmail())) {
            throw new IllegalStateException("An activated user account with this email already exists: " + request.getWorkEmail());
        }

        // Provision the official User entity with authorized clinical role
        User user = new User(
                request.getFullName(),
                request.getWorkEmail(),
                request.getContactPhone(),
                null,
                null,
                request.getPasswordHash()
        );

        user.setRoles(java.util.Set.of(request.getRequestedRole()));
        user.setAssignedFacilityId(request.getFacilityId());
        user.setDepartment(request.getDepartment());
        user.setEnabled(true);
        user.setVerified(true);

        userRepository.save(user);

        // Update request status and audit metadata
        request.setStatus(StaffApprovalStatus.APPROVED);
        request.setReviewedByAdminId(adminId != null ? adminId : "SYSTEM_ADMIN");
        request.setReviewedByAdminName(adminName != null ? adminName : "Hospital Executive Admin");
        request.setReviewNotes(reviewNotes != null ? reviewNotes : "Credentials and council registration verified.");
        request.setReviewedAt(java.time.Instant.now());

        return staffAccessRequestRepository.save(request);
    }

    public StaffAccessRequest rejectStaffRequest(String requestId, String adminId, String adminName, String rejectionReason) {
        StaffAccessRequest request = staffAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Staff access request not found: " + requestId));

        if (request.getStatus() != StaffApprovalStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only requests in PENDING_APPROVAL status can be rejected. Current status: " + request.getStatus());
        }

        request.setStatus(StaffApprovalStatus.REJECTED);
        request.setReviewedByAdminId(adminId != null ? adminId : "SYSTEM_ADMIN");
        request.setReviewedByAdminName(adminName != null ? adminName : "Hospital Executive Admin");
        request.setReviewNotes(rejectionReason != null ? rejectionReason : "Application did not meet verification criteria.");
        request.setReviewedAt(java.time.Instant.now());

        return staffAccessRequestRepository.save(request);
    }
}
