package com.healthconnect.clinics;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTicketRepository extends MongoRepository<QueueTicket, String> {

    List<QueueTicket> findByFacilityIdAndClinicType(String facilityId, String clinicType);

    List<QueueTicket> findByFacilityIdAndStatus(String facilityId, QueueTicket.QueueStatus status);

    List<QueueTicket> findByStatus(QueueTicket.QueueStatus status);

    Optional<QueueTicket> findByTicketNumber(String ticketNumber);

    List<QueueTicket> findByPatientId(String patientId);
}
