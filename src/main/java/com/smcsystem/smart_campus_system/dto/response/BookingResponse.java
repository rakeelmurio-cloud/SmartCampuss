package com.smcsystem.smart_campus_system.dto.response;

import com.smcsystem.smart_campus_system.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceLocation;
    private String userId;
    private String purpose;
    private Integer expectedAttendees;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BookingStatus status;
    private String rejectionReason;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
