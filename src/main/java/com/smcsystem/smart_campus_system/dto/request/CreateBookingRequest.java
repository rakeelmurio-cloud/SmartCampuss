package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateBookingRequest {

    @NotBlank(message = "Resource id is required")
    private String resourceId;

    @NotNull(message = "Start date/time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startDateTime;

    @NotNull(message = "End date/time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endDateTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private Integer expectedAttendees;
}
