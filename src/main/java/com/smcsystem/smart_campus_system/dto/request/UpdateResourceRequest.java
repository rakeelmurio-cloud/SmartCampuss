package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class UpdateResourceRequest {
    private String name;
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    private String location;
    private String description;
    private List<AvailabilityWindowRequest> availability;
    private ResourceStatus status;
}
