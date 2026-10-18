package com.healthconnect.security;

import com.healthconnect.users.User;
import com.healthconnect.users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@SuppressWarnings("null")
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userId = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            if (jwtService.isTokenValid(jwt)) {
                userId = jwtService.extractUserId(jwt);
            }
        } else if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if ("hc_session".equals(c.getName()) || "hc_token".equals(c.getName())) {
                    if (jwtService.isTokenValid(c.getValue())) {
                        jwt = c.getValue();
                        userId = jwtService.extractUserId(jwt);
                        break;
                    }
                }
            }
        }

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            java.util.Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (!user.isEnabled()) {
                    // Suspended or disabled accounts cannot access protected resources
                    filterChain.doFilter(request, response);
                    return;
                }

                // Reliable server-side session invalidation: enforce token versioning and session validity
                if (!jwtService.isSessionValid(jwt, user)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // Server-side active roles prevent role escalation from outdated tokens
                List<SimpleGrantedAuthority> authorities = user.getRoles() == null ? List.of() :
                        user.getRoles().stream()
                                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                                .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
