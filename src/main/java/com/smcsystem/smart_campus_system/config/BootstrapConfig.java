package com.smcsystem.smart_campus_system.config;

import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class BootstrapConfig {

    private static final Logger log = LoggerFactory.getLogger(BootstrapConfig.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnProperty(prefix = "app.bootstrap", name = "enabled", havingValue = "true", matchIfMissing = true)
    public CommandLineRunner seedDefaultUsers() {
        return args -> {
            seedUser("admin@campus.local", "Admin", Role.ADMIN, null, "Admin@123");
            seedUser("tech@campus.local", "Technician", Role.TECHNICIAN, null, "Tech@123");
            seedUser("student@campus.local", "Student User", Role.USER, UserType.STUDENT, "Student@123");
        };
    }

    private void seedUser(String email, String name, Role role, UserType userType, String rawPassword) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return;
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .userType(userType)
                .authProvider(AuthProvider.LOCAL)
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        userRepository.save(user);
        log.info("Seeded default user {} with role {}", email, role);
    }
}
