package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.AssignTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.CommentRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.RejectTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.ResolveTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateTicketStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.TicketAttachmentResponse;
import com.smcsystem.smart_campus_system.dto.response.TicketCommentResponse;
import com.smcsystem.smart_campus_system.dto.response.TicketResponse;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.NotificationType;
import com.smcsystem.smart_campus_system.enums.TicketStatus;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.Ticket;
import com.smcsystem.smart_campus_system.model.TicketAttachment;
import com.smcsystem.smart_campus_system.model.TicketComment;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.TicketCommentRepository;
import com.smcsystem.smart_campus_system.repository.TicketRepository;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import com.smcsystem.smart_campus_system.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads/tickets}")
    private String uploadDir;

    @Override
    public TicketResponse createTicket(CreateTicketRequest request, List<MultipartFile> attachments) {
        User currentUser = getAuthenticatedUser();

        List<TicketAttachment> savedAttachments = saveAttachments(attachments);

        Ticket ticket = Ticket.builder()
                .resource(request.getResource().trim())
                .category(request.getCategory())
                .description(request.getDescription().trim())
                .priority(request.getPriority())
                .preferredContact(request.getPreferredContact().trim())
                .status(TicketStatus.OPEN)
                .createdBy(currentUser.getId())
                .attachments(savedAttachments)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToTicketResponse(savedTicket, false);
    }

    @Override
    public List<TicketResponse> getMyTickets() {
        User currentUser = getAuthenticatedUser();
        return ticketRepository.findByCreatedBy(currentUser.getId())
                .stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .map(ticket -> mapToTicketResponse(ticket, false))
                .toList();
    }

    @Override
    public List<TicketResponse> getAssignedTickets() {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.TECHNICIAN) {
            throw new UnauthorizedException("Only technicians can view assigned tickets");
        }

        return ticketRepository.findByAssignedTechnicianId(currentUser.getId())
                .stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .map(ticket -> mapToTicketResponse(ticket, false))
                .toList();
    }

    @Override
    public TicketResponse getTicketById(String id) {
        User currentUser = getAuthenticatedUser();
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ensureCanView(currentUser, ticket);

        return mapToTicketResponse(ticket, true);
    }

    @Override
    public List<TicketResponse> getAllTickets(Optional<String> status, Optional<String> priority, Optional<String> category) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can view all tickets");
        }

        return ticketRepository.findAll()
                .stream()
                .filter(ticket -> status.map(s -> ticket.getStatus().name().equalsIgnoreCase(s)).orElse(true))
                .filter(ticket -> priority.map(p -> ticket.getPriority().name().equalsIgnoreCase(p)).orElse(true))
                .filter(ticket -> category.map(c -> ticket.getCategory().name().equalsIgnoreCase(c)).orElse(true))
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .map(ticket -> mapToTicketResponse(ticket, false))
                .toList();
    }

    @Override
    public TicketResponse assignTechnician(String id, AssignTicketRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can assign technicians");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Cannot assign a closed or rejected ticket");
        }

        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new BadRequestException("Selected user is not a technician");
        }

        ticket.setAssignedTechnicianId(technician.getId());
        Ticket updated = ticketRepository.save(ticket);

        notifyTicketUpdate(updated,
                "Ticket assigned",
                "You have been assigned ticket " + updated.getId(),
                technician.getId());

        notifyTicketUpdate(updated,
                "Technician assigned",
                "A technician was assigned to your ticket " + updated.getId(),
                updated.getCreatedBy());

        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketResponse updateStatus(String id, UpdateTicketStatusRequest request) {
        User currentUser = getAuthenticatedUser();
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!canModifyStatus(currentUser, ticket)) {
            throw new UnauthorizedException("Not allowed to update this ticket status");
        }

        TicketStatus newStatus = request.getStatus();
        if (newStatus == TicketStatus.REJECTED) {
            throw new BadRequestException("Use reject endpoint for rejections");
        }

        if (!isTransitionAllowed(ticket.getStatus(), newStatus)) {
            throw new BadRequestException("Invalid status transition");
        }

        ticket.setStatus(newStatus);
        Ticket updated = ticketRepository.save(ticket);

        notifyTicketUpdate(updated,
                "Ticket status updated",
                "Status changed to " + newStatus.name() + " for ticket " + updated.getId(),
                updated.getCreatedBy());

        if (updated.getAssignedTechnicianId() != null) {
            notifyTicketUpdate(updated,
                    "Ticket status updated",
                    "Status changed to " + newStatus.name() + " for ticket " + updated.getId(),
                    updated.getAssignedTechnicianId());
        }

        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketResponse resolveTicket(String id, ResolveTicketRequest request) {
        User currentUser = getAuthenticatedUser();
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!canModifyStatus(currentUser, ticket)) {
            throw new UnauthorizedException("Not allowed to resolve this ticket");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Cannot resolve a closed or rejected ticket");
        }

        ticket.setResolutionNotes(request.getResolutionNotes().trim());
        ticket.setStatus(TicketStatus.RESOLVED);
        Ticket updated = ticketRepository.save(ticket);

        notifyTicketUpdate(updated,
                "Ticket resolved",
                "Ticket " + updated.getId() + " was marked resolved.",
                updated.getCreatedBy());

        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketResponse rejectTicket(String id, RejectTicketRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can reject tickets");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Ticket is already closed or rejected");
        }

        ticket.setRejectionReason(request.getRejectionReason().trim());
        ticket.setStatus(TicketStatus.REJECTED);
        Ticket updated = ticketRepository.save(ticket);

        notifyTicketUpdate(updated,
                "Ticket rejected",
                "Ticket " + updated.getId() + " was rejected. Reason: " + updated.getRejectionReason(),
                updated.getCreatedBy());

        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketCommentResponse addComment(String ticketId, CommentRequest request) {
        User currentUser = getAuthenticatedUser();
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        ensureCanView(currentUser, ticket);

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(currentUser.getId())
                .comment(request.getComment().trim())
                .build();

        TicketComment saved = ticketCommentRepository.save(comment);

        if (!ticket.getCreatedBy().equals(currentUser.getId())) {
            notifyTicketUpdate(ticket,
                    "New comment on ticket",
                    "Someone commented on ticket " + ticket.getId(),
                    ticket.getCreatedBy(),
                    NotificationType.COMMENT);
        }

        if (ticket.getAssignedTechnicianId() != null
                && !ticket.getAssignedTechnicianId().equals(currentUser.getId())) {
            notifyTicketUpdate(ticket,
                    "New comment on ticket",
                    "A new comment was added to ticket " + ticket.getId(),
                    ticket.getAssignedTechnicianId(),
                    NotificationType.COMMENT);
        }

        return mapToCommentResponse(saved);
    }

    @Override
    public TicketCommentResponse updateComment(String ticketId, String commentId, CommentRequest request) {
        User currentUser = getAuthenticatedUser();

        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can edit only your own comments");
        }

        comment.setComment(request.getComment().trim());
        TicketComment saved = ticketCommentRepository.save(comment);
        return mapToCommentResponse(saved);
    }

    @Override
    public void deleteComment(String ticketId, String commentId) {
        User currentUser = getAuthenticatedUser();

        TicketComment comment = ticketCommentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        boolean isOwner = comment.getUserId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("Not allowed to delete this comment");
        }

        ticketCommentRepository.delete(comment);
    }

    public Resource loadAttachmentAsResource(String storedName) {
        Path filePath = Paths.get(uploadDir).resolve(storedName).normalize();
        return new FileSystemResource(filePath);
    }

    private List<TicketAttachment> saveAttachments(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        if (files.size() > 3) {
            throw new BadRequestException("Maximum 3 images are allowed per ticket");
        }

        Path directory = Paths.get(uploadDir);
        try {
            Files.createDirectories(directory);
        } catch (IOException e) {
            throw new BadRequestException("Unable to prepare upload directory");
        }

        return files.stream().map(file -> {
            if (file.isEmpty()) {
                throw new BadRequestException("Empty file provided");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Only image files are allowed");
            }

            String originalName = StringUtils.cleanPath(Optional.ofNullable(file.getOriginalFilename()).orElse("image"));
            String extension = "";
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) {
                extension = originalName.substring(dot);
            }

            String storedName = UUID.randomUUID() + extension;
            Path target = directory.resolve(storedName);

            try {
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new BadRequestException("Failed to save attachment");
            }

            return TicketAttachment.builder()
                    .originalName(originalName)
                    .storedName(storedName)
                    .contentType(contentType)
                    .uploadedAt(LocalDateTime.now())
                    .build();
        }).collect(Collectors.toList());
    }

    private TicketResponse mapToTicketResponse(Ticket ticket, boolean includeComments) {
        List<TicketAttachmentResponse> attachmentResponses = ticket.getAttachments()
                .stream()
                .map(att -> TicketAttachmentResponse.builder()
                        .originalName(att.getOriginalName())
                        .storedName(att.getStoredName())
                        .contentType(att.getContentType())
                        .uploadedAt(att.getUploadedAt())
                        .build())
                .toList();

        List<TicketCommentResponse> commentResponses = includeComments
                ? ticketCommentRepository.findByTicketId(ticket.getId())
                .stream()
                .sorted(Comparator.comparing(TicketComment::getCreatedAt))
                .map(this::mapToCommentResponse)
                .toList()
                : List.of();

        return TicketResponse.builder()
                .id(ticket.getId())
                .resource(ticket.getResource())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .preferredContact(ticket.getPreferredContact())
                .status(ticket.getStatus())
                .createdBy(ticket.getCreatedBy())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .attachments(attachmentResponses)
                .comments(commentResponses)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private TicketCommentResponse mapToCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .userId(comment.getUserId())
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private boolean isTransitionAllowed(TicketStatus current, TicketStatus next) {
        return switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.RESOLVED || next == TicketStatus.CLOSED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.CLOSED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            default -> false;
        };
    }

    private void notifyTicketUpdate(Ticket ticket, String title, String message, String userId) {
        notifyTicketUpdate(ticket, title, message, userId, NotificationType.TICKET);
    }

    private void notifyTicketUpdate(Ticket ticket, String title, String message, String userId, NotificationType type) {
        notificationService.send(
                userId,
                title,
                message,
                type,
                ticket.getId()
        );
    }

    private boolean canModifyStatus(User user, Ticket ticket) {
        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        return user.getRole() == Role.TECHNICIAN
                && ticket.getAssignedTechnicianId() != null
                && ticket.getAssignedTechnicianId().equals(user.getId());
    }

    private void ensureCanView(User user, Ticket ticket) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (user.getRole() == Role.TECHNICIAN && user.getId().equals(ticket.getAssignedTechnicianId())) {
            return;
        }

        if (ticket.getCreatedBy().equals(user.getId())) {
            return;
        }

        throw new UnauthorizedException("You are not allowed to view this ticket");
    }

    private User getAuthenticatedUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return user;
    }
}
