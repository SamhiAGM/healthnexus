package com.healthconnect.security;

import com.healthconnect.users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserRepository userRepository;

    @Value("${lankacare.cors.allowed-origins:https://www.lankacare.me,https://lankacare.me,http://localhost:3000}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserRepository userRepository) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookiePath("/");

        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null); // Force rendering to token attribute for SPA

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers(
                                "/api/auth/login",
                                "/api/auth/patients/register",
                                "/api/auth/phone/verify",
                                "/api/auth/email/**",
                                "/api/auth/mfa/verify",
                                "/api/staff/access-requests",
                                "/api/staff/access-requests/status",
                                "/api/public/**",
                                "/actuator/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**"
                        )
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/patients/register",
                                "/api/auth/phone/verify",
                                "/api/auth/email/**",
                                "/api/auth/mfa/verify",
                                "/api/staff/access-requests",
                                "/api/staff/access-requests/status",
                                "/api/public/**",
                                "/actuator/health",
                                "/actuator/info",
                                "/v3/api-docs/**",
                                "/swagger-ui/**"
                        ).permitAll()
                        // Protected Auth session endpoints
                        .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
                        // 11 Target role protected API routes
                        .requestMatchers("/api/admin/**").hasAnyRole("SYSTEM_ADMIN", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/hospital-admin/**").hasAnyRole("HOSPITAL_ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/doctor/**").hasAnyRole("DOCTOR", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/nurse/**").hasAnyRole("NURSE", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/reception/**").hasAnyRole("RECEPTIONIST", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/pharmacy/**").hasAnyRole("PHARMACIST", "DOCTOR", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/laboratory/**").hasAnyRole("LAB_TECHNICIAN", "LAB_STAFF", "DOCTOR", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/public-health/**").hasAnyRole("PUBLIC_HEALTH_OFFICER", "FIELD_SUPERVISOR", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/supervisor/**").hasAnyRole("FIELD_SUPERVISOR", "HOSPITAL_ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/coordinator/**").hasAnyRole("CLINIC_COORDINATOR", "HOSPITAL_ADMIN")
                        .requestMatchers("/api/patient/**").hasAnyRole("PATIENT", "DOCTOR", "NURSE")
                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Filter ensuring Spring Security CSRF cookie is populated for SPA / Next.js frontends.
     */
    private static class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken(); // Render token so cookie repository commits it
            }
            filterChain.doFilter(request, response);
        }
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            com.healthconnect.users.User user = userRepository.findByEmail(username.toLowerCase())
                    .or(() -> userRepository.findByPhone(username))
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + username));

            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                    .toList();

            return new org.springframework.security.core.userdetails.User(
                    user.getEmail() != null ? user.getEmail() : user.getPhone(),
                    user.getPasswordHash(),
                    user.isEnabled(),
                    true,
                    true,
                    true,
                    authorities
            );
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-XSRF-TOKEN", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
