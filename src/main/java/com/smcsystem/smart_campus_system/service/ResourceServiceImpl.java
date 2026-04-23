package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.AvailabilityWindowRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateResourceRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateResourceRequest;
import com.smcsystem.smart_campus_system.dto.response.AvailabilityWindowResponse;
import com.smcsystem.smart_campus_system.dto.response.ResourceResponse;
import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.model.AvailabilityWindow;
import com.smcsystem.smart_campus_system.model.Resource;
import com.smcsystem.smart_campus_system.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public ResourceResponse create(CreateResourceRequest request) {
        validateAvailability(request.getAvailability());

        Resource resource = Resource.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation().trim())
                .description(request.getDescription())
                .availability(mapAvailability(request.getAvailability()))
                .status(Optional.ofNullable(request.getStatus()).orElse(ResourceStatus.ACTIVE))
                .build();

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse update(String id, UpdateResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (request.getName() != null) {
            resource.setName(request.getName().trim());
        }

        if (request.getType() != null) {
            resource.setType(request.getType());
        }

        if (request.getCapacity() != null) {
            resource.setCapacity(request.getCapacity());
        }

        if (request.getLocation() != null) {
            resource.setLocation(request.getLocation().trim());
        }

        if (request.getDescription() != null) {
            resource.setDescription(request.getDescription());
        }

        if (request.getAvailability() != null) {
            validateAvailability(request.getAvailability());
            resource.setAvailability(mapAvailability(request.getAvailability()));
        }

        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse getById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        return mapToResponse(resource);
    }

    @Override
    public List<ResourceResponse> getAll(Optional<String> type, Optional<String> location, Optional<Integer> minCapacity, Optional<String> status) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(res -> type
                        .map(val -> res.getType() == parseResourceType(val))
                        .orElse(true))
                .filter(res -> status
                        .map(val -> res.getStatus() == parseResourceStatus(val))
                        .orElse(true))
                .filter(res -> minCapacity
                        .map(min -> res.getCapacity() != null && res.getCapacity() >= min)
                        .orElse(true))
                .filter(res -> location
                        .map(loc -> res.getLocation() != null
                                && res.getLocation().toLowerCase(Locale.ROOT).contains(loc.toLowerCase(Locale.ROOT)))
                        .orElse(true))
                .sorted(Comparator.comparing(Resource::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::mapToResponse)
                .toList();
    }

    private List<AvailabilityWindow> mapAvailability(List<AvailabilityWindowRequest> availabilityRequests) {
        if (availabilityRequests == null) {
            return List.of();
        }

        return availabilityRequests.stream()
                .map(req -> AvailabilityWindow.builder()
                        .dayOfWeek(req.getDayOfWeek())
                        .startTime(req.getStartTime())
                        .endTime(req.getEndTime())
                        .build())
                .collect(Collectors.toList());
    }

    private void validateAvailability(List<AvailabilityWindowRequest> availability) {
        if (availability == null) {
            return;
        }

        availability.forEach(window -> {
            if (window.getEndTime() != null && window.getStartTime() != null
                    && window.getEndTime().isBefore(window.getStartTime())) {
                throw new BadRequestException("Availability end time cannot be before start time");
            }
        });
    }

    private ResourceType parseResourceType(String value) {
        try {
            return ResourceType.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid resource type: " + value);
        }
    }

    private ResourceStatus parseResourceStatus(String value) {
        try {
            return ResourceStatus.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid resource status: " + value);
        }
    }

    private ResourceResponse mapToResponse(Resource resource) {
        List<AvailabilityWindowResponse> availability = resource.getAvailability() == null
                ? List.of()
                : resource.getAvailability().stream()
                .sorted(Comparator.comparing(AvailabilityWindow::getDayOfWeek))
                .map(win -> AvailabilityWindowResponse.builder()
                        .dayOfWeek(win.getDayOfWeek())
                        .startTime(win.getStartTime())
                        .endTime(win.getEndTime())
                        .build())
                .toList();

        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .description(resource.getDescription())
                .availability(availability)
                .status(resource.getStatus())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
