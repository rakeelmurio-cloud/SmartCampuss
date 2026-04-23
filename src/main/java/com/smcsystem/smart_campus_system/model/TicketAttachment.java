package com.smcsystem.smart_campus_system.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {
    private String originalName;
    private String storedName;
    private String contentType;
    private LocalDateTime uploadedAt;
}
