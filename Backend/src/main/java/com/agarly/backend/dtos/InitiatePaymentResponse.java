package com.agarly.backend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InitiatePaymentResponse {
    private boolean success;
    private String errorMessage;

    private String method; // Echo back the payment method
    private String orderId; // Paymob order ID for tracking

    // For CARD payments
    private String paymentKey; // Use in Paymob iframe URL
    private String iframeId; // Paymob iframe ID

    // For WALLET payments
    private String redirectUrl; // Redirect user to this URL

    // For FAWRY payments
    private String fawryReference; // Reference number to pay at store
}
