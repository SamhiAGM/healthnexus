package com.healthconnect.users;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffAccessRequestRepository extends MongoRepository<StaffAccessRequest, String> {

    List<StaffAccessRequest> findByFacilityId(String facilityId);

    List<StaffAccessRequest> findByFacilityIdAndStatus(String facilityId, StaffApprovalStatus status);

    List<StaffAccessRequest> findByStatus(StaffApprovalStatus status);

    Optional<StaffAccessRequest> findByWorkEmail(String workEmail);

    Optional<StaffAccessRequest> findByEmployeeId(String employeeId);

    boolean existsByWorkEmail(String workEmail);

    boolean existsByEmployeeId(String employeeId);
}
