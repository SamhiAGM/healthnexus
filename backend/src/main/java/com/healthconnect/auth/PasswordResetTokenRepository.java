package com.healthconnect.auth;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByEmail(String email);

    Optional<PasswordResetToken> findByEmailIgnoreCase(String email);

    void deleteByEmail(String email);

    void deleteByIdAndCodeHash(String id, String codeHash);
}
