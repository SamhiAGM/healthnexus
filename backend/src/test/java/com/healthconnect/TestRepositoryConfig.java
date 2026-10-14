package com.healthconnect;

import com.healthconnect.clinics.AppointmentRepository;
import com.healthconnect.clinics.ConsultationRecordRepository;
import com.healthconnect.clinics.QueueTicketRepository;
import com.healthconnect.coordinator.ClinicSessionRepository;
import com.healthconnect.hospitaladmin.HospitalAnnouncementRepository;
import com.healthconnect.hospitaladmin.HospitalDepartmentRepository;
import com.healthconnect.laboratory.LabOrderRepository;
import com.healthconnect.pharmacy.MedicationStockRepository;
import com.healthconnect.pharmacy.PrescriptionRepository;
import com.healthconnect.publichealth.PublicHealthActivityRepository;
import com.healthconnect.supervision.InspectionFindingRepository;
import com.healthconnect.users.StaffAccessRequestRepository;
import com.healthconnect.users.UserRepository;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.transaction.PlatformTransactionManager;

@TestConfiguration
public class TestRepositoryConfig {

    @Bean @Primary public UserRepository userRepository() { return Mockito.mock(UserRepository.class); }
    @Bean @Primary public StaffAccessRequestRepository staffAccessRequestRepository() { return Mockito.mock(StaffAccessRequestRepository.class); }
    @Bean @Primary public InspectionFindingRepository inspectionFindingRepository() { return Mockito.mock(InspectionFindingRepository.class); }
    @Bean @Primary public PublicHealthActivityRepository publicHealthActivityRepository() { return Mockito.mock(PublicHealthActivityRepository.class); }
    @Bean @Primary public PrescriptionRepository prescriptionRepository() { return Mockito.mock(PrescriptionRepository.class); }
    @Bean @Primary public MedicationStockRepository medicationStockRepository() { return Mockito.mock(MedicationStockRepository.class); }
    @Bean @Primary public LabOrderRepository labOrderRepository() { return Mockito.mock(LabOrderRepository.class); }
    @Bean @Primary public HospitalDepartmentRepository hospitalDepartmentRepository() { return Mockito.mock(HospitalDepartmentRepository.class); }
    @Bean @Primary public HospitalAnnouncementRepository hospitalAnnouncementRepository() { return Mockito.mock(HospitalAnnouncementRepository.class); }
    @Bean @Primary public ClinicSessionRepository clinicSessionRepository() { return Mockito.mock(ClinicSessionRepository.class); }
    @Bean @Primary public QueueTicketRepository queueTicketRepository() { return Mockito.mock(QueueTicketRepository.class); }
    @Bean @Primary public ConsultationRecordRepository consultationRecordRepository() { return Mockito.mock(ConsultationRecordRepository.class); }
    @Bean @Primary public AppointmentRepository appointmentRepository() { return Mockito.mock(AppointmentRepository.class); }
    @Bean @Primary public com.healthconnect.auth.EmailVerificationTokenRepository emailVerificationTokenRepository() { return Mockito.mock(com.healthconnect.auth.EmailVerificationTokenRepository.class); }
    @Bean @Primary public org.springframework.mail.javamail.JavaMailSender javaMailSender() { return Mockito.mock(org.springframework.mail.javamail.JavaMailSender.class); }
    @Bean @Primary public org.springframework.data.mongodb.core.MongoTemplate mongoTemplate() { return Mockito.mock(org.springframework.data.mongodb.core.MongoTemplate.class); }
    @Bean(name = "mongoTransactionManager") @Primary public PlatformTransactionManager transactionManager() {
        PlatformTransactionManager manager = Mockito.mock(PlatformTransactionManager.class);
        Mockito.when(manager.getTransaction(Mockito.any())).thenReturn(Mockito.mock(org.springframework.transaction.TransactionStatus.class));
        return manager;
    }
}
