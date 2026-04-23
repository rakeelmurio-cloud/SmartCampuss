package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.CancelBookingRequest;
import com.smcsystem.smart_campus_system.dto.request.CreateBookingRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateBookingStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.BookingResponse;

import java.util.List;
import java.util.Optional;

public interface BookingService {
    BookingResponse create(CreateBookingRequest request);
    BookingResponse getById(String id);
    List<BookingResponse> getMyBookings();
    List<BookingResponse> getAll(Optional<String> status, Optional<String> resourceId);
    BookingResponse updateStatus(String id, UpdateBookingStatusRequest request);
    BookingResponse cancel(String id, CancelBookingRequest request);
}
