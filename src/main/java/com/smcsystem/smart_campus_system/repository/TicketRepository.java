package com.smcsystem.smart_campus_system.repository;

import com.smcsystem.smart_campus_system.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByCreatedBy(String createdBy);

    List<Ticket> findByAssignedTechnicianId(String technicianId);
}
