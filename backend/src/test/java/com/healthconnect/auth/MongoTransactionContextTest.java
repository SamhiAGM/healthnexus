package com.healthconnect.auth;

import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;

@SpringJUnitConfig({MongoTransactionContextTest.Config.class, MongoTransactionConfig.class})
class MongoTransactionContextTest {

    @Test
    void registersAndInjectsMongoTransactionManager(ApplicationContext context) {
        MongoTransactionManager manager = context.getBean("mongoTransactionManager", MongoTransactionManager.class);
        EmailOtpService service = context.getBean(EmailOtpService.class);

        assertInstanceOf(MongoTransactionManager.class, manager);
        assertSame(manager, context.getBean("mongoTransactionManager", PlatformTransactionManager.class));
        assertSame(service, context.getBean(EmailOtpService.class));
    }

    @Configuration
    static class Config {
        @Bean
        MongoDatabaseFactory mongoDatabaseFactory() {
            return mock(MongoDatabaseFactory.class);
        }

        @Bean
        EmailVerificationTokenRepository tokenRepository() {
            return mock(EmailVerificationTokenRepository.class);
        }

        @Bean
        UserRepository userRepository() {
            return mock(UserRepository.class);
        }

        @Bean
        EmailService emailService() {
            return mock(EmailService.class);
        }

        @Bean
        MongoTemplate mongoTemplate() {
            return mock(MongoTemplate.class);
        }

        @Bean
        EmailOtpService emailOtpService(
                EmailVerificationTokenRepository tokenRepository,
                UserRepository userRepository,
                EmailService emailService,
                MongoTemplate mongoTemplate,
                @Qualifier("mongoTransactionManager") PlatformTransactionManager transactionManager) {
            return new EmailOtpService(tokenRepository, userRepository, emailService, mongoTemplate,
                    "context-test-hmac-secret-that-is-at-least-32-bytes", transactionManager);
        }
    }
}
