package com.agarly.backend.models.Enums;

public enum PaymentProvider {
    STRIPE,           // International cards
    PAYPAL,           // PayPal accounts
    PAYMOB,           // Egyptian payment gateway
    FAWRY,            // Egyptian cash payment
    VODAFONE_CASH,    // Egyptian mobile wallet
    ORANGE_CASH,      // Egyptian mobile wallet
    INSTAPAY,         // Egyptian bank transfer
    BANK_TRANSFER     // Manual bank transfer
}
