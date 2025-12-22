package com.agarly.backend.controllers;

import com.agarly.backend.dtos.CreateBookingRequest;
import com.agarly.backend.dtos.UpdateBookingRequest;
import com.agarly.backend.models.Booking;
import com.agarly.backend.models.UserPrincipal;
import com.agarly.backend.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public Booking createBooking(@AuthenticationPrincipal UserPrincipal principal, @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(principal.getId(), request);
    }

    @PutMapping("/{id}/status")
    public Booking updateStatus(@PathVariable Long id, @RequestBody UpdateBookingRequest request) {
        return bookingService.updateStatus(id, request);
    }

    @GetMapping
    public List<Booking> getAllRequests(@AuthenticationPrincipal UserPrincipal principal) {
        return bookingService.getAllRequests(principal.getId());
    }

    @GetMapping("/sent")
    public List<Booking> getAllSentRequests(@AuthenticationPrincipal UserPrincipal principal) {
        return bookingService.getSentRequests(principal.getId());
    }


}
