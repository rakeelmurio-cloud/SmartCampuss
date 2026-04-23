package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;

    private UserType userType;
}
