package com.agarly.backend.services.payment;

import com.agarly.backend.models.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentContext {
    private User user; // The user making the payment
    private double amount; // Amount in EGP
    private String phoneNumber; // Required for wallet payments (Vodafone Cash)
    private Long bookingId; // Optional - links payment to a booking
    private String description; // Human-readable description

    // Paymob tokens (populated by PaymentService before calling strategy)
    private String authToken; // Paymob auth token
    private String orderId; // Paymob order ID
    private String paymentKey; // Paymob payment key
}
