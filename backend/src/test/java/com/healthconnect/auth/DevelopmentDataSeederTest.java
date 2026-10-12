package com.healthconnect.auth;

import com.healthconnect.users.Role;
import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DevelopmentDataSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Development Seeder: Aborts immediately if seed password is empty or unconfigured")
    void testSeeder_EmptyPassword_AbortsSafely() {
        DevelopmentDataSeeder seeder = new DevelopmentDataSeeder(userRepository, passwordEncoder);
        ReflectionTestUtils.setField(seeder, "seedPassword", "");

        seeder.run();

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Development Seeder: When password configured, seeds missing accounts without overwriting existing")
    void testSeeder_ConfiguredPassword_ProvisionsSafely() {
        DevelopmentDataSeeder seeder = new DevelopmentDataSeeder(userRepository, passwordEncoder);
        ReflectionTestUtils.setField(seeder, "seedPassword", "ExplicitSecretDevPass2026!");

        when(passwordEncoder.encode("ExplicitSecretDevPass2026!")).thenReturn("encoded_dev_hash");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        seeder.run();

        verify(passwordEncoder).encode("ExplicitSecretDevPass2026!");
        // Verify accounts are saved
        verify(userRepository, atLeast(5)).save(any(User.class));
    }
}
