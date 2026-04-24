package com.smcsystem.smart_campus_system.controller;

import com.smcsystem.smart_campus_system.dto.request.AssignTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.CommentRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.RejectTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.ResolveTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateTicketStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.TicketCommentResponse;
import com.smcsystem.smart_campus_system.dto.response.TicketResponse;
import com.smcsystem.smart_campus_system.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(@Valid @ModelAttribute CreateTicketRequest request) {
        TicketResponse response = ticketService.createTicket(request, request.getAttachments());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // @GetMapping("/my")
    // public ResponseEntity<List<TicketResponse>> getMyTickets() {
    //     return ResponseEntity.ok(ticketService.getMyTickets());
    // }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets() {
        return ResponseEntity.ok(ticketService.getAssignedTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam Optional<String> status,
            @RequestParam Optional<String> priority,
            @RequestParam Optional<String> category
    ) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority, category));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody AssignTicketRequest request
    ) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketStatusRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            @PathVariable String id,
            @Valid @RequestBody ResolveTicketRequest request
    ) {
        return ResponseEntity.ok(ticketService.resolveTicket(id, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<TicketResponse> rejectTicket(
            @PathVariable String id,
            @Valid @RequestBody RejectTicketRequest request
    ) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request
    ) {
        return new ResponseEntity<>(ticketService.addComment(id, request), HttpStatus.CREATED);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, request));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId
    ) {
        ticketService.deleteComment(ticketId, commentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ticketId}/attachments/{fileName}")
    public ResponseEntity<Resource> getAttachment(
            @PathVariable String ticketId,
            @PathVariable String fileName
    ) {
        TicketResponse ticket = ticketService.getTicketById(ticketId);

        boolean exists = ticket.getAttachments().stream()
                .anyMatch(att -> att.getStoredName().equals(fileName));

        if (!exists) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = ticketService.loadAttachmentAsResource(fileName);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
