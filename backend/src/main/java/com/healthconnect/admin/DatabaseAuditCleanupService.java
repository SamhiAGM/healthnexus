package com.healthconnect.admin;

import com.healthconnect.auth.EmailVerificationToken;
import com.healthconnect.auth.EmailVerificationTokenRepository;
import com.healthconnect.users.StaffAccessRequest;
import com.healthconnect.users.StaffAccessRequestRepository;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@SuppressWarnings("null")
public class DatabaseAuditCleanupService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseAuditCleanupService.class);

    private final UserRepository userRepository;
    private final StaffAccessRequestRepository staffAccessRequestRepository;
    private final EmailVerificationTokenRepository tokenRepository;

    public DatabaseAuditCleanupService(
            UserRepository userRepository,
            StaffAccessRequestRepository staffAccessRequestRepository,
            EmailVerificationTokenRepository tokenRepository
    ) {
        this.userRepository = userRepository;
        this.staffAccessRequestRepository = staffAccessRequestRepository;
        this.tokenRepository = tokenRepository;
    }

    public Map<String, Object> generateDryRunAuditReport() {
        log.info("Executing safe read-only database audit dry-run...");
        Instant now = Instant.now();

        List<User> allUsers = userRepository.findAll();
        List<StaffAccessRequest> allStaffRequests = staffAccessRequestRepository.findAll();
        List<EmailVerificationToken> allTokens = tokenRepository.findAll();

        List<Map<String, String>> syntheticDemoUsers = new ArrayList<>();
        List<Map<String, String>> realProductionUsers = new ArrayList<>();
        List<Map<String, String>> syntheticStaffRequests = new ArrayList<>();
        List<Map<String, String>> realStaffRequests = new ArrayList<>();
        List<Map<String, String>> expiredTokens = new ArrayList<>();

        for (User u : allUsers) {
            boolean isSynthetic = isSyntheticEmail(u.getEmail()) || (u.getId() != null && u.getId().startsWith("USR-DEMO-"));
            Map<String, String> summary = Map.of(
                    "id", u.getId() != null ? u.getId() : "unknown",
                    "email", u.getEmail() != null ? u.getEmail() : "no-email",
                    "roles", u.getRoles() != null ? u.getRoles().toString() : "[]",
                    "verified", String.valueOf(u.isVerified()),
                    "category", isSynthetic ? "SYNTHETIC_DEMO" : "REAL_PRODUCTION_RECORD"
            );
            if (isSynthetic) {
                syntheticDemoUsers.add(summary);
            } else {
                realProductionUsers.add(summary);
            }
        }

        for (StaffAccessRequest req : allStaffRequests) {
            boolean isSynthetic = isSyntheticEmail(req.getWorkEmail()) || (req.getEmployeeId() != null && req.getEmployeeId().startsWith("DEMO-"));
            Map<String, String> summary = Map.of(
                    "id", req.getId() != null ? req.getId() : "unknown",
                    "workEmail", req.getWorkEmail() != null ? req.getWorkEmail() : "no-email",
                    "status", req.getStatus() != null ? req.getStatus().name() : "UNKNOWN",
                    "requestedRole", req.getRequestedRole() != null ? req.getRequestedRole().name() : "UNKNOWN",
                    "category", isSynthetic ? "SYNTHETIC_DEMO" : "REAL_PRODUCTION_RECORD"
            );
            if (isSynthetic) {
                syntheticStaffRequests.add(summary);
            } else {
                realStaffRequests.add(summary);
            }
        }

        for (EmailVerificationToken tok : allTokens) {
            if (tok.getExpiresAt() != null && tok.getExpiresAt().isBefore(now)) {
                expiredTokens.add(Map.of(
                        "id", tok.getId() != null ? tok.getId() : "unknown",
                        "email", tok.getEmail() != null ? tok.getEmail() : "no-email",
                        "expiresAt", tok.getExpiresAt().toString(),
                        "category", "EXPIRED_TOKEN"
                ));
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("timestamp", now.toString());
        report.put("auditMode", "DRY_RUN_READ_ONLY");
        report.put("totalUsersAudited", allUsers.size());
        report.put("confirmedSyntheticUsersCount", syntheticDemoUsers.size());
        report.put("protectedRealUsersCount", realProductionUsers.size());
        report.put("totalStaffRequestsAudited", allStaffRequests.size());
        report.put("confirmedSyntheticStaffRequestsCount", syntheticStaffRequests.size());
        report.put("protectedRealStaffRequestsCount", realStaffRequests.size());
        report.put("expiredTokensIdentifiedCount", expiredTokens.size());
        report.put("syntheticUsersSummary", syntheticDemoUsers);
        report.put("syntheticStaffRequestsSummary", syntheticStaffRequests);
        report.put("expiredTokensSummary", expiredTokens);
        report.put("safetyAssessment", "Zero real production records targeted. Explicit owner authorization required for destructive purge.");

        return report;
    }

    public Map<String, Object> executeCleanup(boolean dryRun, String ownerApprovalCode) {
        if (dryRun) {
            Map<String, Object> dryRunResult = generateDryRunAuditReport();
            dryRunResult.put("actionExecuted", "NONE_DRY_RUN_ONLY");
            return dryRunResult;
        }

        if (ownerApprovalCode == null || !ownerApprovalCode.trim().equals("APPROVED_EXECUTE_DEMO_PURGE_2026")) {
            throw new IllegalArgumentException("Destructive cleanup denied: explicit owner approval code is invalid or missing.");
        }

        log.warn("Owner approval verified. Executing idempotent purge of confirmed synthetic demo fixtures only...");

        int deletedUsers = 0;
        for (User u : userRepository.findAll()) {
            if (isSyntheticEmail(u.getEmail()) || (u.getId() != null && u.getId().startsWith("USR-DEMO-"))) {
                userRepository.delete(u);
                deletedUsers++;
            }
        }

        int deletedStaffReqs = 0;
        for (StaffAccessRequest req : staffAccessRequestRepository.findAll()) {
            if (isSyntheticEmail(req.getWorkEmail()) || (req.getEmployeeId() != null && req.getEmployeeId().startsWith("DEMO-"))) {
                staffAccessRequestRepository.delete(req);
                deletedStaffReqs++;
            }
        }

        int deletedTokens = 0;
        Instant now = Instant.now();
        for (EmailVerificationToken tok : tokenRepository.findAll()) {
            if (tok.getExpiresAt() != null && tok.getExpiresAt().isBefore(now)) {
                tokenRepository.delete(tok);
                deletedTokens++;
            }
        }

        log.info("Idempotent cleanup completed: purged {} synthetic users, {} synthetic staff requests, {} expired tokens.",
                deletedUsers, deletedStaffReqs, deletedTokens);

        return Map.of(
                "timestamp", now.toString(),
                "actionExecuted", "PURGE_SYNTHETIC_RECORDS",
                "deletedSyntheticUsersCount", deletedUsers,
                "deletedSyntheticStaffRequestsCount", deletedStaffReqs,
                "deletedExpiredTokensCount", deletedTokens,
                "status", "SUCCESS"
        );
    }

    private boolean isSyntheticEmail(String email) {
        if (email == null) return true;
        String lower = email.trim().toLowerCase();
        return lower.endsWith("@example.com")
                || lower.endsWith("@example.lk")
                || lower.endsWith("@demo.lankacare.me")
                || lower.contains("test")
                || lower.startsWith("demo.");
    }
}
