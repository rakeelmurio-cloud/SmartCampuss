package com.smcsystem.smart_campus_system.controller;

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
import com.smcsystem.smart_campus_system.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        AuthResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/request-access")
    public ResponseEntity<AuthResponse> submitAccessRequest(@Valid @RequestBody SubmitAccessRequestRequest request) {
        AuthResponse response = authService.submitAccessRequest(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/profile")
    public ResponseEntity<AuthResponse> updateCurrentUserProfile(@RequestBody UpdateProfileRequest request) {
        AuthResponse response = authService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> response = authService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createManagedUser(@Valid @RequestBody CreateManagedUserRequest request) {
        UserResponse response = authService.createManagedUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        UserResponse response = authService.updateUserRole(userId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/users/{userId}/approval")
    public ResponseEntity<UserResponse> updateApprovalStatus(
            @PathVariable String userId,
            @Valid @RequestBody UpdateApprovalStatusRequest request
    ) {
        UserResponse response = authService.updateApprovalStatus(userId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UserResponse response = authService.updateUserStatus(userId, request);
        return ResponseEntity.ok(response);
    }
}
