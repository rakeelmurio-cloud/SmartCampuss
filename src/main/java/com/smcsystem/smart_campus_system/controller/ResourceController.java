package com.smcsystem.smart_campus_system.controller;

import com.smcsystem.smart_campus_system.dto.request.CreateResourceRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateResourceRequest;
import com.smcsystem.smart_campus_system.dto.response.ResourceResponse;
import com.smcsystem.smart_campus_system.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody CreateResourceRequest request) {
        return new ResponseEntity<>(resourceService.create(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateResourceRequest request
    ) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAll(
            @RequestParam Optional<String> type,
            @RequestParam Optional<String> location,
            @RequestParam Optional<Integer> minCapacity,
            @RequestParam Optional<String> status
    ) {
        return ResponseEntity.ok(resourceService.getAll(type, location, minCapacity, status));
    }
}
