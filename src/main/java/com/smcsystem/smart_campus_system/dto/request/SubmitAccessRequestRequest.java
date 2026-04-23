package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import lombok.Data;

@Data
public class SubmitAccessRequestRequest {

    private Role requestedRole;

    private UserType requestedUserType;
}
