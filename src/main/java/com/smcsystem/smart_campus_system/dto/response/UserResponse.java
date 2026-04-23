package com.smcsystem.smart_campus_system.dto.response;

import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private UserType userType;
    private AuthProvider authProvider;
    private String pictureUrl;
    private String phoneNumber;
    private String department;
    private Boolean isActive;
    private Boolean emailVerified;
    private ApprovalStatus approvalStatus;
    private Role requestedRole;
    private UserType requestedUserType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}
