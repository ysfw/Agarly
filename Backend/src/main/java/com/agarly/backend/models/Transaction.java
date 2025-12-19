package com.agarly.backend.models;

import com.agarly.backend.models.Enums.TransactionStatus;
import com.agarly.backend.models.Enums.TransactionType;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Africa/Cairo"));
    private LocalDateTime updatedAt;

    @ManyToOne
    private User user;

    @ManyToOne
    private Booking booking;

    @ManyToOne
    private PaymentMethod paymentMethod;

    // Human-readable description
    private String description;

    // External reference from payment provider
    private String referenceNumber;

    // Platform fee
    private BigDecimal fee;

    // if the borrower ruins the item or smth
    private BigDecimal insuranceFee;

    // Net amount after fee + insuranceFee
    private BigDecimal netAmount;
}
