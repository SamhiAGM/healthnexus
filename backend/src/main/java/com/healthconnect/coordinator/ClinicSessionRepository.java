package com.healthconnect.coordinator;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicSessionRepository extends MongoRepository<ClinicSessionSchedule, String> {
    List<ClinicSessionSchedule> findByDayOfWeekIgnoreCase(String dayOfWeek);
    List<ClinicSessionSchedule> findByStatusIgnoreCase(String status);
}
