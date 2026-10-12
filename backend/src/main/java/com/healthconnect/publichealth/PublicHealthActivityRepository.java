package com.healthconnect.publichealth;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicHealthActivityRepository extends MongoRepository<PublicHealthActivity, String> {
    List<PublicHealthActivity> findByAreaJurisdictionIgnoreCase(String areaJurisdiction);
    List<PublicHealthActivity> findByStatusOrderByCreatedAtDesc(String status);
    Optional<PublicHealthActivity> findByActivityCode(String activityCode);
}
