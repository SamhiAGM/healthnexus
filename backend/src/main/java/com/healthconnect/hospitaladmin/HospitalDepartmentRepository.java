package com.healthconnect.hospitaladmin;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalDepartmentRepository extends MongoRepository<HospitalDepartment, String> {
    Optional<HospitalDepartment> findByCode(String code);
}
