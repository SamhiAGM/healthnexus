package com.healthconnect.admin;

import com.healthconnect.auth.EmailVerificationToken;
import com.healthconnect.auth.EmailVerificationTokenRepository;
import com.healthconnect.users.Role;
import com.healthconnect.users.StaffAccessRequest;
import com.healthconnect.users.StaffAccessRequestRepository;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DatabaseAuditCleanupServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StaffAccessRequestRepository staffAccessRequestRepository;

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    private DatabaseAuditCleanupService cleanupService;

    @BeforeEach
    void setUp() {
        cleanupService = new DatabaseAuditCleanupService(userRepository, staffAccessRequestRepository, tokenRepository);
    }

    @Test
    @DisplayName("Audit Dry-Run: Correctly categorizes synthetic demo vs real production records")
    void testGenerateDryRunAuditReport() {
        User realUser = new User("Dr. Sunimal Silva", "sunimal.silva@nhsl.health.gov.lk", "0771234567", "hash1", "199*****12", "pass");
        realUser.setId("USR-REAL-001");
        realUser.setRoles(Set.of(Role.DOCTOR));

        User syntheticUser = new User("Demo Patient", "patient.demo@example.lk", "0779999999", "hash2", "199*****99", "pass");
        syntheticUser.setId("USR-DEMO-001");
        syntheticUser.setRoles(Set.of(Role.PATIENT));

        when(userRepository.findAll()).thenReturn(List.of(realUser, syntheticUser));
        when(staffAccessRequestRepository.findAll()).thenReturn(List.of());
        when(tokenRepository.findAll()).thenReturn(List.of());

        Map<String, Object> report = cleanupService.generateDryRunAuditReport();

        assertNotNull(report);
        assertEquals(2, report.get("totalUsersAudited"));
        assertEquals(1, report.get("confirmedSyntheticUsersCount"));
        assertEquals(1, report.get("protectedRealUsersCount"));
        assertEquals("DRY_RUN_READ_ONLY", report.get("auditMode"));
    }

    @Test
    @DisplayName("Cleanup Execution: Dry-run mode performs zero deletions")
    void testExecuteCleanup_DryRun_NoDeletions() {
        when(userRepository.findAll()).thenReturn(List.of());
        when(staffAccessRequestRepository.findAll()).thenReturn(List.of());
        when(tokenRepository.findAll()).thenReturn(List.of());

        Map<String, Object> result = cleanupService.executeCleanup(true, null);

        assertEquals("NONE_DRY_RUN_ONLY", result.get("actionExecuted"));
        verify(userRepository, never()).delete(any());
        verify(staffAccessRequestRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Cleanup Execution: Rejects destructive purge without valid owner approval code")
    void testExecuteCleanup_InvalidApprovalCode_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () ->
                cleanupService.executeCleanup(false, "INVALID_CODE")
        );
        verify(userRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Cleanup Execution: Deletes only confirmed synthetic records when owner approval is verified")
    void testExecuteCleanup_Approved_DeletesOnlySyntheticRecords() {
        User realUser = new User("Real Clinician", "clinician@colombo.health.gov.lk", "0771112233", "hash1", "199*****11", "pass");
        realUser.setId("USR-REAL-001");

        User syntheticUser = new User("Synthetic User", "demo@example.com", "0778889900", "hash2", "199*****22", "pass");
        syntheticUser.setId("USR-DEMO-002");

        when(userRepository.findAll()).thenReturn(List.of(realUser, syntheticUser));
        when(staffAccessRequestRepository.findAll()).thenReturn(List.of());
        when(tokenRepository.findAll()).thenReturn(List.of());

        Map<String, Object> result = cleanupService.executeCleanup(false, "APPROVED_EXECUTE_DEMO_PURGE_2026");

        assertEquals("PURGE_SYNTHETIC_RECORDS", result.get("actionExecuted"));
        assertEquals(1, result.get("deletedSyntheticUsersCount"));

        verify(userRepository, times(1)).delete(syntheticUser);
        verify(userRepository, never()).delete(realUser);
    }
}
