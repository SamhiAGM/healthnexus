package com.healthconnect.auth;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, String> {
    Optional<EmailVerificationToken> findByEmail(String email);
    Optional<EmailVerificationToken> findByEmailIgnoreCase(String email);
    void deleteByEmail(String email);
    long deleteByIdAndOtpHash(String id, String otpHash);
    boolean existsByEmail(String email);
}
