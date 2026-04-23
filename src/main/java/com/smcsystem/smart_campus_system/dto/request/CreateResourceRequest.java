package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private List<AvailabilityWindowRequest> availability;

    private ResourceStatus status = ResourceStatus.ACTIVE;
}
