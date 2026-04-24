package com.smcsystem.smart_campus_system.controller;

import com.smcsystem.smart_campus_system.dto.request.CancelBookingRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateBookingRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateBookingStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.BookingResponse;
import com.smcsystem.smart_campus_system.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

//create booking
    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody CreateBookingRequest request) {
        return new ResponseEntity<>(bookingService.create(request), HttpStatus.CREATED);
    }
//get my bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }
//get all bookings (admin only)
    @PreAuthorize("hasAuthority('ADMIN')")
//get all bookings with optional filters for status and resource id
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAll(
            @RequestParam Optional<String> status,
            @RequestParam Optional<String> resourceId
    ) {
        return ResponseEntity.ok(bookingService.getAll(status, resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }
//update booking status (admin only)
    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{id}/status")
//update booking status with optional reason for rejection or cancellation    
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateBookingStatusRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateStatus(id, request));
    }
//cancel booking (user can cancel their own booking, admin can cancel any booking)
    @PatchMapping("/{id}/cancel")
    // public ResponseEntity<BookingResponse> cancel(
    //         @PathVariable String id,
    //         @RequestBody CancelBookingRequest request
    // ) {
    //     return ResponseEntity.ok(bookingService.cancel(id, request));
    // }
}
