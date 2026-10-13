package com.healthconnect.auth;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, String> {
    Optional<EmailVerificationToken> findByEmail(String email);
    void deleteByEmail(String email);
    boolean existsByEmail(String email);
}
