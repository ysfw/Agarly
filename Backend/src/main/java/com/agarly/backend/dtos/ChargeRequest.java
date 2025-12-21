package com.agarly.backend.dtos;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChargeRequest {
    private Long paymentMethodId;    // Which card to charge
    private BigDecimal amount;       // How much to charge
    private Long bookingId;          // What booking this payment is for (optional)
    private String description;      // "Rental: Power Drill - 3 days"
}