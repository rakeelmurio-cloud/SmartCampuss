package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignTicketRequest {

    @NotBlank(message = "Technician id is required")
    private String technicianId;
}
