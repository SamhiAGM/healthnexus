package com.healthconnect.clinics;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClinicService {

    private final QueueTicketRepository queueTicketRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRecordRepository consultationRecordRepository;

    public ClinicService(
            QueueTicketRepository queueTicketRepository,
            AppointmentRepository appointmentRepository,
            ConsultationRecordRepository consultationRecordRepository
    ) {
        this.queueTicketRepository = queueTicketRepository;
        this.appointmentRepository = appointmentRepository;
        this.consultationRecordRepository = consultationRecordRepository;
    }

    public List<QueueTicket> getActiveQueueForFacility(String facilityId) {
        if (facilityId == null || facilityId.isBlank()) {
            return queueTicketRepository.findAll();
        }
        return queueTicketRepository.findByFacilityIdAndStatus(facilityId, QueueTicket.QueueStatus.WAITING);
    }

    public List<QueueTicket> getAllTicketsForFacility(String facilityId) {
        if (facilityId == null || facilityId.isBlank()) {
            return queueTicketRepository.findAll();
        }
        return queueTicketRepository.findByFacilityIdAndClinicType(facilityId, "CARDIOLOGY");
    }

    public QueueTicket updateTicketStatus(String ticketNumber, QueueTicket.QueueStatus status) {
        QueueTicket ticket = queueTicketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new IllegalArgumentException("Queue ticket not found: " + ticketNumber));
        ticket.setStatus(status);
        ticket.setUpdatedAt(java.time.Instant.now());
        return queueTicketRepository.save(ticket);
    }

    public ConsultationRecord recordConsultation(
            String ticketNumber,
            String patientId,
            String patientName,
            String doctorId,
            String doctorName,
            String facilityId,
            String notes,
            List<String> prescriptions,
            List<String> labOrders
    ) {
        // Advance ticket to COMPLETED
        queueTicketRepository.findByTicketNumber(ticketNumber).ifPresent(ticket -> {
            ticket.setStatus(QueueTicket.QueueStatus.COMPLETED);
            ticket.setUpdatedAt(java.time.Instant.now());
            queueTicketRepository.save(ticket);
        });

        ConsultationRecord record = new ConsultationRecord(
                ticketNumber,
                patientId,
                patientName,
                doctorId,
                doctorName,
                facilityId,
                notes,
                prescriptions,
                labOrders
        );
        return consultationRecordRepository.save(record);
    }

    public QueueTicket updateTicketVitals(String ticketNumber, String vitalsSummary, String urgencyTag) {
        QueueTicket ticket = queueTicketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new IllegalArgumentException("Queue ticket not found: " + ticketNumber));
        ticket.setVitalsSummary(vitalsSummary);
        if (urgencyTag != null && !urgencyTag.isBlank()) {
            ticket.setPriorityTag(urgencyTag);
        }
        ticket.setUpdatedAt(java.time.Instant.now());
        return queueTicketRepository.save(ticket);
    }

    public List<Appointment> getAppointmentsForPatient(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public Appointment bookAppointment(Appointment appointment) {
        if (appointment.getBookingReference() == null || appointment.getBookingReference().isBlank()) {
            appointment.setBookingReference("APT-" + (1000 + (int)(Math.random() * 9000)));
        }
        return appointmentRepository.save(appointment);
    }
}
