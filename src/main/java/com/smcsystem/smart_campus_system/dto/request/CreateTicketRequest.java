package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.TicketCategory;
import com.smcsystem.smart_campus_system.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class CreateTicketRequest {

    @NotBlank(message = "Resource or location is required")
    private String resource;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Preferred contact is required")
    private String preferredContact;

    private List<MultipartFile> attachments;
}
