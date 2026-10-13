package com.healthconnect.clinics;

import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Patient-owned workflow endpoints. Patient identity is always taken from the JWT principal. */
@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final ClinicService clinicService;
    private final UserRepository userRepository;

    public PatientController(ClinicService clinicService, UserRepository userRepository) {
        this.clinicService = clinicService;
        this.userRepository = userRepository;
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> appointments(Authentication authentication) {
        return ResponseEntity.ok(clinicService.getAppointmentsForPatient(authentication.getName()));
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointment> bookAppointment(
            Authentication authentication,
            @RequestBody AppointmentRequest request
    ) {
        User user = userRepository.findById(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user record not found."));

        Appointment appointment = new Appointment(
                null,
                user.getId(),
                user.getFullName(),
                request.facilityName(),
                request.clinicSpecialty(),
                request.appointmentDate(),
                request.sessionWindow()
        );
        appointment.setFacilityId(request.facilityId());
        appointment.setPatientPhone(user.getPhone());
        appointment.setReasonForVisit(request.reasonForVisit());
        return ResponseEntity.ok(clinicService.bookAppointment(appointment));
    }

    public record AppointmentRequest(
            String facilityId,
            String facilityName,
            String clinicSpecialty,
            String appointmentDate,
            String sessionWindow,
            String reasonForVisit
    ) { }
}
