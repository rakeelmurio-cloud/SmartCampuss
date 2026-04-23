package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.AssignTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.CommentRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.RejectTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.ResolveTicketRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateTicketStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.TicketCommentResponse;
import com.smcsystem.smart_campus_system.dto.response.TicketResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request, List<MultipartFile> attachments);

    List<TicketResponse> getMyTickets();

    List<TicketResponse> getAssignedTickets();

    TicketResponse getTicketById(String id);

    List<TicketResponse> getAllTickets(Optional<String> status, Optional<String> priority, Optional<String> category);

    TicketResponse assignTechnician(String id, AssignTicketRequest request);

    TicketResponse updateStatus(String id, UpdateTicketStatusRequest request);

    TicketResponse resolveTicket(String id, ResolveTicketRequest request);

    TicketResponse rejectTicket(String id, RejectTicketRequest request);

    TicketCommentResponse addComment(String ticketId, CommentRequest request);

    TicketCommentResponse updateComment(String ticketId, String commentId, CommentRequest request);

    void deleteComment(String ticketId, String commentId);

    org.springframework.core.io.Resource loadAttachmentAsResource(String storedName);
}
