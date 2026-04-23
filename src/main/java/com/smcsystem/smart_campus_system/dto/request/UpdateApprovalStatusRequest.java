package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateApprovalStatusRequest {

    @NotNull(message = "Approval status is required")
    private ApprovalStatus approvalStatus;
}
