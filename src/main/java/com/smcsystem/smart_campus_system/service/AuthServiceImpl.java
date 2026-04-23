package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.CreateManagedUserRequest;
import com.smcsystem.smart_campus_system.dto.request.LoginRequest;
import com.smcsystem.smart_campus_system.dto.request.RegisterRequest;
import com.smcsystem.smart_campus_system.dto.request.SubmitAccessRequestRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateApprovalStatusRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateProfileRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateUserRoleRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateUserStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.AuthResponse;
import com.smcsystem.smart_campus_system.dto.response.UserResponse;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.RegistrationType;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import com.smcsystem.smart_campus_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (request.getRegistrationType() == RegistrationType.NORMAL_USER) {
            throw new BadRequestException("Normal user registration is not available here. Use Google sign-in for common access");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        UserType userType = mapRegistrationTypeToUserType(request.getRegistrationType());
        ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .userType(userType)
                .authProvider(AuthProvider.LOCAL)
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(approvalStatus)
                .build();

        User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (DuplicateKeyException ex) {
            throw new BadRequestException("Email is already registered");
        }

        return buildAuthResponse(savedUser, approvalStatus == ApprovalStatus.APPROVED);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account is inactive");
        }

        if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
            throw new UnauthorizedException("Your account is waiting for admin approval");
        }

        if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
            throw new UnauthorizedException("Your account request was rejected");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(java.time.LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        return buildAuthResponse(updatedUser, true);
    }

    @Override
    public AuthResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return buildAuthResponse(user, false);
    }

    @Override
    public AuthResponse submitAccessRequest(SubmitAccessRequestRequest request) {
        User user = getAuthenticatedUser();

        if (user.getRole() != Role.USER) {
            throw new BadRequestException("Only user accounts can submit access requests");
        }

        if (request.getRequestedRole() != null) {
            throw new BadRequestException("Role requests are not available from profile updates");
        }

        if (request.getRequestedUserType() == null) {
            throw new BadRequestException("Select STUDENT or LECTURER to submit a user type request");
        }

        if (request.getRequestedUserType() != UserType.STUDENT
                && request.getRequestedUserType() != UserType.LECTURER) {
            throw new BadRequestException("User type request must be STUDENT or LECTURER");
        }

        if (request.getRequestedUserType() == user.getUserType()
                && user.getApprovalStatus() == ApprovalStatus.APPROVED) {
            throw new BadRequestException("You already have this approved user type");
        }

        user.setRequestedUserType(request.getRequestedUserType());
        user.setRequestedRole(null);

        User updatedUser = userRepository.save(user);
        return buildAuthResponse(updatedUser, false);
    }

    @Override
    public AuthResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }

        if (request.getRequestedUserType() != null) {
            if (user.getRole() != Role.USER) {
                throw new BadRequestException("Only user accounts can request student or lecturer access");
            }

            if (request.getRequestedUserType() != UserType.STUDENT
                    && request.getRequestedUserType() != UserType.LECTURER) {
                throw new BadRequestException("Requested user type must be STUDENT or LECTURER");
            }

            if (request.getRequestedUserType() == user.getUserType()
                    && user.getApprovalStatus() == ApprovalStatus.APPROVED) {
                throw new BadRequestException("You already have this approved user type");
            }

            user.setRequestedUserType(request.getRequestedUserType());
            user.setRequestedRole(null);
        }

        User updatedUser = userRepository.save(user);
        return buildAuthResponse(updatedUser, false);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public UserResponse createManagedUser(CreateManagedUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        if (request.getRole() != Role.ADMIN && request.getRole() != Role.TECHNICIAN) {
            throw new BadRequestException("Admins can only create ADMIN or TECHNICIAN accounts directly");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .userType(resolveManagedUserType(request.getRole(), request.getUserType()))
                .authProvider(AuthProvider.LOCAL)
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        return mapToUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateUserRole(String userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getRole() != Role.USER) {
            throw new BadRequestException("Use managed account creation for ADMIN and TECHNICIAN accounts");
        }

        user.setRole(request.getRole());

        if (request.getUserType() == null) {
            throw new BadRequestException("User type is required when approving a USER account");
        }

        if (request.getUserType() != UserType.STUDENT && request.getUserType() != UserType.LECTURER) {
            throw new BadRequestException("User type must be STUDENT or LECTURER when role is USER");
        }

        user.setUserType(request.getUserType());

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setRequestedRole(null);
        user.setRequestedUserType(null);

        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse updateApprovalStatus(String userId, UpdateApprovalStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setApprovalStatus(request.getApprovalStatus());

        if (request.getApprovalStatus() == ApprovalStatus.REJECTED) {
            user.setRequestedRole(null);
            user.setRequestedUserType(null);
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse updateUserStatus(String userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(request.getIsActive());
        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .userType(user.getUserType())
                .authProvider(user.getAuthProvider())
                .pictureUrl(user.getPictureUrl())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .approvalStatus(user.getApprovalStatus())
                .requestedRole(user.getRequestedRole())
                .requestedUserType(user.getRequestedUserType())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AuthResponse buildAuthResponse(User user, boolean includeToken) {
        String token = includeToken
                ? jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name())
                : null;

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .userType(user.getUserType())
                .authProvider(user.getAuthProvider())
                .pictureUrl(user.getPictureUrl())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .profileCompleted(user.getRole() != Role.USER || user.getUserType() != null)
                .approvalStatus(user.getApprovalStatus())
                .requestedRole(user.getRequestedRole())
                .requestedUserType(user.getRequestedUserType())
                .build();
    }

    private UserType mapRegistrationTypeToUserType(RegistrationType registrationType) {
        return switch (registrationType) {
            case NORMAL_USER -> null;
            case STUDENT -> UserType.STUDENT;
            case LECTURER -> UserType.LECTURER;
        };
    }

    private UserType resolveManagedUserType(Role role, UserType userType) {
        if (role == Role.ADMIN || role == Role.TECHNICIAN) {
            return null;
        }

        if (userType == null) {
            throw new BadRequestException("User type is required when creating a USER account");
        }

        return userType;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return user;
    }
}
