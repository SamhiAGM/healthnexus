package com.healthconnect.auth;

import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Opt-in synthetic development data seeder for LankaCare.me.
 * Provisions 1 synthetic demonstration account per target role if absent.
 */
@Component
public class DevelopmentDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevelopmentDataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${lankacare.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${lankacare.demo.password:DemoPass2026!}")
    private String demoPassword;

    public DevelopmentDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Development data seeding is disabled.");
            return;
        }

        String encodedPassword = passwordEncoder.encode(demoPassword);

        record DemoAccount(String email, String fullName, String phone, Role role, String department) {}

        List<DemoAccount> demoAccounts = List.of(
                new DemoAccount("patient@lankacare.me", "Kamal Perera (Demo Citizen)", "0771234501", Role.PATIENT, "Outpatient"),
                new DemoAccount("doctor@lankacare.me", "Dr. Samantha Senanayake, MBBS (Demo Physician)", "0771234502", Role.DOCTOR, "Cardiology"),
                new DemoAccount("nurse@lankacare.me", "Sister Nilanthi Silva (Demo Nurse)", "0771234503", Role.NURSE, "Triage & Emergency"),
                new DemoAccount("reception@lankacare.me", "K. Wickramasinghe (Demo Receptionist)", "0771234504", Role.RECEPTIONIST, "Main OPD Intake"),
                new DemoAccount("pharmacy@lankacare.me", "P. Jayasuriya, B.Pharm (Demo Pharmacist)", "0771234505", Role.PHARMACIST, "Central Dispensary"),
                new DemoAccount("lab@lankacare.me", "T. Mendis, MLT (Demo Lab Technologist)", "0771234506", Role.LAB_TECHNICIAN, "Hematology & Pathology"),
                new DemoAccount("publichealth@lankacare.me", "PHI D. S. Karunaratne (Demo Field PHI)", "0771234507", Role.PUBLIC_HEALTH_OFFICER, "Community Health"),
                new DemoAccount("supervisor@lankacare.me", "Supervisory Officer N. Bandara (Demo Supervisor)", "0771234508", Role.FIELD_SUPERVISOR, "Provincial Quality Audit"),
                new DemoAccount("hospitaladmin@lankacare.me", "Dr. Asela Gunawardena (Demo Hospital Director)", "0771234509", Role.HOSPITAL_ADMIN, "Hospital Executive Board"),
                new DemoAccount("admin@lankacare.me", "Executive System Administrator (Demo Admin)", "0771234510", Role.SYSTEM_ADMIN, "National IT Directorate"),
                new DemoAccount("coordinator@lankacare.me", "Malini Fernando (Demo Clinic Coordinator)", "0771234511", Role.CLINIC_COORDINATOR, "Clinical Operations & Scheduling")
        );

        for (DemoAccount acc : demoAccounts) {
            if (!userRepository.existsByEmail(acc.email())) {
                User user = new User(
                        acc.fullName(),
                        acc.email(),
                        acc.phone(),
                        null,
                        null,
                        encodedPassword
                );
                user.setRoles(Set.of(acc.role()));
                user.setAssignedFacilityId("NHSL");
                user.setDepartment(acc.department());
                user.setEnabled(true);
                user.setVerified(true);
                userRepository.save(user);
                log.info("Provisioned demo account: {} ({})", acc.email(), acc.role());
            }
        }
    }
}
