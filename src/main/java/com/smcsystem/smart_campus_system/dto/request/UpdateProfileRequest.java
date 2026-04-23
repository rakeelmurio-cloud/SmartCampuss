package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.UserType;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String name;

    private String phoneNumber;

    private String department;

    private UserType requestedUserType;
}
