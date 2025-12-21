package com.agarly.backend.dtos;

import lombok.Data;

@Data
public class InitiatePaymentRequest {
    private Double amount; // Amount in EGP, e.g., 100.00
    private String method; // "CARD", "WALLET", or "FAWRY"
    private String phoneNumber; // Required for WALLET payments (Vodafone Cash phone)
    private Long bookingId; // Optional - links to a booking
    private String description; // "Rental: Power Drill - 3 days"
}
