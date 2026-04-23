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

import java.util.List;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse getCurrentUser();

    AuthResponse submitAccessRequest(SubmitAccessRequestRequest request);

    AuthResponse updateCurrentUserProfile(UpdateProfileRequest request);

    List<UserResponse> getAllUsers();

    UserResponse createManagedUser(CreateManagedUserRequest request);

    UserResponse updateUserRole(String userId, UpdateUserRoleRequest request);

    UserResponse updateApprovalStatus(String userId, UpdateApprovalStatusRequest request);

    UserResponse updateUserStatus(String userId, UpdateUserStatusRequest request);
}
