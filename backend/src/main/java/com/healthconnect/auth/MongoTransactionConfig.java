package com.healthconnect.auth;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.beans.factory.ObjectProvider;

/** Enables replica-set/Atlas transactions for the OTP verification write set. */
@Configuration
public class MongoTransactionConfig {

    @Bean(name = "mongoTransactionManager")
    @ConditionalOnMissingBean(name = "mongoTransactionManager")
    MongoTransactionManager mongoTransactionManager(ObjectProvider<MongoDatabaseFactory> databaseFactories) {
        MongoDatabaseFactory databaseFactory = databaseFactories.getIfAvailable();
        if (databaseFactory == null) {
            throw new IllegalStateException("MongoDatabaseFactory is required for OTP transactions");
        }
        return new MongoTransactionManager(databaseFactory);
    }
}
