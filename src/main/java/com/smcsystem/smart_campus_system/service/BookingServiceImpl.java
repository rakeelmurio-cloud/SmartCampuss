package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.CancelBookingRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateBookingRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateBookingStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.BookingResponse;
import com.smcsystem.smart_campus_system.enums.BookingStatus;
import com.smcsystem.smart_campus_system.enums.NotificationType;
import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.Booking;
import com.smcsystem.smart_campus_system.model.Resource;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.BookingRepository;
import com.smcsystem.smart_campus_system.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter SHORT_FORMAT = DateTimeFormatter.ofPattern("MMM d, HH:mm");

    @Override
    public BookingResponse create(CreateBookingRequest request) {
        User currentUser = getAuthenticatedUser();

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new BadRequestException("This resource is currently out of service");
        }

        if (request.getEndDateTime().isBefore(request.getStartDateTime())) {
            throw new BadRequestException("End time cannot be before start time");
        }

        ensureNoConflicts(request.getResourceId(), request.getStartDateTime(), request.getEndDateTime(), List.of(BookingStatus.PENDING, BookingStatus.APPROVED));

        Booking booking = Booking.builder()
                .resourceId(resource.getId())
                .userId(currentUser.getId())
                .purpose(request.getPurpose().trim())
                .expectedAttendees(request.getExpectedAttendees())
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved, resource);
    }

    @Override
    public BookingResponse getById(String id) {
        User currentUser = getAuthenticatedUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        ensureCanView(currentUser, booking);

        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        return mapToResponse(booking, resource);
    }

    @Override
    public List<BookingResponse> getMyBookings() {
        User currentUser = getAuthenticatedUser();
        List<Booking> bookings = bookingRepository.findByUserId(currentUser.getId());
        Map<String, Resource> resources = loadResourcesFor(bookings);

        return bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .map(booking -> mapToResponse(booking, resources.get(booking.getResourceId())))
                .toList();
    }

    @Override
    public List<BookingResponse> getAll(Optional<String> status, Optional<String> resourceId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can view all bookings");
        }

        List<Booking> bookings = bookingRepository.findAll();
        Map<String, Resource> resources = loadResourcesFor(bookings);

        return bookings.stream()
                .filter(b -> status
                        .map(val -> b.getStatus() == parseStatus(val))
                        .orElse(true))
                .filter(b -> resourceId
                        .map(val -> b.getResourceId().equals(val))
                        .orElse(true))
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .map(booking -> mapToResponse(booking, resources.get(booking.getResourceId())))
                .toList();
    }

    @Override
    public BookingResponse updateStatus(String id, UpdateBookingStatusRequest request) {
        User currentUser = getAuthenticatedUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can approve or reject bookings");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved or rejected");
        }

        if (request.getStatus() == BookingStatus.APPROVED) {
            ensureNoConflicts(booking.getResourceId(), booking.getStartDateTime(), booking.getEndDateTime(), List.of(BookingStatus.APPROVED));
            booking.setStatus(BookingStatus.APPROVED);
            booking.setRejectionReason(null);
            notifyBookingUser(booking, "Booking approved",
                    "Your booking from %s to %s was approved.".formatted(
                            booking.getStartDateTime().format(SHORT_FORMAT),
                            booking.getEndDateTime().format(SHORT_FORMAT)
                    ));
        } else if (request.getStatus() == BookingStatus.REJECTED) {
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(Optional.ofNullable(request.getReason()).map(String::trim).orElse("Not specified"));
            notifyBookingUser(booking, "Booking rejected",
                    "Your booking from %s to %s was rejected. Reason: %s".formatted(
                            booking.getStartDateTime().format(SHORT_FORMAT),
                            booking.getEndDateTime().format(SHORT_FORMAT),
                            booking.getRejectionReason()
                    ));
        } else {
            throw new BadRequestException("Status must be APPROVED or REJECTED");
        }

        Booking saved = bookingRepository.save(booking);
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        return mapToResponse(saved, resource);
    }

    @Override
    public BookingResponse cancel(String id, CancelBookingRequest request) {
        User currentUser = getAuthenticatedUser();

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isOwner = booking.getUserId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Rejected bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(Optional.ofNullable(request.getReason()).map(String::trim).orElse("Cancelled by user"));

        Booking saved = bookingRepository.save(booking);

        notifyBookingUser(saved, "Booking cancelled",
                "Your booking from %s to %s was cancelled.".formatted(
                        booking.getStartDateTime().format(SHORT_FORMAT),
                        booking.getEndDateTime().format(SHORT_FORMAT)
                ));

        Resource resource = resourceRepository.findById(saved.getResourceId()).orElse(null);
        return mapToResponse(saved, resource);
    }

    private void ensureNoConflicts(String resourceId, LocalDateTime start, LocalDateTime end, List<BookingStatus> statuses) {
        List<Booking> conflicts = bookingRepository
                .findByResourceIdAndStatusInAndEndDateTimeAfterAndStartDateTimeBefore(
                        resourceId,
                        statuses,
                        start,
                        end
                );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This resource already has a booking in the selected time range");
        }
    }

    private BookingResponse mapToResponse(Booking booking, Resource resource) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .resourceName(resource != null ? resource.getName() : null)
                .resourceLocation(resource != null ? resource.getLocation() : null)
                .userId(booking.getUserId())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .startDateTime(booking.getStartDateTime())
                .endDateTime(booking.getEndDateTime())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private Map<String, Resource> loadResourcesFor(List<Booking> bookings) {
        List<String> resourceIds = bookings.stream()
                .map(Booking::getResourceId)
                .distinct()
                .toList();

        return resourceRepository.findAllById(resourceIds).stream()
                .collect(Collectors.toMap(Resource::getId, Function.identity()));
    }

    private BookingStatus parseStatus(String value) {
        try {
            return BookingStatus.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid booking status: " + value);
        }
    }

    private void ensureCanView(User user, Booking booking) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (booking.getUserId().equals(user.getId())) {
            return;
        }

        throw new UnauthorizedException("You are not allowed to view this booking");
    }

    private void notifyBookingUser(Booking booking, String title, String message) {
        notificationService.send(
                booking.getUserId(),
                title,
                message,
                NotificationType.BOOKING,
                booking.getId()
        );
    }

    private User getAuthenticatedUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return user;
    }
}
