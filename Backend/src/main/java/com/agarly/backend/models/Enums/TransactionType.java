package com.agarly.backend.models.Enums;

public enum TransactionType {
    PAYMENT,     // User paid for a rental
    PAYOUT,      // User received money from their item being rented
    REFUND,      // Money returned to user
    HOLD,        // Money temporarily frozen
    RELEASE,     // Frozen money unfrozen
    DEPOSIT,     // User added money to wallet
    WITHDRAWAL   // User withdrew money from wallet
}
