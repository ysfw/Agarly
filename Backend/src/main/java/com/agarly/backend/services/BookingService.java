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

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.agarly.backend.repos.TransactionRepository transactionRepository;

    public Booking createBooking(Long borrowerId, CreateBookingRequest request) {
        if (request.getItemId() == null) {
            throw new IllegalArgumentException("itemId is required");
        }

        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        LocalDate reqStart = request.getStartDate();
        LocalDate reqEnd = request.getEndDate();

        if (reqStart == null || reqEnd == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }

        if (reqEnd.isBefore(reqStart)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        if (item.getPriceUnit() == com.agarly.backend.models.Enums.PriceUnit.HOUR) {
            if (request.getStartTime() == null || request.getEndTime() == null) {
                throw new IllegalArgumentException("Start time and end time are required for hourly items");
            }

            // Construct full timestamps for overlap check
            java.time.LocalDateTime startDateTime = java.time.LocalDateTime.of(reqStart, request.getStartTime());
            java.time.LocalDateTime endDateTime = java.time.LocalDateTime.of(reqEnd, request.getEndTime());

            if (!endDateTime.isAfter(startDateTime)) {
                throw new IllegalArgumentException("End time must be after start time");
            }

            List<Booking> existing = bookingRepository.findAll();
            boolean overlaps = existing.stream().anyMatch(b -> b.getItem().getId().equals(item.getId()) &&
                    (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.ACTIVE) &&
                    hourlyOverlap(startDateTime, endDateTime, b));

            if (overlaps) {
                throw new IllegalStateException("Item not available for the selected dates/times");
            }

        } else {
            if (!reqEnd.isAfter(reqStart) && !reqEnd.isEqual(reqStart)) {
            }

            List<Booking> existing = bookingRepository.findAll();
            boolean overlaps = existing.stream().anyMatch(b -> b.getItem().getId().equals(item.getId()) &&
                    (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.ACTIVE) &&
                    datesOverlap(reqStart, reqEnd, b.getStartDate(), b.getEndDate()));

            if (overlaps) {
                throw new IllegalStateException("Item not available for the selected dates");
            }
        }

        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new IllegalArgumentException("Borrower not found"));

        Booking booking = new Booking();
        booking.setBorrower(borrower);
        booking.setItem(item);
        booking.setStartDate(reqStart);
        booking.setEndDate(reqEnd);

        if (item.getPriceUnit() == com.agarly.backend.models.Enums.PriceUnit.HOUR) {
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getEndTime());
        }

        booking.setStatus(BookingStatus.AWAITING_PAYMENT);

        Booking savedBooking = bookingRepository.save(booking);

        return savedBooking;
    }

    private boolean datesOverlap(LocalDate s1, LocalDate e1, LocalDate s2, LocalDate e2) {
        // Overlap if (StartA <= EndB) and (EndA >= StartB)
        return !e1.isBefore(s2) && !s1.isAfter(e2);
    }

    private boolean hourlyOverlap(java.time.LocalDateTime s1, java.time.LocalDateTime e1, Booking existing) {
        // If existing booking is daily, treat it as full day coverage
        if (existing.getStartTime() == null || existing.getEndTime() == null) {
            java.time.LocalDateTime s2 = existing.getStartDate().atStartOfDay();
            java.time.LocalDateTime e2 = existing.getEndDate().plusDays(1).atStartOfDay(); // until next day start
            return !e1.isBefore(s2) && !s1.isAfter(e2);
        } else {
            // Existing is also hourly
            java.time.LocalDateTime s2 = java.time.LocalDateTime.of(existing.getStartDate(), existing.getStartTime());
            java.time.LocalDateTime e2 = java.time.LocalDateTime.of(existing.getEndDate(), existing.getEndTime());
            return !e1.isBefore(s2) && !s1.isAfter(e2);
        }
    }

    public Booking updateStatus(Long id, UpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        BookingStatus target = request.getStatus();
        BookingStatus currentStatus = booking.getStatus();
        String borrowerUsername = booking.getBorrower().getUsername();

        if (currentStatus == BookingStatus.AWAITING_PAYMENT && target == BookingStatus.PENDING) {
            // Payment confirmed, now we notify the owner
            String ownerUsername = booking.getItem().getOwner().getUsername();
            eventService.publishEvent(new SSE("BOOKING_CREATED", List.of(ownerUsername)));
        }

        if (currentStatus == BookingStatus.PENDING && target == BookingStatus.APPROVED) {
            // Find the PAYMENT transaction for this booking
            com.agarly.backend.models.Transaction paymentTx = transactionRepository.findAll().stream()
                    .filter(t -> t.getBooking() != null && t.getBooking().getId().equals(booking.getId()) &&
                            t.getType() == com.agarly.backend.models.Enums.TransactionType.PAYMENT &&
                            t.getStatus() == com.agarly.backend.models.Enums.TransactionStatus.COMPLETED)
                    .findFirst()
                    .orElse(null);

            if (paymentTx != null) {
                paymentService.transferMoneyToOwner(paymentTx);
            } else {
                // If no payment found (maybe free item or error?), we proceed but log it?
                // Or maybe blocking is required? For now proceed. (TODO)
                System.out.println(
                        "Warning: No completed payment found for booking " + booking.getId() + " when approving.");
            }

            booking.getItem().setBorrower(booking.getBorrower());
            // Update rental status to RESERVED or wait until start date?
            // Current flow updates borrower immediately.
            itemRepository.save(booking.getItem());
            // Notify borrower that booking was approved
            eventService.publishEvent(new SSE("BOOKING_APPROVED", List.of(borrowerUsername)));
        }

        if (currentStatus == BookingStatus.PENDING && target == BookingStatus.REJECTED) {
            // Notify borrower that booking was rejected
            eventService.publishEvent(new SSE("BOOKING_REJECTED", List.of(borrowerUsername)));

            // Handle refund logic here
            // create a REFUND transaction record for visibility.
            com.agarly.backend.models.Transaction paymentTx = transactionRepository.findAll().stream()
                    .filter(t -> t.getBooking() != null && t.getBooking().getId().equals(booking.getId()) &&
                            t.getType() == com.agarly.backend.models.Enums.TransactionType.PAYMENT &&
                            t.getStatus() == com.agarly.backend.models.Enums.TransactionStatus.COMPLETED)
                    .findFirst()
                    .orElse(null);

            if (paymentTx != null) {
                com.agarly.backend.models.Transaction refund = new com.agarly.backend.models.Transaction();
                refund.setUser(booking.getBorrower());
                refund.setAmount(paymentTx.getAmount());
                refund.setType(com.agarly.backend.models.Enums.TransactionType.REFUND);
                refund.setStatus(com.agarly.backend.models.Enums.TransactionStatus.COMPLETED); // Assuming instant
                // wallet refund or
                // manual process
                refund.setDescription("Refund for rejected booking: " + booking.getItem().getTitle());
                refund.setReferenceNumber("REF-" + System.currentTimeMillis());
                refund.setBooking(booking);
                refund.setCreatedAt(java.time.LocalDateTime.now(java.time.ZoneId.of("Africa/Cairo")));
                transactionRepository.save(refund);

                // Update wallet balance (Refund to wallet credits)
                User borrower = booking.getBorrower();
                java.math.BigDecimal currentBalance = borrower.getWalletBalance() != null ? borrower.getWalletBalance()
                        : java.math.BigDecimal.ZERO;
                borrower.setWalletBalance(currentBalance.add(paymentTx.getAmount()));
                userRepository.save(borrower);
                // For now, it's just a record that money should be returned (e.g. via Paymob
                // portal manually).
            }
        }

        if (currentStatus == BookingStatus.APPROVED && target == BookingStatus.COMPLETED) {
            booking.getItem().setBorrower(null);
            itemRepository.save(booking.getItem());
            // Notify both parties that item was returned
            String ownerUsername = booking.getItem().getOwner().getUsername();
            eventService.publishEvent(new SSE("ITEM_RETURNED", List.of(ownerUsername, borrowerUsername)));
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