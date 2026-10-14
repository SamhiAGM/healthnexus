package com.healthconnect.users;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByNicHash(String nicHash);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByNicHash(String nicHash);
}
