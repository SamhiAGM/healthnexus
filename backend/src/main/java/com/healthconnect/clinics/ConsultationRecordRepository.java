package com.healthconnect.clinics;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRecordRepository extends MongoRepository<ConsultationRecord, String> {

    List<ConsultationRecord> findByPatientId(String patientId);

    List<ConsultationRecord> findByDoctorId(String doctorId);

    List<ConsultationRecord> findByFacilityId(String facilityId);
}
