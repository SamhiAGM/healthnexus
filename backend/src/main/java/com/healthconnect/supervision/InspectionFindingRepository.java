package com.healthconnect.supervision;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionFindingRepository extends MongoRepository<InspectionFinding, String> {

    List<InspectionFinding> findAllByOrderByCreatedAtDesc();

    List<InspectionFinding> findByFacility(String facility);

    List<InspectionFinding> findByStatus(String status);

    Optional<InspectionFinding> findByFindingCode(String findingCode);

    long countByStatus(String status);

    long countByStatusNot(String status);
}
