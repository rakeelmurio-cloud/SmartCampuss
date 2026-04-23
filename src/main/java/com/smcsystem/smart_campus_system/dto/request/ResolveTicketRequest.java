package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolveTicketRequest {

    @NotBlank(message = "Resolution notes are required")
    private String resolutionNotes;
}
