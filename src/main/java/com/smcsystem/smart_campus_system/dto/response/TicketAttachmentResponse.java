package com.smcsystem.smart_campus_system.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketAttachmentResponse {
    private String originalName;
    private String storedName;
    private String contentType;
    private LocalDateTime uploadedAt;
}
