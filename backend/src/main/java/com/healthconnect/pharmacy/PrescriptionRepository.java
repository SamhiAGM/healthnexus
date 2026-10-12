package com.healthconnect.pharmacy;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByFacilityIdOrderByCreatedAtDesc(String facilityId);
    List<Prescription> findByStatusOrderByCreatedAtDesc(String status);
    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);
    long countByStatus(String status);
}
