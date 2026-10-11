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
}
