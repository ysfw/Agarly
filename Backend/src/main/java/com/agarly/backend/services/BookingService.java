package com.agarly.backend.services;

import com.agarly.backend.dtos.CreateBookingRequest;
import com.agarly.backend.dtos.UpdateBookingRequest;
import com.agarly.backend.models.Booking;
import com.agarly.backend.models.Enums.BookingStatus;
import com.agarly.backend.models.Item;
import com.agarly.backend.models.SSE;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.BookingRepository;
import com.agarly.backend.repos.ItemRepository;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private EventService eventService;

    public Booking createBooking(Long borrowerId, CreateBookingRequest request) {
        // Validates availability and creates booking
        if (request.getItemId() == null) {
            throw new IllegalArgumentException("itemId is required");
        }
        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("Invalid dates: endDate must be after startDate");
        }

        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new IllegalArgumentException("Borrower not found"));
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        List<Booking> existing = bookingRepository.findAll();
        boolean overlaps = existing.stream().anyMatch(b ->
                b.getItem().getId().equals(item.getId()) &&
                        (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.ACTIVE) &&
                        datesOverlap(start, end, b.getStartDate(), b.getEndDate())
        );

        if (overlaps) {
            throw new IllegalStateException("Item not available for the selected dates");
        }

        Booking booking = new Booking();
        booking.setBorrower(borrower);
        booking.setItem(item);
        booking.setStartDate(start);
        booking.setEndDate(end);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    private boolean datesOverlap(LocalDate s1, LocalDate e1, LocalDate s2, LocalDate e2) {
        return !e1.isBefore(s2) && !e2.isBefore(s1);
    }

    public Booking updateStatus(Long id, UpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        BookingStatus target = request.getStatus();
        if (target == null) {
            throw new IllegalArgumentException("status is required");
        }

        BookingStatus currentStatus = booking.getStatus();

        if (currentStatus == BookingStatus.PENDING && target == BookingStatus.APPROVED) {
            booking.getItem().setBorrower(booking.getBorrower());
            itemRepository.save(booking.getItem());
        }

        if (currentStatus == BookingStatus.APPROVED && target == BookingStatus.COMPLETED) {
            booking.getItem().setBorrower(null);
            itemRepository.save(booking.getItem());
            SSE reviewEvent = new SSE("REVIEW_REQUEST", List.of(booking.getBorrower().getUsername()));
            eventService.publishEvent(reviewEvent);
        }

        booking.setStatus(target);
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllRequests(Long userId) {
        return bookingRepository.findByItem_OwnerId(userId);
    }

    public List<Booking> getSentRequests(Long userId) {
        return bookingRepository.findByBorrowerId(userId);
    }
}
