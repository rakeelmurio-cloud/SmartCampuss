package com.smcsystem.smart_campus_system.dto.response;

import com.smcsystem.smart_campus_system.enums.TicketCategory;
import com.smcsystem.smart_campus_system.enums.TicketPriority;
import com.smcsystem.smart_campus_system.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private String id;
    private String resource;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private String preferredContact;
    private TicketStatus status;
    private String createdBy;
    private String assignedTechnicianId;
    private String resolutionNotes;
    private String rejectionReason;
    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
