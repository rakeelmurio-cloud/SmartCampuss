package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.CreateResourceRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateResourceRequest;
import com.smcsystem.smart_campus_system.dto.response.ResourceResponse;

import java.util.List;
import java.util.Optional;

public interface ResourceService {
    ResourceResponse create(CreateResourceRequest request);
    ResourceResponse update(String id, UpdateResourceRequest request);
    ResourceResponse getById(String id);
    List<ResourceResponse> getAll(Optional<String> type, Optional<String> location, Optional<Integer> minCapacity, Optional<String> status);
}
