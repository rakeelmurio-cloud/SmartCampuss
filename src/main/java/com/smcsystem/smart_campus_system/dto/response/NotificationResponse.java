package com.smcsystem.smart_campus_system.dto.response;

import com.smcsystem.smart_campus_system.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    private boolean read;
    private LocalDateTime createdAt;
}
