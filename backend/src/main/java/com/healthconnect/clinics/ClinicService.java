package com.healthconnect.clinics;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
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

    public QueueTicket issueQueueTicket(
            String patientName,
            String patientNic,
            String clinicType,
            String consultationRoom,
            String facilityId,
            String facilityName,
            String priorityTag,
            String complaint
    ) {
        String safeFacilityId = (facilityId != null && !facilityId.isBlank()) ? facilityId : "NHSL";
        String safeFacilityName = (facilityName != null && !facilityName.isBlank()) ? facilityName : "National Hospital of Sri Lanka (NHSL)";
        String safeClinic = (clinicType != null && !clinicType.isBlank()) ? clinicType : "General OPD Room 01";
        String safePriority = (priorityTag != null && !priorityTag.isBlank()) ? priorityTag : "ROUTINE";

        String prefix = "C-";
        String upperClinic = safeClinic.toUpperCase();
        if (upperClinic.contains("CARDIO")) {
            prefix = "C-";
        } else if (upperClinic.contains("PEDIATRIC")) {
            prefix = "PED-";
        } else if (upperClinic.contains("DIABET")) {
            prefix = "DIA-";
        } else if (upperClinic.contains("OPD")) {
            prefix = "OPD-";
        } else {
            prefix = "T-";
        }

        long count = queueTicketRepository.countByFacilityId(safeFacilityId);
        long nextNum = count + 20;
        String ticketNumber = prefix + String.format("%03d", nextNum);

        int attempts = 0;
        while (queueTicketRepository.findByTicketNumber(ticketNumber).isPresent() && attempts < 50) {
            nextNum++;
            ticketNumber = prefix + String.format("%03d", nextNum);
            attempts++;
        }

        QueueTicket ticket = new QueueTicket();
        ticket.setTicketNumber(ticketNumber);
        ticket.setPatientName(patientName != null ? patientName.trim() : "Walk-in Citizen");
        ticket.setPatientNic(patientNic != null ? patientNic.trim() : "");
        ticket.setClinicType(safeClinic);
        ticket.setConsultationRoom(consultationRoom != null ? consultationRoom : "Room 01");
        ticket.setFacilityId(safeFacilityId);
        ticket.setFacilityName(safeFacilityName);
        ticket.setPriorityTag(safePriority);
        ticket.setComplaint(complaint);
        ticket.setStatus(QueueTicket.QueueStatus.WAITING);
        ticket.setCreatedAt(java.time.Instant.now());
        ticket.setUpdatedAt(java.time.Instant.now());

        return queueTicketRepository.save(ticket);
    }

    public List<QueueTicket> getRecentTickets(String facilityId) {
        if (facilityId == null || facilityId.isBlank()) {
            return queueTicketRepository.findAllByOrderByCreatedAtDesc();
        }
        return queueTicketRepository.findByFacilityIdOrderByCreatedAtDesc(facilityId);
    }

    public QueueTicket cancelTicket(String ticketNumber) {
        QueueTicket ticket = queueTicketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new IllegalArgumentException("Queue ticket not found: " + ticketNumber));
        ticket.setStatus(QueueTicket.QueueStatus.SKIPPED);
        ticket.setUpdatedAt(java.time.Instant.now());
        return queueTicketRepository.save(ticket);
    }
}
