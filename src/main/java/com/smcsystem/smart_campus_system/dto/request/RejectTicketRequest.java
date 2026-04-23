package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectTicketRequest {

    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;
}
