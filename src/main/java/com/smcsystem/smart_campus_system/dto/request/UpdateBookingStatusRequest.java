package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String reason;
}
