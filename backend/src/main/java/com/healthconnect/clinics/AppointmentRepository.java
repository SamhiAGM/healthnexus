package com.healthconnect.clinics;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientId(String patientId);

    List<Appointment> findByFacilityId(String facilityId);

    Optional<Appointment> findByBookingReference(String bookingReference);

    List<Appointment> findByFacilityIdAndClinicSpecialty(String facilityId, String clinicSpecialty);
}
