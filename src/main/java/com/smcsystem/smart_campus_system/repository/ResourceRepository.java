package com.smcsystem.smart_campus_system.repository;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import com.smcsystem.smart_campus_system.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
}
