package com.healthconnect.laboratory;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabOrderRepository extends MongoRepository<LabOrder, String> {
    List<LabOrder> findByFacilityIdOrderByCreatedAtDesc(String facilityId);
    List<LabOrder> findByStatusOrderByCreatedAtDesc(String status);
    Optional<LabOrder> findByOrderNumber(String orderNumber);
    long countByStatus(String status);
}
