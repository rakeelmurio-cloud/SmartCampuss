package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;
}
