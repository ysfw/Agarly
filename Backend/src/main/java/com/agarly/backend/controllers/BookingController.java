package com.agarly.backend.controllers;

import com.agarly.backend.services.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public void createBooking() {
        bookingService.createBooking();
    }

    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id) {
        bookingService.updateStatus();
    }
}
