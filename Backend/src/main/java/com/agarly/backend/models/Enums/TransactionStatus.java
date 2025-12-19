package com.agarly.backend.models.Enums;

public enum TransactionStatus {
    PENDING,      // Just started, waiting
    PROCESSING,   // Being handled by payment provider
    COMPLETED,    // Finished successfully
    FAILED,       // Didn't work (card declined, etc.)
    CANCELLED,    // User or system cancelled
    REFUNDED      // Money was returned
}
