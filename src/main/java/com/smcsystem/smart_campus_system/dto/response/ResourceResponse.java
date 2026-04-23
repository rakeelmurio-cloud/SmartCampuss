package com.smcsystem.smart_campus_system.dto.response;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ResourceResponse {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private List<AvailabilityWindowResponse> availability;
    private ResourceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
