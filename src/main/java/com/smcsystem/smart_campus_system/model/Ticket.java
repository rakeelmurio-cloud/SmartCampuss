package com.smcsystem.smart_campus_system.model;

import com.smcsystem.smart_campus_system.enums.TicketCategory;
import com.smcsystem.smart_campus_system.enums.TicketPriority;
import com.smcsystem.smart_campus_system.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
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
    @Builder.Default
    private List<TicketAttachment> attachments = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
