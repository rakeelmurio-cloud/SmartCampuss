package com.smcsystem.smart_campus_system.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketCommentResponse {
    private String id;
    private String ticketId;
    private String userId;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
