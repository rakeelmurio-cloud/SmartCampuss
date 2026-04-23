package com.smcsystem.smart_campus_system.repository;

import com.smcsystem.smart_campus_system.enums.BookingStatus;
import com.smcsystem.smart_campus_system.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByResourceIdAndStatusInAndEndDateTimeAfterAndStartDateTimeBefore(
            String resourceId,
            List<BookingStatus> statuses,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );
}
