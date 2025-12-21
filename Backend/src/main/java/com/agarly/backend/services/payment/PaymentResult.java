package com.agarly.backend.services.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResult {
    private String providerName; // "CARD", "WALLET", or "FAWRY"
    private boolean success; // Whether initiation succeeded
    private String errorMessage; // Error message if success=false

    // For CARD payments
    private String paymentKey; // Use in Paymob iframe
    private String iframeId; // Paymob iframe ID

    // For WALLET payments (Vodafone Cash)
    private String redirectUrl; // Redirect user here

    // For FAWRY payments
    private String fawryReference; // Reference number to pay at store

    // Common
    private String orderId; // Paymob order ID for tracking
}
