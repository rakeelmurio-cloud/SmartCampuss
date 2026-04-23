package com.smcsystem.smart_campus_system.model;

import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

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

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;
}
