package com.agarly.backend.services;

import com.agarly.backend.repos.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    public void createBooking() {
        // Validates availability and creates booking
    }

    public void updateStatus() {
        // Handles status transitions
    }
}
