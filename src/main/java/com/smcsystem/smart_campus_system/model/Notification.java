package com.smcsystem.smart_campus_system.model;

import com.smcsystem.smart_campus_system.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    @Builder.Default
    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
